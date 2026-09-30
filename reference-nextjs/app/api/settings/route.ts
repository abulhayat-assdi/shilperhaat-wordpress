import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findFirst();
    return NextResponse.json({
      deliveryCharge: Number(settings?.deliveryCharge ?? 80),
      freeDeliveryMin: settings?.freeDeliveryMin ? Number(settings.freeDeliveryMin) : 2000,
      whatsappNumber: settings?.whatsappNumber ?? "01700000000",
    });
  } catch {
    return NextResponse.json({
      deliveryCharge: 80,
      freeDeliveryMin: 2000,
      whatsappNumber: "01700000000",
    });
  }
}
