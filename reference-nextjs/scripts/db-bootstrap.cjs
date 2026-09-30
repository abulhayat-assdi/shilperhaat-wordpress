// Idempotent DB schema bootstrap that runs on container start.
//
// Why not `prisma migrate deploy`? The Prisma CLI is a devDependency with a
// large native-engine + transitive dependency closure that does not survive
// Next.js standalone tracing, so it crashes inside the runtime image and the
// new tables never get created. This script instead replays every committed
// migration's SQL using `pg` — which the app already bundles for its DB
// connection — and ignores "already exists" errors so it is safe to run on
// every boot, whether the database is empty or already partially migrated.
//
// CommonJS (.cjs) + require("pg") on purpose: the standalone build only traces
// pg's CommonJS entry (./lib), so an ESM `import "pg"` resolves to the missing
// ./esm/index.mjs and crashes. require() resolves to ./lib/index.js, exactly
// like lib/prisma.ts does at runtime.

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

// Postgres "object already exists" SQLSTATEs — safe to ignore so re-running
// over an already-applied migration is a no-op.
const IGNORABLE = new Set([
  "42P07", // duplicate_table (also covers indexes)
  "42710", // duplicate_object (enums, constraints)
  "42701", // duplicate_column
  "42P06", // duplicate_schema
  "42723", // duplicate_function
]);

function splitStatements(sql) {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[db-bootstrap] DATABASE_URL is not set — skipping");
    return;
  }

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  let dirs = [];
  try {
    dirs = fs
      .readdirSync(migrationsDir)
      .filter((d) => fs.existsSync(path.join(migrationsDir, d, "migration.sql")))
      .sort(); // timestamp-prefixed names sort chronologically
  } catch (err) {
    console.error("[db-bootstrap] cannot read migrations dir:", err.message);
    return;
  }

  const pool = new Pool({ connectionString: url });
  let applied = 0;
  let skipped = 0;

  try {
    for (const dir of dirs) {
      const sql = fs.readFileSync(path.join(migrationsDir, dir, "migration.sql"), "utf8");
      for (const stmt of splitStatements(sql)) {
        try {
          await pool.query(stmt);
          applied++;
        } catch (err) {
          if (IGNORABLE.has(err.code)) {
            skipped++;
            continue;
          }
          console.error(`[db-bootstrap] FAILED in ${dir}: ${err.message}`);
          throw err;
        }
      }
    }
    console.log(`[db-bootstrap] schema ready — ${applied} statements applied, ${skipped} already existed`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  // Never block server startup — the site (products/orders) must stay up even
  // if this fails; the admin CMS pages will surface a clear error if so.
  console.error("[db-bootstrap] error:", err.message);
});
