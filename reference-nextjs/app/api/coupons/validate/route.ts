import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCoupon } from "@/lib/coupon-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal);

    if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ valid: false, discount: 0, message: "Invalid request." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) {
      return NextResponse.json({ valid: false, discount: 0, message: "Invalid coupon code." });
    }

    const result = validateCoupon(
      {
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        minOrderAmount: Number(coupon.minOrderAmount),
        type: coupon.type,
        value: Number(coupon.value),
      },
      subtotal
    );

    return NextResponse.json({ ...result, code });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json({ valid: false, discount: 0, message: "Something went wrong." }, { status: 500 });
  }
}
