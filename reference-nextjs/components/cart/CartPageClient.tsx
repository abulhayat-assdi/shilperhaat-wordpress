"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatPriceEn, getImageUrl } from "@/lib/utils";
import { useState } from "react";

export default function CartPageClient() {
  const { items, subtotal, deliveryCharge, total, removeItem, updateQuantity, freeDeliveryMin } = useCart();
  const { toast } = useToast();
  const [confirmItem, setConfirmItem] = useState<{ id: string; title: string } | null>(null);

  const handleRemove = (id: string, title: string) => {
    setConfirmItem({ id, title });
  };

  const confirmRemove = () => {
    if (!confirmItem) return;
    removeItem(confirmItem.id);
    toast.info(`"${confirmItem.title}" removed from cart`);
    setConfirmItem(null);
  };

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Delete confirmation dialog */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setConfirmItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-7 text-center"
            style={{
              maxWidth: 320,
              width: "90%",
              boxShadow: "0 8px 32px rgba(128,0,0,0.18)",
              border: "2px solid #800000",
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#fff0f0", border: "2px solid #800000" }}>
              <Trash2 size={22} color="#800000" />
            </div>
            <h3 className="text-base font-bold text-[#1a1208] mb-2">Remove Item?</h3>
            <p className="text-sm text-[#7a6045] mb-5 leading-relaxed">
              &ldquo;{confirmItem.title}&rdquo; কার্ট থেকে সরিয়ে দেবেন?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmItem(null)}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-[#800000] text-[#800000] bg-white hover:bg-[#fff0f0] transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-[#800000] text-white hover:bg-[#5C0000] transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-[#1a1208] mb-6">
        My Cart ({items.length} {items.length === 1 ? "item" : "items"})
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart items */}
        <div className="flex-1 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl border border-[#f0e8d8] p-4 flex items-start gap-4 shadow-sm"
              >
                {/* Image */}
                <Link href={`/product/${item.slug}`}>
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0">
                    <Image
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                      }}
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-semibold text-[#1a1208] text-sm md:text-base line-clamp-2 hover:text-[#800000] transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-[#800000]">
                      {formatPriceEn(item.price)}
                    </span>
                    {item.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPriceEn(item.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty controls */}
                    <div className="flex items-center border border-[#e0d0b0] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#4a2c0a] hover:bg-[#f0e8d8] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#1a1208]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center text-[#4a2c0a] hover:bg-[#f0e8d8] disabled:opacity-40 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#1a1208]">
                        {formatPriceEn(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.productId, item.title)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          <div className="pt-2">
            <Link
              href="/shop"
              className="text-[#800000] text-sm font-medium hover:underline flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-[#1a1208] text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#4a2c0a]">
                <span>Subtotal</span>
                <span>{formatPriceEn(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#4a2c0a]">
                <span>Delivery Charge</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    formatPriceEn(deliveryCharge)
                  )}
                </span>
              </div>

              {deliveryCharge > 0 && freeDeliveryMin && (
                <p className="text-xs text-[#7a6045] bg-[#fdf8f3] p-2 rounded-lg">
                  Add {formatPriceEn(freeDeliveryMin - subtotal)} more to get free delivery!
                </p>
              )}

              <div className="border-t border-[#f0e8d8] pt-3">
                <div className="flex justify-between font-bold text-[#1a1208] text-base">
                  <span>Total</span>
                  <span className="text-[#800000] text-lg">{formatPriceEn(total)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-5 flex items-center justify-center gap-2 w-full bg-[#800000] hover:bg-[#5C0000] text-white font-bold py-4 rounded-xl transition-colors"
            >
              Place Order
              <ArrowRight size={18} />
            </Link>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#7a6045]">
              <span>🔒</span>
              <span>Secure Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-7xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-[#1a1208] mb-2">Your cart is empty</h2>
      <p className="text-[#7a6045] text-sm max-w-xs mb-8">
        You haven&apos;t added any products yet. Browse our collection and pick your favourites.
      </p>
      <Link
        href="/shop"
        className="flex items-center gap-2 bg-[#800000] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#5C0000] transition-colors"
      >
        <ShoppingBag size={18} />
        Start Shopping
      </Link>
    </div>
  );
}
