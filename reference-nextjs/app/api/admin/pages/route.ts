import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensurePagesSeeded, serializePage } from "@/lib/pages";
import { dbErrorResponse } from "@/lib/api-errors";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensurePagesSeeded();
    const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });
    return NextResponse.json({ pages: pages.map(serializePage) });
  } catch (error) {
    return dbErrorResponse("GET /api/admin/pages", error);
  }
}
