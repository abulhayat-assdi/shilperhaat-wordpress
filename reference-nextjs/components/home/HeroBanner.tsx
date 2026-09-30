"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const active = banners.filter((b) => b.isActive);

  const goNext = useCallback(() => {
    setCurrentIndex((p) => (p + 1) % active.length);
  }, [active.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((p) => (p === 0 ? active.length - 1 : p - 1));
  }, [active.length]);

  useEffect(() => {
    if (active.length <= 1) return;
    const t = setInterval(goNext, 4000);
    return () => clearInterval(t);
  }, [goNext, active.length]);

  if (active.length === 0) return <FallbackBanner />;

  const banner = active[currentIndex];
  const hasMobileImage = !!banner.mobileImageUrl;

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#041F1E] ${
        hasMobileImage
          ? "aspect-[768/400] md:aspect-[1920/600] max-h-[520px]"
          : ""
      }`}
      style={hasMobileImage ? undefined : { height: "clamp(280px, 52vw, 520px)" }}
    >
      {/* Entire banner is a link to /shop */}
      <Link
        href="/shop"
        aria-label="Shop all products"
        className="absolute inset-0 z-10"
        style={{ display: "block" }}
      />

      {/* Desktop Banner Image */}
      <Image
        src={banner.imageUrl}
        alt={banner.title || "Shilperhaat banner"}
        fill
        priority={currentIndex === 0}
        className={hasMobileImage ? "hidden md:block object-cover object-center" : "block object-cover object-center"}
        sizes="100vw"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      {/* Mobile Banner Image */}
      {hasMobileImage && (
        <Image
          src={banner.mobileImageUrl!}
          alt={banner.title || "Shilperhaat banner"}
          fill
          priority={currentIndex === 0}
          className="block md:hidden object-cover object-center"
          sizes="100vw"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}

      {/* Prev / Next arrows — z-20 so they sit above the link layer */}
      {active.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer border-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
              color: "#fff",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.55)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.22)"; }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer border-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
              color: "#fff",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.55)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.22)"; }}
          >
            <ChevronRight size={18} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                aria-label={`Banner ${i + 1}`}
                style={{
                  width: i === currentIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === currentIndex ? "#800000" : "rgba(255,255,255,0.5)",
                  border: "none", padding: 0, cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FallbackBanner() {
  return (
    <Link
      href="/shop"
      aria-label="Shop all products"
      style={{ display: "block", textDecoration: "none" }}
    >
      <section
        className="relative w-full flex items-end"
        style={{
          height: "clamp(280px, 52vw, 520px)",
          background: "linear-gradient(135deg, #041F1E 0%, #0A3D3B 60%, #1A6A65 100%)",
          cursor: "pointer",
        }}
      />
    </Link>
  );
}
