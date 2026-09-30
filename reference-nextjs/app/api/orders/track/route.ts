import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();

  if (!orderNumber) {
    return Response.json(
      { success: false, error: "Order number is required" },
      { status: 400 }
    );
  }

  if (!prisma) {
    return Response.json(
      { success: false, error: "Database not connected" },
      { status: 503 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        address: true,
        subtotal: true,
        deliveryCharge: true,
        total: true,
        paymentMethod: true,
        status: true,
        adminNote: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            productTitle: true,
            productImage: true,
            price: true,
            quantity: true,
            lineTotal: true,
          },
        },
      },
    });

    if (!order) {
      return Response.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, order });
  } catch (error) {
    console.error("Order track error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
