import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { images = [], tags = [], ...data } = body;

    const product = await prisma.product.create({
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
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
