import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
    const { name, slug, isFeatured, sortOrder, imageUrl } = await req.json();
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        slug: slug?.trim(),
        isFeatured,
        sortOrder,
        imageUrl: imageUrl || null,
      },
    });
    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "এই slug দিয়ে আগেই একটি ক্যাটাগরি আছে। অন্য একটি slug ব্যবহার করুন।" }, { status: 409 });
    }
    console.error("PUT /api/admin/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
