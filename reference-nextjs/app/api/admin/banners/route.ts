import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ banners });
  } catch (error) {
    console.error("GET /api/admin/banners error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }
    const banner = await prisma.banner.create({
      data: {
        title: body.title || null,
        subtitle: body.subtitle || null,
        imageUrl: body.imageUrl,
        mobileImageUrl: body.mobileImageUrl || null,
        buttonText: body.buttonText || null,
        buttonLink: body.buttonLink || null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ banner });
  } catch (error) {
    console.error("POST /api/admin/banners error:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
