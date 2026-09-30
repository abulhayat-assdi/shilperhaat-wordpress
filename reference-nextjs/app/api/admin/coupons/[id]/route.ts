import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/coupon-data";
import { dbErrorResponse } from "@/lib/api-errors";

const CODE_RE = /^[A-Z0-9_-]{2,20}$/;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.code !== undefined) {
      const code = String(body.code).trim().toUpperCase();
      if (!CODE_RE.test(code)) {
        return NextResponse.json({ error: "Code must be A-Z, 0-9, -, _ only (2–20 characters)." }, { status: 400 });
      }
      const dup = await prisma.coupon.findFirst({ where: { code, NOT: { id } } });
      if (dup) return NextResponse.json({ error: "This code already exists." }, { status: 409 });
      data.code = code;
    }
    if (body.type !== undefined) data.type = body.type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED";
    if (body.value !== undefined) {
      const value = Number(body.value);
      if (!value || value <= 0) {
        return NextResponse.json({ error: "Discount value must be greater than zero." }, { status: 400 });
      }
      if ((data.type ?? body.type) === "PERCENTAGE" && value > 100) {
        return NextResponse.json({ error: "Percentage cannot exceed 100." }, { status: 400 });
      }
      data.value = value;
    }
    if (body.minOrderAmount !== undefined) data.minOrderAmount = Math.max(0, Number(body.minOrderAmount) || 0);
    if (body.maxUses !== undefined) data.maxUses = body.maxUses === null ? null : Math.max(1, Number(body.maxUses));
    if (body.isActive !== undefined) data.isActive = !!body.isActive;
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    if (body.description !== undefined) data.description = String(body.description);

    const coupon = await prisma.coupon.update({ where: { id }, data });
    return NextResponse.json({ coupon: serializeCoupon(coupon) });
  } catch (error) {
    return dbErrorResponse("PUT /api/admin/coupons/[id]", error);
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
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return dbErrorResponse("DELETE /api/admin/coupons/[id]", error);
  }
}
