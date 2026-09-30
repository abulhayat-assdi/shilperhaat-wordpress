"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { getImageUrl } from "@/lib/utils";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <section style={{ padding: "40px 0", backgroundColor: "#FAF0E6" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-5">

        {/* Section header */}
        <div className="flex items-end justify-between" style={{ marginBottom: 24 }}>
          <div className="relative" style={{ paddingBottom: 10 }}>
            <h2
              style={{
                fontSize: 22, fontWeight: 600, color: "#222",
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              Featured Categories
            </h2>
            <span
              className="absolute bottom-0 left-0"
              style={{ width: 48, height: 3, backgroundColor: "#800000", borderRadius: 2 }}
            />
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 transition-all duration-200 hover:gap-2"
            style={{
              color: "#800000", fontSize: 13, fontWeight: 600,
              textDecoration: "none", fontFamily: "'Open Sans', sans-serif",
            }}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left arrow — only shown on mobile */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll categories left"
            className="md:hidden flex absolute -left-1 z-10 items-center justify-center transition-colors"
            style={{
              top: "38%", transform: "translateY(-50%)",
              backgroundColor: "#800000", color: "#fff",
              border: "none", width: 28, height: 28,
              borderRadius: "50%", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronLeft size={14} />
          </button>

          {/* Mobile: horizontal scroll track */}
          <div
            ref={scrollRef}
            className="md:hidden flex py-3 px-1"
            style={{
              gap: 16,
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties}
          >
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>

          {/* Desktop: centered wrap — no scroll needed */}
          <div
            className="hidden md:flex flex-wrap justify-center py-3 px-1"
            style={{ gap: 24 }}
          >
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>

          {/* Right arrow — only shown on mobile */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll categories right"
            className="md:hidden flex absolute -right-1 z-10 items-center justify-center transition-colors"
            style={{
              top: "38%", transform: "translateY(-50%)",
              backgroundColor: "#800000", color: "#fff",
              border: "none", width: 28, height: 28,
              borderRadius: "50%", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Category Card — circle icon style ─────────────────────── */
function CategoryCard({ category }: { category: Category }) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(category.imageUrl));

  return (
    <Link
      href={`/shop?category=${encodeURIComponent(category.slug)}`}
      aria-label={`Browse ${category.name}`}
      style={{
        flexShrink: 0,
        width: 100,
        minWidth: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Circular image container */}
      <div
        style={{
          width: 80, height: 80,
          borderRadius: "50%",
          backgroundColor: "#FFF0F0",
          border: "2px solid #f5d0d0",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(128,0,0,0.25)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        <Image
          src={imgSrc}
          alt={category.name}
          fill
          className="object-cover"
          sizes="80px"
          onError={() => {
            if (imgSrc !== "/placeholder-product.svg") {
              setImgSrc("/placeholder-product.svg");
            }
          }}
        />
      </div>

      {/* Category name */}
      <span
        style={{
          fontSize: 13, fontWeight: 500, color: "#333",
          textAlign: "center", lineHeight: 1.3,
          fontFamily: "'Open Sans', sans-serif",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "#800000"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "#333"; }}
      >
        {category.name}
      </span>
    </Link>
  );
}
