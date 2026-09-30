import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGES, PageContent, PageSection } from "@/lib/pages-data";
import type { Prisma } from "@prisma/client";

// Top-level routes that are real app pages (not editable DB pages).
// Links pointing at these must never auto-create a Page row.
const RESERVED_SLUGS = new Set([
  "account",
  "blog",
  "cart",
  "checkout",
  "product",
  "shop",
  "thank-you",
  "track-order",
  "admin",
  "api",
  "uploads",
]);

// Turns an internal href like "/naim" into a page slug, or returns null
// for external URLs, query links (/shop?category=x), nested paths and
// reserved app routes.
export function extractPageSlug(href: string): string | null {
  if (!href || !href.startsWith("/")) return null;
  const path = href.split(/[?#]/)[0];
  const segments = path.split("/").filter(Boolean);
  if (segments.length !== 1) return null;
  const slug = segments[0].toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;
  if (RESERVED_SLUGS.has(slug)) return null;
  return slug;
}

// Creates a placeholder Page row for every internal link whose slug does
// not exist yet, so links added in Site Layout never lead to a 404 and
// show up in the Pages Manager for editing. Returns the created slugs.
export async function ensurePagesForLinks(
  links: { href?: unknown; label?: unknown }[]
): Promise<string[]> {
  const bySlug = new Map<string, string>();
  for (const link of links) {
    const slug = extractPageSlug(typeof link.href === "string" ? link.href : "");
    if (!slug || bySlug.has(slug)) continue;
    const label = typeof link.label === "string" && link.label.trim() ? link.label.trim() : slug;
    bySlug.set(slug, label);
  }
  if (bySlug.size === 0) return [];

  await ensurePagesSeeded();
  const existing = await prisma.page.findMany({
    where: { slug: { in: [...bySlug.keys()] } },
    select: { slug: true },
  });
  for (const p of existing) bySlug.delete(p.slug);
  if (bySlug.size === 0) return [];

  await prisma.page.createMany({
    data: [...bySlug.entries()].map(([slug, label]) => ({
      slug,
      title: label,
      subtitle: "",
      sections: [
        {
          id: `${slug}-s1`,
          title: "Main Content",
          content: `<p>Write the content for ${label} here.</p>`,
          order: 1,
        },
      ] as unknown as Prisma.InputJsonValue,
      metaTitle: `${label} - Shilperhaat`,
      metaDescription: label,
      isPublished: true,
    })),
    skipDuplicates: true,
  });
  return [...bySlug.keys()];
}

// Seeds the pages table from DEFAULT_PAGES on first use, so existing
// content is preserved while all subsequent edits live in the database.
export async function ensurePagesSeeded(): Promise<void> {
  const count = await prisma.page.count();
  if (count > 0) return;
  await prisma.page.createMany({
    data: DEFAULT_PAGES.map((p) => ({
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      sections: p.sections as unknown as Prisma.InputJsonValue,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      isPublished: p.isPublished,
    })),
    skipDuplicates: true,
  });
}

export function serializePage(p: {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  sections: unknown;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  updatedAt: Date;
}): PageContent {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    sections: (Array.isArray(p.sections) ? p.sections : []) as PageSection[],
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    isPublished: p.isPublished,
    updatedAt: p.updatedAt.toISOString(),
  };
}

// Returns the published page from the DB. Falls back to the bundled
// defaults when the database is unreachable (e.g. during `next build`).
export async function getPublishedPage(slug: string): Promise<PageContent | null> {
  try {
    await ensurePagesSeeded();
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) return DEFAULT_PAGES.find((p) => p.slug === slug && p.isPublished) || null;
    if (!page.isPublished) return null;
    return serializePage(page);
  } catch {
    return DEFAULT_PAGES.find((p) => p.slug === slug && p.isPublished) || null;
  }
}

export async function getPageMetadata(slug: string): Promise<{ title: string; description: string }> {
  const page = await getPublishedPage(slug);
  const fallback = DEFAULT_PAGES.find((p) => p.slug === slug);
  return {
    title: page?.metaTitle || fallback?.metaTitle || "Shilperhaat",
    description: page?.metaDescription || fallback?.metaDescription || "",
  };
}
