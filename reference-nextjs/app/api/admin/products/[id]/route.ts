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
    const body = await req.json();
    const { images = [], tags = [], ...data } = body;

    await prisma.productImage.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        stock: data.stock ?? 0,
        categoryId: data.categoryId || null,
        isFeatured: data.isFeatured ?? false,
        isBestSelling: data.isBestSelling ?? false,
        status: data.status ?? "ACTIVE",
        sku: data.sku || null,
        tags,
        videoUrl: data.videoUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        youtubeVideoId: data.youtubeVideoId || null,
        images: {
          create: images.map((url: string, i: number) => ({
            imageUrl: url,
            sortOrder: i,
          })),
        },
      },
    });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "এই slug দিয়ে আগেই একটি প্রোডাক্ট আছে। অন্য একটি title/slug ব্যবহার করুন।" }, { status: 409 });
    }
    console.error("PUT /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
