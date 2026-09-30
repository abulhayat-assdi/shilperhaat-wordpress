import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBlogPost, estimateReadTime } from "@/lib/blog-data";
import { dbErrorResponse } from "@/lib/api-errors";
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
    const data: Prisma.BlogPostUpdateInput = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
      data.title = title;
    }
    if (body.slug !== undefined) {
      const slug = String(body.slug).trim();
      if (!slug) return NextResponse.json({ error: "Slug is required." }, { status: 400 });
      const dup = await prisma.blogPost.findFirst({ where: { slug, NOT: { id } } });
      if (dup) return NextResponse.json({ error: "This slug is already in use." }, { status: 409 });
      data.slug = slug;
    }
    if (body.excerpt !== undefined) data.excerpt = String(body.excerpt);
    if (body.content !== undefined) {
      data.content = String(body.content);
      data.readTime = Number(body.readTime) || estimateReadTime(String(body.content));
    }
    if (body.coverImage !== undefined) data.coverImage = String(body.coverImage);
    if (body.author !== undefined) data.author = String(body.author);
    if (body.category !== undefined) data.category = String(body.category);
    if (body.tags !== undefined) data.tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    if (body.isPublished !== undefined) data.isPublished = !!body.isPublished;

    const post = await prisma.blogPost.update({ where: { id }, data });
    return NextResponse.json({ post: serializeBlogPost(post) });
  } catch (error) {
    return dbErrorResponse("PUT /api/admin/blog/[id]", error);
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
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return dbErrorResponse("DELETE /api/admin/blog/[id]", error);
  }
}
