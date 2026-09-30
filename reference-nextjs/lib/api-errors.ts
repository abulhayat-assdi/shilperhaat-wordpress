import { NextResponse } from "next/server";

// Turns a thrown DB error into a clear, actionable API response.
// The most common production cause is a pending migration: the new CMS
// tables (coupons/pages/blog_posts/site_content) don't exist yet because
// `prisma migrate deploy` hasn't run. A generic "Failed to ..." message
// hides that, so we detect it and tell the admin exactly what to do.
export function dbErrorResponse(context: string, error: unknown): NextResponse {
  console.error(`${context} error:`, error);

  const message = error instanceof Error ? error.message : String(error ?? "");
  const code = (error as { code?: string } | null)?.code;

  // P2021: table does not exist · P2022: column does not exist
  const tableMissing =
    code === "P2021" ||
    code === "P2022" ||
    /does not exist|relation .* does not exist|undefined table|undefined column/i.test(message);

  if (tableMissing) {
    return NextResponse.json(
      {
        error:
          "Database not up to date — a required table is missing. Redeploy the app so the database migration runs (prisma migrate deploy), then try again.",
      },
      { status: 503 }
    );
  }

  // P1001/P1002: cannot reach the database server
  const unreachable =
    code === "P1001" ||
    code === "P1002" ||
    /can'?t reach database|connection refused|ECONNREFUSED|timed out/i.test(message);

  if (unreachable) {
    return NextResponse.json(
      { error: "Could not reach the database. Please check the server and try again." },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
