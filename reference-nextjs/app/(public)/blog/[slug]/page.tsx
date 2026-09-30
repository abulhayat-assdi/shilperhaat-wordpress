import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

// Deduplicate the DB call between generateMetadata and the page render.
const getPost = cache(async (slug: string) => {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) return null;
  return post;
});

function formatDate(iso: string | Date): string {
  const d = new Date(iso);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  if (!post) return { title: "Post not found" };

  const description = post.excerpt?.slice(0, 160) || post.title;
  const image = absoluteUrl(post.coverImage);

  return {
    title: post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: image ? [image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  if (!post) notFound();

  const image = absoluteUrl(post.coverImage);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(image ? { image: [image] } : {}),
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
    publisher: {
      "@type": "Organization",
      name: "Shilperhaat",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#800000] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#800000] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{post.title}</span>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full overflow-hidden" style={{ maxHeight: 480 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full object-cover"
            style={{ maxHeight: 480 }}
          />
        </div>
      )}

      {/* Article */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          {/* Category badge */}
          {post.category && (
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-4"
              style={{ backgroundColor: "#800000" }}
            >
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-5">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-gray-100 mb-8">
            {post.author && (
              <>
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: "#800000" }}
                >
                  {post.author.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-gray-700">{post.author}</span>
                <span className="text-gray-300">|</span>
              </>
            )}
            <span className="text-sm text-gray-500">{formatDate(post.publishedAt)}</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{post.readTime} min read</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-[#FFF0F0] text-[#800000] border border-[#f5d0d0]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content — trusted HTML authored in the admin panel, rendered on the
              server so search engines can index the full article. */}
          <div
            className="blog-content text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back button */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-semibold text-sm transition-all border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
            >
              ← Back to Blog
            </Link>
          </div>
        </article>
      </div>

      <style>{`
        .blog-content h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1a1208;
          margin: 1.5rem 0 0.6rem;
          line-height: 1.35;
        }
        .blog-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin: 1.2rem 0 0.5rem;
          line-height: 1.4;
        }
        .blog-content p {
          margin: 0 0 1rem;
          color: #555;
          line-height: 1.8;
        }
        .blog-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.75rem 0 1rem;
        }
        .blog-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.75rem 0 1rem;
        }
        .blog-content li {
          margin-bottom: 0.35rem;
          color: #555;
          line-height: 1.7;
        }
        .blog-content a {
          color: #800000;
          text-decoration: underline;
        }
        .blog-content strong {
          font-weight: 700;
          color: #1a1208;
        }
      `}</style>
    </div>
  );
}
