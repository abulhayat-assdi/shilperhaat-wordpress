"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  ShoppingBag,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { formatPriceEn, formatDateEn, getImageUrl } from "@/lib/utils";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface OrderItem {
  productTitle: string;
  productImage: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "PENDING", label: "Order Placed", icon: <ShoppingBag size={18} /> },
  { key: "CONFIRMED", label: "Confirmed", icon: <CheckCircle2 size={18} /> },
  { key: "PROCESSING", label: "Processing", icon: <Package size={18} /> },
  { key: "SHIPPED", label: "Shipped", icon: <Truck size={18} /> },
  { key: "DELIVERED", label: "Delivered", icon: <MapPin size={18} /> },
];

const STATUS_ORDER = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

function getStepIndex(status: OrderStatus) {
  return STATUS_ORDER.indexOf(status);
}

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState(searchParams.get("order") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const trackOrder = useCallback(async (orderNumber: string) => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`
      );
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error ?? "Order not found");
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const o = searchParams.get("order");
    if (o) {
      setInput(o);
      trackOrder(o);
    }
  }, [searchParams, trackOrder]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/track-order?order=${encodeURIComponent(input.trim())}`);
    trackOrder(input.trim());
  }

  const isCancelled = order?.status === "CANCELLED";
  const stepIndex = order ? getStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF0E6" }}>
      {/* Header section */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#800000] animate-pulse" />
                <span className="text-xs font-semibold text-[#800000] tracking-widest uppercase">
                  Live Order Tracking
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1a1208]">
                Track Your Order
              </h1>
              <p className="text-[#7a6045] mt-1 text-sm md:text-base">
                Real-time updates on your shipment progress
              </p>
            </div>

            {/* Search form */}
            <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter order number..."
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/30 focus:border-[#800000] bg-gray-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-[#800000] text-white font-semibold rounded-xl text-sm hover:bg-[#5C0000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#7a6045] text-sm">Looking up your order...</p>
          </div>
        )}

        {/* Error / not found state */}
        {!loading && searched && error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-xl font-bold text-[#1a1208] mb-2">
                Order Not Found
              </h2>
              <p className="text-[#7a6045] text-sm mb-6">
                We couldn&apos;t find an order with that number. Please double-check
                and try again.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#800000] text-white font-semibold py-3 px-6 rounded-xl text-sm hover:bg-[#5C0000] transition-colors"
              >
                <ShoppingBag size={16} />
                Back to Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Order found */}
        {!loading && order && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Order header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-[#7a6045] mb-1">Order Number</p>
                  <p className="text-xl font-bold text-[#800000]">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Placed on {formatDateEn(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {order.adminNote && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                  <span className="font-semibold">Note from us: </span>
                  {order.adminNote}
                </div>
              )}
            </div>

            {/* Progress stepper */}
            {!isCancelled && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                <h2 className="font-bold text-[#1a1208] mb-6 text-sm uppercase tracking-wide">
                  Order Progress
                </h2>
                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 hidden sm:block" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-[#800000] hidden sm:block transition-all duration-700"
                    style={{
                      width:
                        stepIndex <= 0
                          ? "0%"
                          : `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 relative z-10">
                    {STATUS_STEPS.map((step, i) => {
                      const isCompleted = i < stepIndex;
                      const isCurrent = i === stepIndex;
                      return (
                        <div
                          key={step.key}
                          className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:flex-1"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              isCurrent
                                ? "bg-[#800000] text-white shadow-md shadow-[#800000]/30 scale-110"
                                : isCompleted
                                ? "bg-[#800000] text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {step.icon}
                          </div>
                          <div className="sm:text-center">
                            <p
                              className={`text-sm font-semibold ${
                                isCurrent || isCompleted
                                  ? "text-[#1a1208]"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-[#800000] font-medium mt-0.5">
                                Current
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled state */}
            {isCancelled && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6 flex items-center gap-4">
                <XCircle size={32} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-600">
                    This order has been cancelled. Contact us if you have questions.
                  </p>
                </div>
              </div>
            )}

            {/* Items + totals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <h2 className="font-bold text-[#1a1208] mb-4 flex items-center gap-2">
                <Package size={18} className="text-[#800000]" />
                Ordered Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
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
                        {item.quantity} × {formatPriceEn(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold text-[#1a1208] text-sm whitespace-nowrap">
                      {formatPriceEn(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-[#4a2c0a]">
                  <span>Subtotal</span>
                  <span>{formatPriceEn(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#4a2c0a]">
                  <span>Delivery</span>
                  <span>
                    {Number(order.deliveryCharge) === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPriceEn(order.deliveryCharge)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-[#1a1208]">
                  <span>Total</span>
                  <span className="text-[#800000]">
                    {formatPriceEn(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <h2 className="font-bold text-[#1a1208] mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#7a6045]">Customer</p>
                    <p className="font-medium text-[#1a1208]">
                      {order.customerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-[#800000]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#7a6045]">Phone</p>
                    <p className="font-medium text-[#1a1208]">{order.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-[#800000]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#7a6045]">Address</p>
                    <p className="font-medium text-[#1a1208]">{order.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-[#800000]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#7a6045]">Payment</p>
                    <p className="font-medium text-[#1a1208]">
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pb-4">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 flex-1 bg-[#800000] text-white font-bold py-3.5 rounded-xl hover:bg-[#5C0000] transition-colors text-sm"
              >
                Back to Home
              </Link>
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 flex-1 border-2 border-[#800000] text-[#800000] font-bold py-3.5 rounded-xl hover:bg-[#800000] hover:text-white transition-colors text-sm"
              >
                <ShoppingBag size={16} />
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Initial state — no search yet */}
        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-[#f0e8d8] flex items-center justify-center mb-5">
              <Package size={36} className="text-[#800000]" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1208] mb-2">
              Enter Your Order Number
            </h2>
            <p className="text-[#7a6045] text-sm max-w-xs">
              Type your order number (e.g. SH26052812345) in the search box
              above to see your order status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    PENDING: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    CONFIRMED: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    PROCESSING: {
      label: "Processing",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    SHIPPED: {
      label: "Shipped",
      className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    DELIVERED: {
      label: "Delivered",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${className}`}
    >
      {label}
    </span>
  );
}
