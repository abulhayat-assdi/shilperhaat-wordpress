import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const status = searchParams.get("status") || undefined;

    const where = status ? { status: status as any } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
