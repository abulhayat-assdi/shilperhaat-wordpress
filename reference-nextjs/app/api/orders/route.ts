import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCoupon } from "@/lib/coupon-data";
import { sendMetaEvent, userDataFromRequest } from "@/lib/meta-capi";
import type { Prisma, Product } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Recompute item prices from the database — client-sent prices are ignored
    const rawItems: { productId?: string; productTitle?: string; productImage?: string; quantity?: unknown }[] =
      Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty." }, { status: 400 });
    }

    const productIds = rawItems.map((i) => i.productId).filter(Boolean) as string[];
    const products: Product[] = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

    const orderItems: {
      productId: string | null;
      productTitle: string;
      productImage: string | null;
      price: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const item of rawItems) {
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ success: false, error: "Invalid item quantity." }, { status: 400 });
      }
      const product = item.productId ? productMap.get(item.productId) : undefined;
      if (!product || product.status !== "ACTIVE") {
        return NextResponse.json(
          { success: false, error: "Some items in your cart are no longer available. Please refresh and try again." },
          { status: 400 }
        );
      }
      if (product.stock < quantity) {
        return NextResponse.json(
          { success: false, error: `"${product.title}" does not have enough stock.` },
          { status: 400 }
        );
      }
      const price = Number(product.price);
      orderItems.push({
        productId: product.id,
        productTitle: product.title,
        productImage: item.productImage || null,
        price,
        quantity,
        lineTotal: price * quantity,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);

    const deliveryCharge = Number(body.deliveryCharge);
    if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0 || deliveryCharge > 1000) {
      return NextResponse.json({ success: false, error: "Invalid delivery charge." }, { status: 400 });
    }

    // Coupon is always re-validated server-side; the client-sent total is ignored
    let discount = 0;
    let couponCode: string | null = null;
    let couponId: string | null = null;
    if (body.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: String(body.couponCode).trim().toUpperCase() },
      });
      if (coupon) {
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
        if (!result.valid) {
          return NextResponse.json(
            { success: false, error: result.message || "Coupon is no longer valid." },
            { status: 400 }
          );
        }
        discount = result.discount;
        couponCode = coupon.code;
        couponId = coupon.id;
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid coupon code." },
          { status: 400 }
        );
      }
    }

    const total = subtotal + deliveryCharge - discount;

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
      // Reserve stock; updateMany with the stock guard prevents overselling
      for (const item of orderItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId!, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Insufficient stock for "${item.productTitle}"`);
        }
      }
      return tx.order.create({
        data: {
          orderNumber: body.orderNumber,
          customerName: body.customerName,
          phone: body.phone,
          address: body.address,
          notes: body.notes || null,
          subtotal,
          deliveryCharge,
          discount,
          couponCode,
          total,
          paymentMethod: body.paymentMethod || "COD",
          status: "PENDING",
          items: { create: orderItems },
        },
      });
    });

    // Meta Conversions API — authoritative server-side Purchase. The event_id
    // matches the browser Pixel fired on the thank-you page so Meta deduplicates.
    await sendMetaEvent({
      eventName: "Purchase",
      eventId: `purchase_${order.orderNumber}`,
      eventSourceUrl:
        (typeof body.eventSourceUrl === "string" ? body.eventSourceUrl : null) ||
        req.headers.get("referer"),
      userData: userDataFromRequest(req, {
        phone: typeof body.phone === "string" ? body.phone : null,
        firstName:
          typeof body.customerName === "string" ? body.customerName.split(" ")[0] : null,
      }),
      customData: {
        value: total,
        currency: "BDT",
        content_type: "product",
        content_ids: orderItems.map((i) => i.productId).filter(Boolean) as string[],
        contents: orderItems
          .filter((i) => i.productId)
          .map((i) => ({ id: i.productId as string, quantity: i.quantity, item_price: i.price })),
        num_items: orderItems.reduce((n, i) => n + i.quantity, 0),
        order_id: order.orderNumber,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count(),
    ]);
    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ orders: [], total: 0, page, limit });
  }
}
