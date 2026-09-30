import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensurePagesForLinks } from "@/lib/pages";
import { dbErrorResponse } from "@/lib/api-errors";
import type { Prisma } from "@prisma/client";

const ALLOWED_KEYS = ["site-layout", "contact-widget"];

type LinkLike = { href?: unknown; label?: unknown };

// Pulls every internal link out of the site-layout payload (footer link
// groups, nav items and their dropdowns) so missing pages can be created.
function collectSiteLayoutLinks(value: unknown): LinkLike[] {
  if (!value || typeof value !== "object") return [];
  const layout = value as {
    footerLinks?: Record<string, LinkLike[]>;
    navItems?: (LinkLike & { dropdown?: LinkLike[] })[];
  };
  const links: LinkLike[] = [];
  if (layout.footerLinks && typeof layout.footerLinks === "object") {
    for (const group of Object.values(layout.footerLinks)) {
      if (Array.isArray(group)) links.push(...group);
    }
  }
  if (Array.isArray(layout.navItems)) {
    for (const item of layout.navItems) {
      links.push(item);
      if (Array.isArray(item.dropdown)) links.push(...item.dropdown);
    }
  }
  return links;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const body = await req.json();
    if (body.value === undefined || body.value === null) {
      return NextResponse.json({ error: "value is required" }, { status: 400 });
    }
    const value = body.value as Prisma.InputJsonValue;
    const row = await prisma.siteContent.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    // Auto-create editable pages for any new internal links, so they
    // render immediately instead of 404ing.
    if (key === "site-layout") {
      try {
        const created = await ensurePagesForLinks(collectSiteLayoutLinks(value));
        for (const slug of created) revalidatePath(`/${slug}`);
      } catch (error) {
        console.error("Failed to auto-create pages for site-layout links", error);
      }
    }

    return NextResponse.json({ value: row.value });
  } catch (error) {
    return dbErrorResponse("PUT /api/admin/site-content/[key]", error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await prisma.siteContent.deleteMany({ where: { key } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return dbErrorResponse("DELETE /api/admin/site-content/[key]", error);
  }
}
