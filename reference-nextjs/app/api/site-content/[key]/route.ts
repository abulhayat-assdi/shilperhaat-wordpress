import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_KEYS = ["site-layout", "contact-widget"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    return NextResponse.json({ value: row?.value ?? null });
  } catch (error) {
    console.error("GET /api/site-content/[key] error:", error);
    return NextResponse.json({ value: null });
  }
}
