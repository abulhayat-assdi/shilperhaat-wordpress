import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBlogPost } from "@/lib/blog-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.isPublished) {
      return NextResponse.json({ post: null }, { status: 404 });
    }
    return NextResponse.json({ post: serializeBlogPost(post) });
  } catch (error) {
    console.error("GET /api/blog/[slug] error:", error);
    return NextResponse.json({ post: null }, { status: 500 });
  }
}
