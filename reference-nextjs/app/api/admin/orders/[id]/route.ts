import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.adminNote !== undefined) updateData.adminNote = body.adminNote;
    if (body.courierConsignmentId !== undefined) updateData.courierConsignmentId = body.courierConsignmentId;
    if (body.courierTrackingCode !== undefined) updateData.courierTrackingCode = body.courierTrackingCode;
    if (body.courierStatus !== undefined) updateData.courierStatus = body.courierStatus;
    if (body.courierSentAt !== undefined) updateData.courierSentAt = body.courierSentAt ? new Date(body.courierSentAt) : null;

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Restore stock when an order is cancelled (once)
      if (body.status === "CANCELLED") {
        const existing = await tx.order.findUnique({ where: { id }, include: { items: true } });
        if (existing && existing.status !== "CANCELLED") {
          for (const item of existing.items) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }
      }
      return tx.order.update({
        where: { id },
        data: updateData,
        include: { items: true },
      });
    });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("PUT /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
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
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!existing) return;

      // Return reserved stock unless it was already restored on cancellation
      if (existing.status !== "CANCELLED") {
        for (const item of existing.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // OrderItems cascade-delete via the schema's onDelete: Cascade
      await tx.order.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
