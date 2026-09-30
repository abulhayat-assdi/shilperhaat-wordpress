import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartSection, { StickyCartBar } from "@/components/product/AddToCartSection";
import ProductViewTracker from "@/components/product/ProductViewTracker";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCard from "@/components/ui/ProductCard";
import { prisma } from "@/lib/prisma";
import { formatPriceEn, calculateDiscount } from "@/lib/utils";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Deduplicate DB calls between generateMetadata and the page component
const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const product = await getProductBySlug(decodedSlug);
  if (!product) return { title: "Product not found" };
  const image = absoluteUrl(product.images[0]?.imageUrl);
  return {
    title: `${product.title} — Shilperhaat`,
    description: product.description?.slice(0, 160) || product.title,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.description?.slice(0, 160) || "",
      url: `${SITE_URL}/product/${product.slug}`,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const rawProduct = await getProductBySlug(decodedSlug);
  if (!rawProduct) notFound();

  const product = {
    ...rawProduct,
    price: Number(rawProduct.price),
    compareAtPrice: rawProduct.compareAtPrice ? Number(rawProduct.compareAtPrice) : null,
  } as any as Product;

  const discount = product.compareAtPrice
    ? calculateDiscount(Number(product.price), Number(product.compareAtPrice))
    : 0;
  const saveAmount = product.compareAtPrice
    ? Number(product.compareAtPrice) - Number(product.price)
    : 0;

  // Approved reviews for this product
  const reviews: { id: string; name: string; rating: number; content: string; createdAt: Date }[] =
    await prisma.review.findMany({
      where: { productId: product.id, isVisible: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, rating: true, content: true, createdAt: true },
    });

  // Related products from the same category
  const rawRelated = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: "ACTIVE",
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      })
    : [];

  const related = (rawRelated as any[]).map((p: any) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  })) as any as Product[];

  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const images = (product.images || [])
    .map((img: any) => absoluteUrl(img.imageUrl))
    .filter(Boolean) as string[];
  const ratingCount = reviews.length;
  const ratingValue = ratingCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    ...(images.length ? { image: images } : {}),
    ...((rawProduct as any).sku ? { sku: (rawProduct as any).sku } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    brand: { "@type": "Brand", name: "Shilperhaat" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BDT",
      price: Number(product.price).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(ratingCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingValue.toFixed(1),
            reviewCount: ratingCount,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/shop` },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${SITE_URL}/shop?category=${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      <ProductViewTracker
        productId={product.id}
        title={product.title}
        price={Number(product.price)}
      />
      <div style={{ backgroundColor: "#f9f9f9", padding: "24px 0 60px" }}>
        <div className="max-w-7xl mx-auto px-5">

          {/* Breadcrumb */}
          <nav
            className="flex items-center flex-wrap"
            style={{ gap: 6, marginBottom: 20 }}
            aria-label="breadcrumb"
          >
            {[
              { href: "/",     label: "Home"     },
              { href: "/shop", label: "Products" },
              ...(product.category
                ? [{ href: `/shop?category=${product.category.slug}`, label: product.category.name }]
                : []),
            ].map((crumb, i, arr) => (
              <span key={crumb.href} className="flex items-center" style={{ gap: 6 }}>
                <Link
                  href={crumb.href}
                  style={{ fontSize: 13, color: "#888", textDecoration: "none" }}
                  className="hover:text-[#800000] transition-colors"
                >
                  {crumb.label}
                </Link>
                {i < arr.length - 1 && <ChevronRight size={12} style={{ color: "#ccc" }} />}
              </span>
            ))}
            <span className="flex items-center" style={{ gap: 6 }}>
              <ChevronRight size={12} style={{ color: "#ccc" }} />
              <span
                className="line-clamp-1"
                style={{ fontSize: 13, color: "#222", maxWidth: 180, fontFamily: "'Open Sans',sans-serif" }}
              >
                {product.title}
              </span>
            </span>
          </nav>

          {/* Main product grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ gap: 32, alignItems: "start" }}
          >
            {/* Left: gallery */}
            <div>
              <ProductGallery
                images={product.images}
                title={product.title}
                videoUrl={product.videoUrl}
                youtubeVideoId={product.youtubeVideoId}
              />
            </div>

            {/* Right: product info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Category / Brand tag */}
              {product.category && (
                <div>
                  <Link
                    href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
                    style={{
                      display: "inline-block",
                      fontSize: 13, color: "#555",
                      textDecoration: "none",
                      border: "1px solid #ddd",
                      borderRadius: 20,
                      padding: "5px 14px",
                      fontFamily: "'Open Sans',sans-serif",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    className="hover:border-[#800000] hover:text-[#800000] transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}

              {/* Product title */}
              <h1
                style={{
                  fontSize: 28, fontWeight: 700, color: "#222",
                  lineHeight: 1.3, fontFamily: "'Open Sans',sans-serif",
                }}
              >
                {product.title}
              </h1>

              {/* Best seller badge */}
              {product.isBestSelling && (
                <div>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      backgroundColor: "#FF3F33", color: "#FFFFFF",
                      fontSize: 12, fontWeight: 700,
                      padding: "4px 10px", borderRadius: 4,
                      fontFamily: "'Open Sans',sans-serif",
                    }}
                  >
                    🏅 Best Selling
                  </span>
                </div>
              )}

              {/* Price block */}
              <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
                <span
                  style={{
                    fontSize: 26, fontWeight: 700, color: "#800000",
                    fontFamily: "'Open Sans',sans-serif",
                  }}
                >
                  {formatPriceEn(Number(product.price))}
                </span>
                {product.compareAtPrice && (
                  <span style={{ fontSize: 16, color: "#aaa", textDecoration: "line-through" }}>
                    {formatPriceEn(Number(product.compareAtPrice))}
                  </span>
                )}
                {saveAmount > 0 && (
                  <span
                    style={{
                      backgroundColor: "#e8f5e9", color: "#2e7d32",
                      fontSize: 13, fontWeight: 600,
                      padding: "4px 10px", borderRadius: 4,
                      fontFamily: "'Open Sans',sans-serif",
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Add to cart section */}
              <AddToCartSection product={product} />
            </div>
          </div>

          {/* ── Description + Reviews tabs ── */}
          <ProductTabs
            description={product.description || undefined}
            tags={product.tags}
            productId={product.id}
            reviews={reviews.map((r) => ({
              id: r.id,
              name: r.name,
              rating: r.rating,
              content: r.content,
              createdAt: r.createdAt.toISOString(),
            }))}
          />

          {/* Related products */}
          {related.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <div className="flex items-end justify-between" style={{ marginBottom: 24 }}>
                <div className="relative" style={{ paddingBottom: 10 }}>
                  <h2
                    style={{
                      fontSize: 22, fontWeight: 600, color: "#222",
                      fontFamily: "'Open Sans',sans-serif",
                    }}
                  >
                    Related Products
                  </h2>
                  <span
                    className="absolute bottom-0 left-0"
                    style={{ width: 48, height: 3, backgroundColor: "#800000", borderRadius: 2 }}
                  />
                </div>
                {product.category && (
                  <Link
                    href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
                    style={{ color: "#800000", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                    className="hover:underline"
                  >
                    View All →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky cart bar (mobile) */}
      <StickyCartBar product={product} />
    </>
  );
}
