import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/(.*)\\.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.jpeg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.webp",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Not immutable: /favicon.ico is a fixed URL that Google and browsers
        // fetch directly, so a year-long cache would pin an outdated icon.
        source: "/(.*)\\.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },

  turbopack: {},
};

export default nextConfig;
