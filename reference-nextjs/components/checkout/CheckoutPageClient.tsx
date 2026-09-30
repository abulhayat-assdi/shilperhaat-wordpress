"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { generateOrderNumber, getImageUrl } from "@/lib/utils";
import { BANGLADESH_DISTRICTS, getDeliveryCharge, getThanas } from "@/lib/bangladesh-districts";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { trackEvent, FB_CURRENCY } from "@/lib/fbpixel";


function SectionTitle({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2
        style={{
          borderLeft: "3px solid #800000",
          paddingLeft: 10,
          fontSize: 15,
          fontWeight: 700,
          color: "#222",
          lineHeight: 1.3,
        }}
      >
        {children}
      </h2>
      {extra}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-lg mb-4 ${className}`}
      style={{ border: "1px solid #e8e8e8", padding: 20, boxShadow: "none" }}
    >
      {children}
    </div>
  );
}

const inputBase =
  "w-full bg-white text-[#333] text-sm outline-none transition-colors placeholder:text-[#aaa]";
const inputStyle = {
  height: 42,
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  padding: "0 14px",
  fontSize: 14,
};

function inputCls(hasError?: boolean) {
  return `${inputBase} ${hasError ? "border-red-400 focus:border-red-500" : "focus:border-[#800000]"}`;
}

export default function CheckoutPageClient() {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [termsError, setTermsError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(checkoutSchema) as any,
  });

  const watchedDistrict = watch("district") || "";
  const watchedThana    = watch("thana") || "";
  const watchedNotes    = watch("notes") || "";

  // Delivery charge: Dhaka district = ৳100, any other district = ৳150, none = ৳0
  const deliveryCharge = useMemo(
    () => getDeliveryCharge(watchedDistrict),
    [watchedDistrict]
  );
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const total = subtotal + deliveryCharge - discount;

  const applyCoupon = async (code: string) => {
    if (!code.trim()) return;
    setCouponApplying(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discount: data.discount });
        setCouponMsg(null);
      } else {
        setAppliedCoupon(null);
        setCouponMsg(data.message || "Invalid coupon code.");
      }
    } catch {
      setAppliedCoupon(null);
      setCouponMsg("Could not verify coupon. Please try again.");
    } finally {
      setCouponApplying(false);
    }
  };

  // Re-validate the applied coupon when the cart total changes
  useEffect(() => {
    if (appliedCoupon && subtotal > 0) applyCoupon(appliedCoupon.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // Fire Meta InitiateCheckout once when the checkout page loads with items
  const initiateCheckoutFired = useRef(false);
  useEffect(() => {
    if (initiateCheckoutFired.current || items.length === 0) return;
    initiateCheckoutFired.current = true;
    trackEvent("InitiateCheckout", {
      content_type: "product",
      content_ids: items.map((i) => i.productId),
      contents: items.map((i) => ({ id: i.productId, quantity: i.quantity, item_price: i.price })),
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: subtotal,
      currency: FB_CURRENCY,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const fmtAmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-[#222] mb-2">Your cart is empty</h2>
        <p className="text-sm mb-6" style={{ color: "#777" }}>
          Add products to your cart before checking out.
        </p>
        <Link
          href="/shop"
          className="text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: "#800000" }}
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutInput) => {
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      const address = [data.houseAddress, data.thana, data.district]
        .filter(Boolean)
        .join(", ");

      const orderItems = items.map((item) => ({
        productId: item.productId,
        productTitle: item.title,
        productImage: item.image,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      }));

      const payload = {
        orderNumber,
        customerName: data.customerName,
        phone: data.phone,
        address,
        notes: data.notes || "",
        subtotal,
        deliveryCharge,
        total,
        couponCode: appliedCoupon?.code || null,
        paymentMethod: "COD",
        items: orderItems,
        eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Something went wrong. Please try again.");
        return;
      }
      try {
        localStorage.setItem(
          "sh_last_order",
          JSON.stringify({ ...payload, id: result.orderId || "temp-" + Date.now() })
        );
      } catch {}

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/thank-you?order=${orderNumber}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPlaceOrder = termsAccepted && !!watchedDistrict;

  return (
    <div style={{ backgroundColor: "#f7f7f7", minHeight: "100vh" }}>
      {/* Page title + breadcrumb */}
      <div className="text-center pt-6 pb-5">
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#222", marginBottom: 4 }}>
          Checkout
        </h1>
        <p style={{ fontSize: 13, color: "#999" }}>
          <Link href="/" className="hover:text-[#800000] transition-colors">
            Home
          </Link>
          <span className="mx-1.5" style={{ color: "#bbb" }}>
            &gt;
          </span>
          <span style={{ color: "#800000" }}>Checkout</span>
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 pb-8">
        {/* Login / register banner */}
        <div
          className="bg-white flex flex-wrap items-center justify-between gap-3 mb-5"
          style={{
            border: "1px solid #e8e8e8",
            borderRadius: 6,
            padding: "12px 20px",
          }}
        >
          <span style={{ fontSize: 14, color: "#555" }}>
            Have any account? please login or register
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              style={{
                border: "1px solid #ddd",
                background: "white",
                color: "#333",
                padding: "7px 18px",
                borderRadius: 4,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Login
            </button>
            <button
              type="button"
              style={{
                background: "#800000",
                color: "white",
                border: "none",
                padding: "7px 18px",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Two-column form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-5">

            {/* ── LEFT COLUMN ── */}
            <div className="w-full lg:w-[58%]">

              {/* Order Review */}
              <Card>
                <SectionTitle>Order review</SectionTitle>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      {/* Product image */}
                      <div
                        className="relative flex-shrink-0 overflow-hidden"
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 6,
                          border: "1px solid #f0f0f0",
                          background: "#f5f5f5",
                        }}
                      >
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="60px"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-product.svg";
                          }}
                        />
                      </div>

                      {/* Name + price row + qty row */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Row 1: name · price · delete */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <p
                            className="line-clamp-2"
                            style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#333", lineHeight: 1.4 }}
                          >
                            {item.title}
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#800000", whiteSpace: "nowrap" }}>
                              ৳{fmtAmt(item.price * item.quantity)}
                            </span>
                            {item.compareAtPrice && item.compareAtPrice > item.price && (
                              <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through", whiteSpace: "nowrap" }}>
                                ৳{fmtAmt(item.compareAtPrice * item.quantity)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            aria-label="Remove item"
                            style={{
                              flexShrink: 0,
                              width: 28,
                              height: 28,
                              background: "#ff4444",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Row 2: qty controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                          <span style={{ fontSize: 13, color: "#777" }}>Qty:</span>
                          <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: 4, overflow: "hidden" }}>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              style={{
                                width: 28,
                                height: 28,
                                background: "white",
                                border: "none",
                                borderRight: "1px solid #ddd",
                                fontSize: 16,
                                color: "#555",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                width: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#333",
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              style={{
                                width: 28,
                                height: 28,
                                background: "white",
                                border: "none",
                                borderLeft: "1px solid #ddd",
                                fontSize: 16,
                                color: "#555",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Shipping Address */}
              <Card>
                <SectionTitle>Shipping Address</SectionTitle>
                <div className="space-y-3">

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        {...register("customerName")}
                        type="text"
                        placeholder="Your Full Name *"
                        className={inputCls(!!errors.customerName)}
                        style={{
                          ...inputStyle,
                          borderColor: errors.customerName ? "#f87171" : "#e0e0e0",
                        }}
                      />
                      {errors.customerName && (
                        <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <span
                          className="absolute top-1/2 -translate-y-1/2 select-none"
                          style={{
                            left: 12,
                            fontSize: 14,
                            color: "#555",
                            borderRight: "1px solid #e0e0e0",
                            paddingRight: 8,
                            lineHeight: "20px",
                          }}
                        >
                          88
                        </span>
                        <input
                          {...register("phone")}
                          type="tel"
                          placeholder="017********"
                          className={`${inputBase} ${errors.phone ? "border-red-400 focus:border-red-500" : "focus:border-[#800000]"}`}
                          style={{
                            ...inputStyle,
                            paddingLeft: 46,
                            borderColor: errors.phone ? "#f87171" : "#e0e0e0",
                          }}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* House address */}
                  <div>
                    <input
                      {...register("houseAddress")}
                      type="text"
                      placeholder="ex: House no. / building / street / area"
                      className={inputCls(!!errors.houseAddress)}
                      style={{
                        ...inputStyle,
                        borderColor: errors.houseAddress ? "#f87171" : "#e0e0e0",
                      }}
                    />
                    {errors.houseAddress && (
                      <p className="text-red-500 text-xs mt-1">{errors.houseAddress.message}</p>
                    )}
                  </div>

                  {/* District + Thana */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <SearchableSelect
                        options={BANGLADESH_DISTRICTS.map((d) => d.name)}
                        value={watchedDistrict}
                        onChange={(val) => {
                          setValue("district", val, { shouldValidate: true });
                          setValue("thana", "", { shouldValidate: false });
                        }}
                        placeholder="Select District *"
                        hasError={!!errors.district}
                      />
                      {errors.district && (
                        <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>
                      )}
                    </div>
                    <div>
                      <SearchableSelect
                        options={getThanas(watchedDistrict)}
                        value={watchedThana}
                        onChange={(val) => setValue("thana", val, { shouldValidate: false })}
                        placeholder="Select Thana (Optional)"
                        disabled={!watchedDistrict}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Special Notes — moved here from right column */}
              <Card>
                <SectionTitle extra={<span style={{ fontSize: 12, color: "#999" }}>(Optional)</span>}>
                  Special notes
                </SectionTitle>
                <textarea
                  {...register("notes")}
                  maxLength={90}
                  placeholder="Any special instructions..."
                  className="w-full outline-none transition-colors resize-y focus:border-[#800000]"
                  style={{
                    height: 80,
                    border: "1px solid #e0e0e0",
                    borderRadius: 6,
                    padding: "10px 14px",
                    fontSize: 14,
                    color: "#333",
                    resize: "vertical",
                    display: "block",
                  }}
                />
                <p style={{ fontSize: 12, color: "#999", marginTop: 4, textAlign: "right" }}>
                  {watchedNotes.length} / 90 characters
                </p>
              </Card>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="w-full lg:w-[42%]">

              {/* Payment Method */}
              <Card>
                <SectionTitle>Payment method</SectionTitle>
                <div
                  className="flex items-center gap-3"
                  style={{
                    border: "1px solid #800000",
                    borderRadius: 8,
                    padding: "14px 16px",
                    background: "#fff8f0",
                  }}
                >
                  <span style={{ fontSize: 26, lineHeight: 1, color: "#800000" }}>💵</span>
                  <div className="flex-1">
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#222", marginBottom: 2 }}>
                      Cash On Delivery
                    </p>
                    <p style={{ fontSize: 12, color: "#888" }}>Pay when you receive your order</p>
                  </div>
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#800000",
                    }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Card>

              {/* Coupon */}
              <div
                className="bg-white mb-4 overflow-hidden"
                style={{ border: "1px solid #e8e8e8", borderRadius: 8 }}
              >
                <button
                  type="button"
                  onClick={() => setCouponOpen(!couponOpen)}
                  className="w-full flex items-center justify-between transition-colors"
                  style={{ padding: "12px 16px", fontSize: 14, color: "#444", cursor: "pointer" }}
                >
                  <span>Have any coupon or gift voucher?</span>
                  {couponOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {couponOpen && (
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #f0f0f0" }}>
                    {appliedCoupon ? (
                      <div
                        className="flex items-center justify-between"
                        style={{
                          background: "#f0faf0",
                          border: "1px solid #c6e8c6",
                          borderRadius: 6,
                          padding: "10px 14px",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>
                          ✓ {appliedCoupon.code} applied — ৳{fmtAmt(discount)} off
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode("");
                            setCouponMsg(null);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#c62828",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className={`flex-1 ${inputBase}`}
                            style={{ ...inputStyle, borderColor: "#e0e0e0" }}
                          />
                          <button
                            type="button"
                            onClick={() => applyCoupon(couponCode)}
                            disabled={couponApplying || !couponCode.trim()}
                            className="transition-colors"
                            style={{
                              background: couponApplying || !couponCode.trim() ? "#b08080" : "#800000",
                              color: "white",
                              border: "none",
                              padding: "0 16px",
                              height: 42,
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: couponApplying || !couponCode.trim() ? "not-allowed" : "pointer",
                              flexShrink: 0,
                            }}
                          >
                            {couponApplying ? "Checking..." : "Apply"}
                          </button>
                        </div>
                        {couponMsg && (
                          <p style={{ fontSize: 12, color: "#c62828", marginTop: 8 }}>{couponMsg}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <Card>
                <div className="space-y-1">
                  <div className="flex justify-between" style={{ padding: "8px 0", fontSize: 14, color: "#555" }}>
                    <span>Sub total</span>
                    <span>৳{fmtAmt(subtotal)} BDT</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ padding: "8px 0", fontSize: 14, color: "#555" }}>
                    <span>Delivery cost</span>
                    {watchedDistrict ? (
                      <span style={{ color: "#333", fontWeight: 500 }}>৳{fmtAmt(deliveryCharge)} BDT</span>
                    ) : (
                      <em style={{ color: "#aaa", fontSize: 13, fontStyle: "italic" }}>Select district</em>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between" style={{ padding: "8px 0", fontSize: 14, color: "#2e7d32" }}>
                      <span>Coupon discount ({appliedCoupon?.code})</span>
                      <span>−৳{fmtAmt(discount)} BDT</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between"
                    style={{
                      borderTop: "1px solid #eee",
                      padding: "10px 0 0",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#222",
                    }}
                  >
                    <span>Total</span>
                    <span>৳{fmtAmt(total)} BDT</span>
                  </div>
                </div>
              </Card>

              {/* Terms + Place Order */}
              <div
                className="bg-white"
                style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: 20 }}
              >
                <label className="flex items-start gap-[10px] cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                    className="accent-[#800000] flex-shrink-0"
                    style={{ width: 16, height: 16, marginTop: 2 }}
                  />
                  <span style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                    I have read and agree to the{" "}
                    <a
                      href="/terms-of-use"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#800000", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                    >
                      Terms and Conditions
                    </a>
                    ,{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#800000", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                    >
                      Privacy Policy
                    </a>{" "}
                    &{" "}
                    <a
                      href="/refund-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#800000", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                    >
                      Refund and Return Policy
                    </a>
                    .
                  </span>
                </label>

                {termsError && (
                  <p className="text-red-500 text-xs mb-3">
                    You must accept the terms to continue.
                  </p>
                )}

                {!watchedDistrict && (
                  <p className="text-xs mb-3" style={{ color: "#aaa" }}>
                    Please select a district to enable the order button.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !canPlaceOrder}
                  className="w-full flex items-center justify-center gap-2 transition-colors"
                  style={{
                    height: 50,
                    background: canPlaceOrder ? "#800000" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    cursor: canPlaceOrder && !isSubmitting ? "pointer" : "not-allowed",
                    marginTop: 4,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "PLACE ORDER"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
