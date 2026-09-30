import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private, transactional and non-content routes out of the index.
        disallow: [
          "/admin",
          "/api/",
          "/account",
          "/cart",
          "/checkout",
          "/thank-you",
          "/track-order",
          "/*?*add-to-cart=", // any add-to-cart action links
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
