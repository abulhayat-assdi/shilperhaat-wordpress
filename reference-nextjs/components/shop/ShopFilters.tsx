"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { X, SlidersHorizontal, Filter } from "lucide-react";
import type { Category } from "@/types";

interface ShopFiltersProps {
  categories: Category[];
}

export default function ShopFilters({ categories }: ShopFiltersProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort     = searchParams.get("sort")     || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSearch   = searchParams.get("search")   || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => router.push(pathname);

  const hasActive = currentCategory || currentMinPrice || currentMaxPrice || currentSearch;

  const sortOptions = [
    { value: "newest",     label: "Newest First"       },
    { value: "price_asc",  label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "best_selling", label: "Best Selling"     },
  ];

  /* ── Reusable filter panel (used in desktop sidebar + mobile drawer) ── */
  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: "#1a1208" }}>Sort By</h3>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="sort" value={opt.value}
                checked={currentSort === opt.value}
                onChange={() => updateFilter("sort", opt.value)}
                className="accent-[#800000]"
              />
              <span className="text-sm" style={{ color: "#4a2c0a" }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: "#1a1208" }}>Category</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio" name="category" value=""
              checked={!currentCategory}
              onChange={() => updateFilter("category", "")}
              className="accent-[#800000]"
            />
            <span className="text-sm" style={{ color: "#4a2c0a" }}>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="category" value={cat.slug}
                checked={currentCategory === cat.slug}
                onChange={() => updateFilter("category", cat.slug)}
                className="accent-[#800000]"
              />
              <span className="text-sm" style={{ color: "#4a2c0a" }}>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: "#1a1208" }}>Price Range (৳)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number" placeholder="Min" value={currentMinPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full border border-[#e0d0b0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]"
          />
          <span className="text-sm flex-shrink-0" style={{ color: "#7a6045" }}>—</span>
          <input
            type="number" placeholder="Max" value={currentMaxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full border border-[#e0d0b0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]"
          />
        </div>
      </div>

      {/* Clear filters */}
      {hasActive && (
        <button
          onClick={clearAll}
          className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
        >
          <X size={13} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    /*
     * Single wrapper div — ONE flex item in the parent.
     * Mobile: w-full so the mobile bar fills the full row (parent is flex-col).
     * Desktop: w-56 flex-shrink-0 sidebar (parent is md:flex-row).
     */
    <div className="w-full md:w-56 md:flex-shrink-0">

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:block bg-white rounded-xl border border-[#e0d0b0] p-5 sticky top-24">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={15} className="text-[#800000]" />
          <h2 className="font-bold text-sm" style={{ color: "#1a1208" }}>Filters</h2>
        </div>
        <FilterPanel />
      </div>

      {/* ── Mobile filter bar (filter button + sort dropdown, side by side) ── */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#e0d0b0] rounded-full text-sm bg-white flex-shrink-0"
          style={{ color: "#4a2c0a" }}
        >
          <Filter size={13} />
          Filters
          {hasActive && (
            <span className="bg-[#800000] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">!</span>
          )}
        </button>

        <select
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="flex-1 border border-[#e0d0b0] rounded-full px-3 py-2 text-sm outline-none bg-white"
          style={{ color: "#4a2c0a" }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── Mobile filter drawer (slide in from right) ── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[60] w-72 bg-white p-5 overflow-y-auto md:hidden shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold" style={{ color: "#1a1208" }}>Filters</h2>
              <button onClick={() => setDrawerOpen(false)}>
                <X size={20} style={{ color: "#7a6045" }} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "#800000" }}
            >
              View Results
            </button>
          </div>
        </>
      )}
    </div>
  );
}
