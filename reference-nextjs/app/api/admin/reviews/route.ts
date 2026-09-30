import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reviews = await prisma.review.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: {
        name: body.name.trim(),
        title: body.title || null,
        rating: body.rating ?? 5,
        content: body.content.trim(),
        avatarUrl: body.avatarUrl || null,
        role: body.role || null,
        isVisible: body.isVisible ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ review });
  } catch (error) {
    console.error("POST /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
