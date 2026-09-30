import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

// Static, content-bearing routes we always want indexed. Transactional pages
// (cart, checkout, account, thank-you, track-order) are intentionally excluded
// and are also blocked in robots.ts.
const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "shop", changeFrequency: "daily", priority: 0.9 },
  { path: "blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "about", changeFrequency: "monthly", priority: 0.5 },
  { path: "contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "how-to-order", changeFrequency: "monthly", priority: 0.5 },
  { path: "support", changeFrequency: "monthly", priority: 0.4 },
  { path: "careers", changeFrequency: "monthly", priority: 0.3 },
  { path: "press", changeFrequency: "monthly", priority: 0.3 },
  { path: "shipping-info", changeFrequency: "yearly", priority: 0.3 },
  { path: "delivery-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "refund-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "terms-of-use", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.map((r) => ({
    url: r.path ? `${SITE_URL}/${r.path}` : SITE_URL,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    const [categories, products, blogPosts, pages] = await Promise.all([
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: {
          slug: true,
          updatedAt: true,
          images: { select: { imageUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true, coverImage: true },
      }),
      prisma.page.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = (categories as { slug: string; updatedAt: Date }[]).map((cat) => ({
      url: `${SITE_URL}/shop?category=${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = (products as { slug: string; updatedAt: Date; images: { imageUrl: string }[] }[]).map((product) => {
      const image = absoluteUrl(product.images[0]?.imageUrl);
      return {
        url: `${SITE_URL}/product/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
        ...(image ? { images: [image] } : {}),
      };
    });

    const blogRoutes: MetadataRoute.Sitemap = (blogPosts as { slug: string; updatedAt: Date; coverImage: string }[]).map((post) => {
      const image = absoluteUrl(post.coverImage);
      return {
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
        ...(image ? { images: [image] } : {}),
      };
    });

    // Custom CMS pages served from app/(public)/[slug]. Skip any that collide
    // with a static route above.
    const staticSlugs = new Set(STATIC_PATHS.map((r) => r.path));
    const cmsRoutes: MetadataRoute.Sitemap = (pages as { slug: string; updatedAt: Date }[])
      .filter((p) => !staticSlugs.has(p.slug))
      .map((p) => ({
        url: `${SITE_URL}/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly",
        priority: 0.4,
      }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes, ...cmsRoutes];
  } catch {
    return staticRoutes;
  }
}
