"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { Review } from "@/types";
import { getImageUrl } from "@/lib/utils";

interface ReviewCarouselProps {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          style={i < rating ? { color: "#800000", fill: "#800000" } : { color: "#D1D5DB" }}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #EEEEEE",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Quote size={26} style={{ color: "#800000", opacity: 0.55, marginBottom: 12 }} />
      <StarRating rating={review.rating} />
      {review.title && (
        <h4
          style={{
            fontSize: 14, fontWeight: 700, color: "#222831",
            margin: "10px 0 6px",
            fontFamily: "'Open Sans', sans-serif",
          }}
        >
          {review.title}
        </h4>
      )}
      <p
        style={{
          fontSize: 13, color: "#666666", lineHeight: 1.7,
          flex: 1, marginBottom: 16,
          fontFamily: "'Open Sans', sans-serif",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 4,
        } as React.CSSProperties}
      >
        {review.content}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, borderTop: "1px solid #F5F5F5" }}>
        {review.avatarUrl ? (
          <Image
            src={getImageUrl(review.avatarUrl)}
            alt={review.name}
            width={40} height={40}
            style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 38, height: 38, borderRadius: "50%",
              backgroundColor: "#800000",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 16,
              flexShrink: 0,
            }}
          >
            {review.name.charAt(0)}
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#222831", fontFamily: "'Open Sans', sans-serif" }}>
            {review.name}
          </p>
          {review.role && (
            <p style={{ fontSize: 11, color: "#999", fontFamily: "'Open Sans', sans-serif" }}>
              {review.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const visible = reviews.filter((r) => r.isVisible).slice(0, 6);
  const [current, setCurrent] = useState(0);
  const [perView, setPerView] = useState(1);

  /* Responsive items-per-view */
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setPerView(3);
      else if (window.innerWidth >= 640)  setPerView(2);
      else                                setPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* Number of slide groups */
  const numGroups = Math.ceil(visible.length / perView);

  /* Reset position when layout changes */
  useEffect(() => { setCurrent(0); }, [numGroups]);

  /* Auto-advance every 4 s */
  useEffect(() => {
    if (visible.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % numGroups);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible.length, numGroups]);

  if (visible.length === 0) return null;

  /* Each card occupies (100/perView)% of the container.
     One group of perView cards = 100% of container.
     Advancing by 1 group → translateX by -100%. */
  const cardWidthPct = 100 / perView;
  const prev = () => setCurrent((c) => (c - 1 + numGroups) % numGroups);
  const next = () => setCurrent((c) => (c + 1) % numGroups);

  return (
    <section style={{ padding: "40px 0", backgroundColor: "#FFFFFF", width: "100%" }}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-5">

        {/* ── Section header ── */}
        <div
          style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", marginBottom: 28,
          }}
        >
          <div style={{ position: "relative", paddingBottom: 10 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#222831", fontFamily: "'Open Sans', sans-serif" }}>
              Customer Reviews
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginTop: 4, fontFamily: "'Open Sans', sans-serif" }}>
              What our happy customers say
            </p>
            <span
              style={{
                position: "absolute", bottom: 0, left: 0,
                width: 48, height: 3, backgroundColor: "#800000", borderRadius: 2,
              }}
            />
          </div>

          {/* Prev / Next arrow buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={prev}
              aria-label="Previous reviews"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                backgroundColor: "#F5F5F5",
                border: "1px solid #E8E8E8",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background-color 0.2s",
                padding: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#800000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F5F5F5"; }}
            >
              <ChevronLeft size={18} style={{ color: "#555" }} />
            </button>
            <button
              onClick={next}
              aria-label="Next reviews"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                backgroundColor: "#800000",
                border: "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background-color 0.2s",
                padding: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5C0000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#800000"; }}
            >
              <ChevronRight size={18} style={{ color: "#fff" }} />
            </button>
          </div>
        </div>

        {/* ── Slider track ── */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              transform: `translateX(-${current * 100}%)`,
              transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {visible.map((review) => (
              <div
                key={review.id}
                style={{
                  flexShrink: 0,
                  width: `${cardWidthPct}%`,
                  padding: "4px 8px",
                }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Dot indicators ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: numGroups }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === current ? "#800000" : "#ddd",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
