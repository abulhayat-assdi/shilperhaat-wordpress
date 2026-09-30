"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatPriceEn, getImageUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const {
    items, subtotal, deliveryCharge, total,
    removeItem, updateQuantity,
    itemCount, cartDrawerOpen, closeCartDrawer,
  } = useCart();
  const { toast } = useToast();
  const [confirmItem, setConfirmItem] = useState<{ id: string; title: string } | null>(null);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = cartDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartDrawerOpen]);

  const handleRemove = (id: string, title: string) => {
    setConfirmItem({ id, title });
  };

  const confirmRemove = () => {
    if (!confirmItem) return;
    removeItem(confirmItem.id);
    toast.info(`"${confirmItem.title}" removed from cart`);
    setConfirmItem(null);
  };

  if (!cartDrawerOpen) return null;

  return (
    <>
      {/* Delete confirmation dialog */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setConfirmItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "28px 28px 22px",
              maxWidth: 320,
              width: "90%",
              boxShadow: "0 8px 32px rgba(128,0,0,0.18)",
              border: "2px solid #800000",
              textAlign: "center",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              backgroundColor: "#fff0f0", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
              border: "2px solid #800000",
            }}>
              <Trash2 size={22} color="#800000" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1208", marginBottom: 8, fontFamily: "'Open Sans',sans-serif" }}>
              Remove Item?
            </h3>
            <p style={{ fontSize: 13, color: "#7a6045", marginBottom: 20, lineHeight: 1.5, fontFamily: "'Open Sans',sans-serif" }}>
              &ldquo;{confirmItem.title}&rdquo; কার্ট থেকে সরিয়ে দেবেন?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmItem(null)}
                style={{
                  flex: 1, padding: "10px 0",
                  border: "2px solid #800000", borderRadius: 8,
                  backgroundColor: "#fff", color: "#800000",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Open Sans',sans-serif",
                }}
              >
                No
              </button>
              <button
                onClick={confirmRemove}
                style={{
                  flex: 1, padding: "10px 0",
                  backgroundColor: "#800000", border: "2px solid #800000",
                  borderRadius: 8, color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Open Sans',sans-serif",
                }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        className="fixed inset-0 z-[80]"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-[90] flex flex-col bg-white"
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          animation: "slideInRight 0.28s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #eee",
            flexShrink: 0,
            backgroundColor: "#fff",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#222", fontFamily: "'Open Sans',sans-serif" }}>
            Your Cart
            {itemCount > 0 && (
              <span
                style={{
                  marginLeft: 8, fontSize: 13, fontWeight: 600,
                  backgroundColor: "#800000", color: "#fff",
                  padding: "2px 8px", borderRadius: 20,
                }}
              >
                {itemCount}
              </span>
            )}
          </h2>
          <button
            onClick={closeCartDrawer}
            aria-label="Close cart"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 6, color: "#555",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {items.length === 0 ? (
            <EmptyState onClose={closeCartDrawer} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 14px",
                    backgroundColor: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 8,
                  }}
                >
                  {/* Image */}
                  <Link href={`/product/${item.slug}`} onClick={closeCartDrawer}>
                    <div
                      style={{
                        width: 64, height: 64, borderRadius: 6,
                        overflow: "hidden", flexShrink: 0,
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #eee",
                        position: "relative",
                      }}
                    >
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.svg"; }}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCartDrawer}
                      style={{ textDecoration: "none" }}
                    >
                      <p
                        className="line-clamp-2"
                        style={{ fontSize: 13, fontWeight: 600, color: "#222", lineHeight: 1.4, fontFamily: "'Open Sans',sans-serif" }}
                      >
                        {item.title}
                      </p>
                    </Link>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#800000", marginTop: 4, fontFamily: "'Open Sans',sans-serif" }}>
                      {formatPriceEn(item.price)}
                    </p>

                    {/* Qty + remove row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <div
                        style={{
                          display: "flex", alignItems: "center",
                          border: "1px solid #ddd", borderRadius: 4, overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          style={{
                            width: 28, height: 28, border: "none",
                            backgroundColor: "#f9f9f9", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRight: "1px solid #ddd",
                          }}
                          aria-label="Decrease"
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          style={{
                            width: 32, height: 28,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 600, color: "#222",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          style={{
                            width: 28, height: 28, border: "none",
                            backgroundColor: "#f9f9f9", cursor: item.quantity >= item.stock ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderLeft: "1px solid #ddd",
                            opacity: item.quantity >= item.stock ? 0.4 : 1,
                          }}
                          aria-label="Increase"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.productId, item.title)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#e53935", padding: 4,
                          display: "flex", alignItems: "center",
                        }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              flexShrink: 0,
              padding: "14px 16px",
              borderTop: "1px solid #eee",
              backgroundColor: "#fff",
            }}
          >
            {/* Subtotal */}
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 13, color: "#666", marginBottom: 4,
                fontFamily: "'Open Sans',sans-serif",
              }}
            >
              <span>Subtotal</span>
              <span>{formatPriceEn(subtotal)}</span>
            </div>
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 13, color: "#666", marginBottom: 12,
                fontFamily: "'Open Sans',sans-serif",
              }}
            >
              <span>Delivery</span>
              <span style={{ color: deliveryCharge === 0 ? "#16a34a" : "#666", fontWeight: deliveryCharge === 0 ? 600 : 400 }}>
                {deliveryCharge === 0 ? "Free" : formatPriceEn(deliveryCharge)}
              </span>
            </div>
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 16, fontWeight: 700, color: "#222",
                marginBottom: 14,
                fontFamily: "'Open Sans',sans-serif",
                borderTop: "1px solid #eee", paddingTop: 10,
              }}
            >
              <span>Total</span>
              <span style={{ color: "#800000" }}>{formatPriceEn(total)}</span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/cart"
                onClick={closeCartDrawer}
                style={{
                  flex: 1, padding: "11px 0",
                  border: "2px solid #800000", borderRadius: 4,
                  backgroundColor: "#fff", color: "#800000",
                  fontSize: 14, fontWeight: 600, textAlign: "center",
                  textDecoration: "none",
                  fontFamily: "'Open Sans',sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                style={{
                  flex: 1, padding: "11px 0",
                  backgroundColor: "#800000", borderRadius: 4,
                  color: "#fff", border: "none",
                  fontSize: 14, fontWeight: 600, textAlign: "center",
                  textDecoration: "none",
                  fontFamily: "'Open Sans',sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>

    </>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <ShoppingBag size={56} style={{ color: "#ddd", marginBottom: 16 }} />
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#222", marginBottom: 8, fontFamily: "'Open Sans',sans-serif" }}>
        Your cart is empty
      </h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 24, fontFamily: "'Open Sans',sans-serif" }}>
        Browse our collection and add items you love.
      </p>
      <Link
        href="/shop"
        onClick={onClose}
        style={{
          display: "inline-block",
          backgroundColor: "#800000", color: "#fff",
          padding: "11px 28px", borderRadius: 4,
          fontSize: 14, fontWeight: 600,
          textDecoration: "none",
          fontFamily: "'Open Sans',sans-serif",
        }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
