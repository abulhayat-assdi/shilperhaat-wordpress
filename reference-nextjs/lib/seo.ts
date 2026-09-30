// Centralized SEO helpers. Keep the canonical site URL in one place so
// sitemap, robots, metadata and structured data all agree.

export const SITE_URL = (process.env.APP_URL || "https://shilperhaat.com").replace(/\/$/, "");

export const SITE_NAME = process.env.APP_NAME || "Shilperhaat";

/** Build an absolute URL from a path or a possibly-relative image URL. */
export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
