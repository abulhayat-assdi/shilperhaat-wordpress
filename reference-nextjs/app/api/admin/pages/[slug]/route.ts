import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePage } from "@/lib/pages";
import { dbErrorResponse } from "@/lib/api-errors";
import type { Prisma } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  try {
    const body = await req.json();
    const data: Prisma.PageUpdateInput = {};

    if (body.title !== undefined) data.title = String(body.title);
    if (body.subtitle !== undefined) data.subtitle = String(body.subtitle);
    if (body.metaTitle !== undefined) data.metaTitle = String(body.metaTitle);
    if (body.metaDescription !== undefined) data.metaDescription = String(body.metaDescription);
    if (body.isPublished !== undefined) data.isPublished = !!body.isPublished;
    if (body.sections !== undefined) {
      if (!Array.isArray(body.sections)) {
        return NextResponse.json({ error: "sections must be an array" }, { status: 400 });
      }
      data.sections = body.sections as Prisma.InputJsonValue;
    }

    const page = await prisma.page.update({ where: { slug }, data });

    // Make the public page pick up the change immediately
    revalidatePath(`/${slug}`);

    return NextResponse.json({ page: serializePage(page) });
  } catch (error) {
    return dbErrorResponse("PUT /api/admin/pages/[slug]", error);
  }
}
