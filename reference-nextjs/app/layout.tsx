import type { Metadata } from "next";
import { Open_Sans, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import MetaPixel from "@/components/analytics/MetaPixel";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
  preload: true,
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
  preload: false,
});

async function getSiteSettings() {
  try {
    return await prisma.siteSetting.findFirst();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Shilperhaat";
  const faviconUrl = settings?.faviconUrl || null;
  const logoUrl = settings?.logoUrl;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteName} — Bangladesh's Finest Handcraft Textiles`,
      template: `%s | ${siteName}`,
    },
    description:
      "Shop Bangladesh's best handcraft textiles — Katha, Chadar, Blankets, Nakshi Katha and much more at Shilperhaat.",
    alternates: { canonical: "/" },
    keywords: [
      "katha",
      "nakshi katha",
      "chadar",
      "blanket",
      "handcraft",
      "bangladesh",
      "shilperhaat",
      "textile",
    ],
    // `app/favicon.ico` is picked up by Next automatically and always comes
    // first in the list, so it is not repeated here. These entries add the
    // high-resolution brand PNGs that Google Search and mobile home screens
    // prefer over a 48px .ico. An admin-uploaded favicon overrides them.
    icons: {
      icon: faviconUrl
        ? [{ url: faviconUrl }]
        : [
            { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
            { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
          ],
      apple: faviconUrl || "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      ...(logoUrl && { images: [{ url: logoUrl }] }),
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Shilperhaat";
  const logo = absoluteUrl(settings?.logoUrl);
  const social = (settings?.socialLinks as Record<string, string> | null) || null;
  const sameAs = social ? Object.values(social).filter(Boolean) : [];

  // Site-wide structured data: identifies the brand (Organization) and enables
  // the Google sitelinks search box (WebSite + SearchAction).
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: SITE_URL,
      ...(logo ? { logo } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html lang="en" className={`${openSans.variable} ${hindSiliguri.variable}`}>
      <body className="antialiased overflow-x-hidden">
        <JsonLd data={structuredData} />
        <MetaPixel
          pixelId={process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID}
        />
        {children}
      </body>
    </html>
  );
}
