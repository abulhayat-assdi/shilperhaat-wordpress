import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/coupon-data";
import { dbErrorResponse } from "@/lib/api-errors";

const CODE_RE = /^[A-Z0-9_-]{2,20}$/;

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons: coupons.map(serializeCoupon) });
  } catch (error) {
    return dbErrorResponse("GET /api/admin/coupons", error);
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      return NextResponse.json({ error: "Code must be A-Z, 0-9, -, _ only (2–20 characters)." }, { status: 400 });
    }
    const value = Number(body.value);
    if (!value || value <= 0) {
      return NextResponse.json({ error: "Discount value must be greater than zero." }, { status: 400 });
    }
    if (body.type === "PERCENTAGE" && value > 100) {
      return NextResponse.json({ error: "Percentage cannot exceed 100." }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "This code already exists." }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: body.type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        value,
        minOrderAmount: Math.max(0, Number(body.minOrderAmount) || 0),
        maxUses: body.maxUses === null || body.maxUses === undefined ? null : Math.max(1, Number(body.maxUses)),
        isActive: body.isActive ?? true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        description: String(body.description || ""),
      },
    });
    return NextResponse.json({ coupon: serializeCoupon(coupon) });
  } catch (error) {
    return dbErrorResponse("POST /api/admin/coupons", error);
  }
}
