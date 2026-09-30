import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let settings = await prisma.siteSetting.findFirst();
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: { siteName: "Shilperhaat", deliveryCharge: 0 },
      });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    let settings = await prisma.siteSetting.findFirst();

    const data = {
      siteName: body.siteName,
      logoUrl: body.logoUrl ?? null,
      faviconUrl: body.faviconUrl ?? null,
      footerCopyright: body.footerCopyright || null,
      whatsappNumber: body.whatsappNumber || null,
      socialLinks: body.socialLinks ?? null,
      deliveryCharge: body.deliveryCharge ?? 0,
      freeDeliveryMin: body.freeDeliveryMin || null,
    };

    if (settings) {
      settings = await prisma.siteSetting.update({ where: { id: settings.id }, data });
    } else {
      settings = await prisma.siteSetting.create({ data: { ...data, siteName: data.siteName || "Shilperhaat" } });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
