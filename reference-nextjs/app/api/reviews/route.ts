import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dbErrorResponse } from "@/lib/api-errors";

// Public endpoint: customers submit a product review. Reviews start
// hidden (isVisible: false) and appear only after an admin approves
// them from the Reviews page.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const rating = Number(body.rating);

    if (!productId) {
      return NextResponse.json({ error: "Product is required" }, { status: 400 });
    }
    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: "Please enter your name (2–60 characters)" }, { status: 400 });
    }
    if (content.length < 5 || content.length > 2000) {
      return NextResponse.json({ error: "Review must be 5–2000 characters" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.review.create({
      data: {
        productId,
        name,
        rating,
        content,
        isVisible: false, // pending admin approval
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return dbErrorResponse("POST /api/reviews", error);
  }
}
