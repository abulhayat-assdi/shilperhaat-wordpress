"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { formatPriceEn, calculateDiscount, getImageUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useRouter } from "next/navigation";

interface TopSellingCardProps {
  product: Product;
}

export default function TopSellingCard({ product }: TopSellingCardProps) {
  const { addItem } = useCart();
  const { toast }   = useToast();
  const router      = useRouter();

  const primaryImage = product.images?.[0];
  const imageUrl     = getImageUrl(primaryImage?.imageUrl);
  const discount     = product.compareAtPrice
    ? calculateDiscount(Number(product.price), Number(product.compareAtPrice))
    : 0;
  const saveAmount   = product.compareAtPrice
    ? Number(product.compareAtPrice) - Number(product.price)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stock === 0) { toast.error("This product is currently out of stock"); return; }
    addItem({
      id: product.id, productId: product.id, title: product.title,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      image: imageUrl, stock: product.stock, slug: product.slug,
    });
    toast.success(`"${product.title}" added to cart`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stock === 0) { toast.error("This product is currently out of stock"); return; }
    addItem({
      id: product.id, productId: product.id, title: product.title,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      image: imageUrl, stock: product.stock, slug: product.slug,
    });
    router.push("/checkout");
  };

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        border: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: 16,
        marginBottom: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.25s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        el.style.transform  = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
        el.style.transform  = "translateY(0)";
      }}
    >
      {/* Best Selling badge */}
      {product.isBestSelling && (
        <span
          className="absolute z-10"
          style={{
            top: 12, right: 12,
            backgroundColor: "#FF3F33", color: "#FFFFFF",
            fontSize: 11, fontWeight: 700,
            padding: "3px 9px",
            borderRadius: "2px 8px 2px 8px",
          }}
        >
          🏅 Best Seller
        </span>
      )}

      <Link href={`/product/${product.slug}`} className="flex items-center gap-3 md:gap-5 flex-1 min-w-0" style={{ textDecoration: "none" }}>
        {/* Product image */}
        <div
          className="flex-shrink-0 w-20 h-20 md:w-40 md:h-40"
          style={{
            borderRadius: 6, backgroundColor: "#f9f9f9",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            src={imageUrl}
            alt={primaryImage?.altText || product.title}
            width={160} height={160}
            className="object-contain group-hover:scale-105 transition-transform duration-300 w-full h-full"
            style={{ objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.svg";
            }}
          />
        </div>

        {/* Product details */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm md:text-xl"
            style={{
              fontWeight: 600, color: "#222",
              marginBottom: 8,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.title}
          </h4>

          {/* Price row */}
          <div className="flex items-center flex-wrap" style={{ gap: 8, marginBottom: 12 }}>
            <span
              className="text-base md:text-2xl"
              style={{ fontWeight: 700, color: "#800000" }}
            >
              {formatPriceEn(Number(product.price))}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs md:text-sm" style={{ color: "#aaa", textDecoration: "line-through" }}>
                {formatPriceEn(Number(product.compareAtPrice))}
              </span>
            )}
            {saveAmount > 0 && (
              <span
                className="hidden md:inline"
                style={{
                  backgroundColor: "#e8f5e9", color: "#2e7d32",
                  fontSize: 12, fontWeight: 600,
                  padding: "3px 8px", borderRadius: 4,
                }}
              >
                Save {formatPriceEn(saveAmount)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div
            className="flex"
            style={{ gap: 8 }}
            onClick={(e) => e.preventDefault()}
          >
            {/* Add To Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-1"
              style={{
                flex: 1, padding: "8px 8px",
                borderRadius: 4, fontSize: 12, fontWeight: 600,
                border: product.stock === 0 ? "2px solid #ddd" : "2px solid #800000",
                backgroundColor: "white",
                color: product.stock === 0 ? "#aaa" : "#800000",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                transition: "background-color 0.2s, color 0.2s, transform 0.1s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#800000";
                  (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
                  (e.currentTarget as HTMLButtonElement).style.color = "#800000";
                }
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              onMouseDown={(e) => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
                }
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <ShoppingCart size={13} />
              <span>{product.stock === 0 ? "Out of Stock" : "Add To Cart"}</span>
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-1"
              style={{
                flex: 1, padding: "8px 8px",
                borderRadius: 4, fontSize: 12, fontWeight: 600,
                backgroundColor: product.stock === 0 ? "#F5F5F5" : "#800000",
                color: product.stock === 0 ? "#aaa" : "#FFFFFF",
                border: "none",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                transition: "background-color 0.2s, transform 0.1s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5C0000";
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#800000";
                }
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              onMouseDown={(e) => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
                }
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <ShoppingCart size={13} />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
