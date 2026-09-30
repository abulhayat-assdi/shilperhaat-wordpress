import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, Product } from "@/types";
import ProductCard from "@/components/ui/ProductCard";

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  const display = products.slice(0, 4);
  if (display.length === 0) return null;

  return (
    <section style={{ padding: "40px 0", backgroundColor: "#FAF0E6" }}>
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
              {category.name}
            </h2>
            <span
              className="absolute bottom-0 left-0"
              style={{ width: "48px", height: "3px", backgroundColor: "#800000", borderRadius: "2px" }}
            />
          </div>
          <Link
            href={`/shop?category=${encodeURIComponent(category.slug)}`}
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

        {/* Mobile: 2-column grid — uses className for display so md:hidden can override */}
        <div
          className="grid md:hidden"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}
        >
          {display.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Desktop: fixed 4-column grid */}
        <div
          className="hidden md:grid"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}
        >
          {display.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* See all button — pill/rounded-full style */}
        <div className="flex justify-center" style={{ marginTop: "28px" }}>
          <Link
            href={`/shop?category=${encodeURIComponent(category.slug)}`}
            className="inline-block border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-colors rounded-full"
            style={{
              padding: "10px 36px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            View All {category.name} Products
          </Link>
        </div>
      </div>
    </section>
  );
}
