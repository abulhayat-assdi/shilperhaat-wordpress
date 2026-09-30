"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { formatPriceEn, calculateDiscount, getImageUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast }   = useToast();

  const primaryImage = product.images?.[0];
  const imageUrl     = getImageUrl(primaryImage?.imageUrl);
  const discount     = product.compareAtPrice
    ? calculateDiscount(Number(product.price), Number(product.compareAtPrice))
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      image: imageUrl,
      stock: product.stock,
      slug: product.slug,
    });

    toast.success(`"${product.title}" added to cart`);
  };

  return (
    <div
      className="group product-card"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        border: "1px solid #eeeeee",
        overflow: "hidden",
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
      <Link href={`/product/${encodeURIComponent(product.slug)}`} style={{ textDecoration: "none", display: "block" }}>
        {/* Product image — 4:3 ratio via padding-bottom trick */}
        <div style={{ position: "relative", width: "100%", paddingBottom: "75%", backgroundColor: "#F8F8F8", overflow: "hidden" }}>
          {/* Badges inside image area */}
          <div
            className="absolute z-20 pointer-events-none flex flex-col"
            style={{ top: 8, left: 8, gap: 4 }}
          >
            {discount > 0 && (
              <span
                style={{
                  backgroundColor: "#FF3F33", color: "#FFFFFF",
                  fontSize: 10, fontWeight: 700,
                  padding: "3px 7px", borderRadius: 4,
                  display: "inline-block",
                }}
              >
                Save {discount}%
              </span>
            )}
            {product.isBestSelling && (
              <span
                style={{
                  backgroundColor: "#F48721", color: "#FFFFFF",
                  fontSize: 10, fontWeight: 700,
                  padding: "3px 7px", borderRadius: 4,
                  display: "inline-block",
                }}
              >
                Best Seller
              </span>
            )}
            {product.stock === 0 && (
              <span
                style={{
                  backgroundColor: "#888888", color: "#FFFFFF",
                  fontSize: 10, fontWeight: 700,
                  padding: "3px 7px", borderRadius: 4,
                  display: "inline-block",
                }}
              >
                Out of Stock
              </span>
            )}
          </div>

          <Image
            src={imageUrl}
            alt={primaryImage?.altText || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.svg";
            }}
          />
        </div>

        {/* Card body */}
        <div style={{ padding: "10px 12px 4px" }}>
          {product.category && (
            <p style={{ fontSize: 11, color: "#800000", fontWeight: 500, marginBottom: 3 }}>
              {product.category.name}
            </p>
          )}
          <h4
            className="line-clamp-2"
            style={{ fontSize: 13, fontWeight: 600, color: "#222831", marginBottom: 6, lineHeight: 1.4, minHeight: "2.4em" }}
          >
            {product.title}
          </h4>
          <div className="flex items-center flex-wrap" style={{ gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#800000" }}>
              {formatPriceEn(Number(product.price))}
            </span>
            {product.compareAtPrice && (
              <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through" }}>
                {formatPriceEn(Number(product.compareAtPrice))}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart button */}
      <div style={{ padding: "0 12px 12px" }}>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn-cart w-full flex items-center justify-center gap-1.5"
          style={{
            padding: "8px 12px",
            backgroundColor: "white",
            color: product.stock === 0 ? "#aaa" : "#800000",
            border: product.stock === 0 ? "2px solid #ddd" : "2px solid #800000",
            borderRadius: 4,
            fontSize: 12, fontWeight: 600,
            cursor: product.stock === 0 ? "not-allowed" : "pointer",
            transition: "background-color 0.2s, color 0.2s, transform 0.1s",
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
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
            }
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
          aria-label={`Add to cart — ${product.title}`}
        >
          <ShoppingCart size={13} />
          <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
}
