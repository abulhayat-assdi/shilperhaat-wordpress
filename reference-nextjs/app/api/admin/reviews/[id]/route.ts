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
    const review = await prisma.review.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        title: body.title || null,
        rating: body.rating,
        content: body.content?.trim(),
        avatarUrl: body.avatarUrl || null,
        role: body.role || null,
        isVisible: body.isVisible,
        sortOrder: body.sortOrder,
      },
      include: { product: { select: { title: true, slug: true } } },
    });
    return NextResponse.json({ review });
  } catch (error) {
    console.error("PUT /api/admin/reviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
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
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
