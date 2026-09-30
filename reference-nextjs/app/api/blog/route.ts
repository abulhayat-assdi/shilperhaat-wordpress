import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBlogPost } from "@/lib/blog-data";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json({ posts: posts.map(serializeBlogPost) });
  } catch (error) {
    console.error("GET /api/blog error:", error);
    return NextResponse.json({ posts: [] });
  }
}
