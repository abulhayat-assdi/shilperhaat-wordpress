import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import TopSellingCard from "@/components/home/TopSellingCard";

interface TopSellingSectionProps {
  products: Product[];
}

export default function TopSellingSection({ products }: TopSellingSectionProps) {
  const top     = products.filter((p) => p.isBestSelling).slice(0, 4);
  const display = top.length >= 4 ? top : products.slice(0, 4);

  if (display.length === 0) return null;

  return (
    <section style={{ padding: "40px 0", backgroundColor: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-5">

        {/* Section header */}
        <div className="flex items-end justify-between" style={{ marginBottom: "24px" }}>
          <div className="relative" style={{ paddingBottom: "10px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "#222831",
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              Top Selling Products
            </h2>
            <span
              className="absolute bottom-0 left-0"
              style={{ width: "48px", height: "3px", backgroundColor: "#800000", borderRadius: "2px" }}
            />
          </div>
          <Link
            href="/shop?sort=best_selling"
            className="flex items-center gap-1 transition-all duration-200 hover:gap-2"
            style={{
              color: "#800000",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* 2-column grid of horizontal feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "0" }}>
          {display.map((product) => (
            <TopSellingCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center" style={{ marginTop: "32px" }}>
          <Link
            href="/shop?sort=best_selling"
            className="inline-block border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-colors"
            style={{
              padding: "12px 40px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            View All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  );
}
