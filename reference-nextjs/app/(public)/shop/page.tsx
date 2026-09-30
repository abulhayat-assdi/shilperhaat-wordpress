import type { Metadata } from "next";
import { Suspense } from "react";
import ProductCard from "@/components/ui/ProductCard";
import SearchBar from "@/components/shop/SearchBar";
import ShopFilters from "@/components/shop/ShopFilters";
import { ProductGridSkeleton } from "@/components/ui/ProductCardSkeleton";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products — Shilperhaat",
  description:
    "Browse Shilperhaat's full collection of hand-woven Katha, Chadar, Blankets & Nakshi Katha.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const {
    category: categorySlug,
    sort = "newest",
    minPrice,
    maxPrice,
    search,
    page = "1",
  } = params;

  const currentPage = Math.max(1, parseInt(page));
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  const decodedCategorySlug = categorySlug ? decodeURIComponent(categorySlug) : undefined;

  // Build Prisma where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "ACTIVE" };

  if (decodedCategorySlug) {
    where.category = { slug: decodedCategorySlug };
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "best_selling") orderBy = [{ isBestSelling: "desc" }, { createdAt: "desc" }];

  const [rawProducts, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const products = (rawProducts as any[]).map((p: any) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  }));

  const totalPages = Math.ceil(total / limit);
  const activeCategory = (categories as any[]).find((c: any) => c.slug === decodedCategorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-5 py-4 md:py-6">

      {/* Page title */}
      <div className="mb-3">
        <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 700, color: "#222831", fontFamily: "'Open Sans', sans-serif" }}>
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
          {total} product{total !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Search bar */}
      <SearchBar defaultValue={search || ""} />

      {/*
        ┌─────────────────────────────────────┐
        │  Layout (flex-col on mobile,         │
        │  flex-row on desktop)                │
        └─────────────────────────────────────┘
      */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 mt-3 md:mt-5">
        {/* Filter sidebar / mobile filter bar */}
        <Suspense fallback={null}>
          <ShopFilters categories={categories as any[]} />
        </Suspense>

        {/* Product grid — takes full width on mobile, flex-1 on desktop */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            {products.length === 0 ? (
              <EmptyState search={search} category={activeCategory?.name} />
            ) : (
              <>
                {/* 2 columns on mobile, grow on wider screens */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product as any as Product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination current={currentPage} total={totalPages} params={params} />
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ search, category }: { search?: string; category?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#222831", marginBottom: 8 }}>No products found</h3>
      <p style={{ fontSize: 13, color: "#888", maxWidth: 280 }}>
        {search ? `No results for "${search}".`
          : category ? `No products in "${category}" right now.`
          : "No products match the selected filters."}
      </p>
      <a
        href="/shop"
        style={{
          marginTop: 20, display: "inline-block",
          backgroundColor: "#800000", color: "#fff",
          padding: "10px 24px", borderRadius: 999,
          fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}
      >
        View All Products
      </a>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ current, total, params }: {
  current: number;
  total: number;
  params: Record<string, string | undefined>;
}) {
  const buildUrl = (page: number) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v && k !== "page") p.set(k, v); });
    p.set("page", String(page));
    return `/shop?${p.toString()}`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32 }}>
      {current > 1 && (
        <a href={buildUrl(current - 1)} style={{ padding: "8px 16px", border: "1px solid #CCC", borderRadius: 8, fontSize: 13, color: "#222831", textDecoration: "none" }}>
          ← Prev
        </a>
      )}
      {Array.from({ length: total }, (_, i) => i + 1)
        .filter((p) => Math.abs(p - current) <= 2)
        .map((p) => (
          <a key={p} href={buildUrl(p)} style={{
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none",
            backgroundColor: p === current ? "#800000" : "transparent",
            color: p === current ? "#fff" : "#222831",
            border: p === current ? "none" : "1px solid #CCC",
          }}>
            {p}
          </a>
        ))}
      {current < total && (
        <a href={buildUrl(current + 1)} style={{ padding: "8px 16px", border: "1px solid #CCC", borderRadius: 8, fontSize: 13, color: "#222831", textDecoration: "none" }}>
          Next →
        </a>
      )}
    </div>
  );
}
