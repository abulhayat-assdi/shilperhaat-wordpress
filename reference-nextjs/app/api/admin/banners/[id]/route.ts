import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: body.title ?? null,
        subtitle: body.subtitle ?? null,
        imageUrl: body.imageUrl,
        mobileImageUrl: body.mobileImageUrl ?? null,
        buttonText: body.buttonText ?? null,
        buttonLink: body.buttonLink ?? null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ banner });
  } catch (error) {
    console.error("PUT /api/admin/banners/[id] error:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/banners/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
