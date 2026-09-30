import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, slug, isFeatured, sortOrder, imageUrl } = await req.json();
    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        isFeatured: isFeatured ?? false,
        sortOrder: sortOrder ?? 0,
        imageUrl: imageUrl || null,
      },
    });
    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "এই slug দিয়ে আগেই একটি ক্যাটাগরি আছে। অন্য একটি slug ব্যবহার করুন।" }, { status: 409 });
    }
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
