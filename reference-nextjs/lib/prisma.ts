// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prisma: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");

  const globalForPrisma = globalThis as unknown as { prisma: any };

  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  prisma = globalForPrisma.prisma;
} catch {
  console.warn("Prisma client not initialized. Run: npx prisma generate");
  prisma = null;
}

export { prisma };
export default prisma;
