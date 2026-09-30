"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Package, Phone, MapPin, ShoppingBag, Home } from "lucide-react";
import { formatPriceEn, getImageUrl } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { trackPurchasePixel, FB_CURRENCY } from "@/lib/fbpixel";

interface OrderData {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  items: Array<{
    productId?: string;
    productTitle: string;
    productImage: string | null;
    price: number;
    quantity: number;
    lineTotal: number;
  }>;
}

export default function ThankYouClient() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sh_last_order");
      if (!saved) return;
      const parsed: OrderData = JSON.parse(saved);
      setOrder(parsed);

      // Fire Meta Purchase once per order. The deterministic event_id
      // (purchase_<orderNumber>) deduplicates against the server CAPI event and
      // against a page refresh; the localStorage guard avoids a redundant call.
      const guardKey = `sh_purchase_tracked_${parsed.orderNumber}`;
      if (parsed.orderNumber && !localStorage.getItem(guardKey)) {
        trackPurchasePixel(parsed.orderNumber, {
          content_type: "product",
          content_ids: parsed.items.map((i) => i.productId).filter(Boolean) as string[],
          contents: parsed.items
            .filter((i) => i.productId)
            .map((i) => ({ id: i.productId as string, quantity: i.quantity, item_price: i.price })),
          num_items: parsed.items.reduce((n, i) => n + i.quantity, 0),
          value: parsed.total,
          currency: FB_CURRENCY,
          order_id: parsed.orderNumber,
        });
        localStorage.setItem(guardKey, "1");
      }
    } catch {}
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Success header */}
      <div className="flex flex-col items-center text-center mb-8 thankyou-pop">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1208] mb-2">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-[#7a6045] text-sm">
          Your order has been received. We will contact you shortly to confirm.
        </p>
        {(orderNumber || order?.orderNumber) && (
          <div className="mt-3 bg-[#fdf8f3] border border-[#e0d0b0] rounded-xl px-6 py-3">
            <p className="text-xs text-[#7a6045]">Order Number</p>
            <p className="font-bold text-[#800000] text-lg">
              {orderNumber || order?.orderNumber}
            </p>
          </div>
        )}
      </div>

      {/* Order details */}
      {order && (
        <div className="space-y-4 thankyou-slide">
          {/* Items */}
          <div className="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm">
            <h2 className="font-bold text-[#1a1208] mb-4 flex items-center gap-2">
              <Package size={18} className="text-[#800000]" />
              Ordered Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0">
                    {item.productImage && (
                      <Image
                        src={getImageUrl(item.productImage)}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1208] line-clamp-1">
                      {item.productTitle}
                    </p>
                    <p className="text-xs text-[#7a6045]">
                      {item.quantity}x × {formatPriceEn(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-[#1a1208] text-sm">
                    {formatPriceEn(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#f0e8d8] mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#4a2c0a]">
                <span>Subtotal</span>
                <span>{formatPriceEn(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#4a2c0a]">
                <span>Delivery</span>
                <span>
                  {order.deliveryCharge === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPriceEn(order.deliveryCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base text-[#1a1208]">
                <span>Total</span>
                <span className="text-[#800000]">{formatPriceEn(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer details */}
          <div className="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm">
            <h2 className="font-bold text-[#1a1208] mb-4">Delivery Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">👤</span>
                </div>
                <span className="text-[#1a1208] font-medium">{order.customerName}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#800000] flex-shrink-0 mt-0.5" />
                <span className="text-[#4a2c0a]">{order.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#800000] flex-shrink-0 mt-0.5" />
                <span className="text-[#4a2c0a]">{order.address}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-base">💵</span>
                <span className="text-[#4a2c0a]">
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">What happens next:</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>We will call you soon to confirm your order</li>
              <li>Your order will arrive within 3–5 business days</li>
              <li>Pay the delivery person when you receive your package</li>
            </ul>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 flex-1 bg-[#800000] text-white font-bold py-3.5 rounded-xl hover:bg-[#5C0000] transition-colors"
        >
          <Home size={18} />
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 flex-1 border-2 border-[#800000] text-[#800000] font-bold py-3.5 rounded-xl hover:bg-[#800000] hover:text-white transition-colors"
        >
          <ShoppingBag size={18} />
          Shop More
        </Link>
      </div>
    </div>
  );
}
