"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, Check, Phone } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { formatPriceEn } from "@/lib/utils";
import { trackEvent, FB_CURRENCY } from "@/lib/fbpixel";
import { useSiteLayout } from "@/lib/site-layout-context";
import {
  fetchContactSettings,
  DEFAULT_CONTACT_SETTINGS,
  formatWhatsAppUrl,
  formatPhoneUrl,
  type ContactSettings,
} from "@/lib/contact-settings";

function trackAddToCart(product: Product, quantity: number) {
  const price = Number(product.price);
  trackEvent("AddToCart", {
    content_type: "product",
    content_ids: [product.id],
    content_name: product.title,
    contents: [{ id: product.id, quantity, item_price: price }],
    value: price * quantity,
    currency: FB_CURRENCY,
  });
}

interface AddToCartSectionProps {
  product: Product;
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TapButton({
  onClick,
  style,
  onMouseEnter,
  onMouseLeave,
  disabled,
  children,
}: {
  onClick: () => void;
  style: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...style, transition: "opacity 0.15s, background-color 0.15s, transform 0.1s" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const { addItem, updateQuantity, items } = useCart();
  const { toast }  = useToast();
  const router     = useRouter();
  const { data: siteLayout } = useSiteLayout();

  useEffect(() => {
    fetchContactSettings().then(setContactSettings);
  }, []);

  const cartItem       = items.find((i) => i.productId === product.id);
  const currentCartQty = cartItem?.quantity || 0;
  const maxQty         = product.stock - currentCartQty;
  const isOutOfStock   = product.stock === 0;

  const inc = () => setQuantity((q) => Math.min(q + 1, maxQty));
  const dec = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const image = product.images?.[0]?.imageUrl || null;
    if (!cartItem) {
      addItem({
        id: product.id, productId: product.id, title: product.title,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        image, stock: product.stock, slug: product.slug,
      });
      if (quantity > 1) updateQuantity(product.id, quantity);
    } else {
      updateQuantity(product.id, currentCartQty + quantity);
    }
    trackAddToCart(product, quantity);
    setAdded(true);
    toast.success(`${quantity}× "${product.title}" added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleWhatsApp = () => {
    let target = "";
    const csWa = contactSettings?.whatsappUrl;
    const slWa = siteLayout?.whatsappNumber;

    if (csWa && !csWa.includes("XXXXXXXX") && csWa !== DEFAULT_CONTACT_SETTINGS.whatsappUrl) {
      target = csWa;
    } else if (slWa && slWa !== "01700000000") {
      target = slWa;
    } else if (csWa && !csWa.includes("XXXXXXXX")) {
      target = csWa;
    } else if (slWa) {
      target = slWa;
    }

    const message = `Hi! I want to order: ${product.title}\nPrice: ${formatPriceEn(Number(product.price))}\nQty: ${quantity}\nLink: ${typeof window !== "undefined" ? window.location.href : ""}`;
    const url = formatWhatsAppUrl(target, message);
    window.open(url, "_blank");
  };

  const handleCall = () => {
    let target = "";
    const csPhone = contactSettings?.phoneNumber;
    const slPhone = siteLayout?.phone;

    if (csPhone && !csPhone.includes("XXXXXXXX") && csPhone !== DEFAULT_CONTACT_SETTINGS.phoneNumber) {
      target = csPhone;
    } else if (slPhone && slPhone !== "01700000000") {
      target = slPhone;
    } else if (csPhone && !csPhone.includes("XXXXXXXX")) {
      target = csPhone;
    } else if (slPhone) {
      target = slPhone;
    }

    const url = formatPhoneUrl(target);
    window.location.href = url;
  };


  if (isOutOfStock) {
    return (
      <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#F5F5F5", borderRadius: 6, border: "1px solid #eee" }}>
        <p style={{ color: "#888", fontWeight: 500, fontSize: 14 }}>
          This product is currently out of stock
        </p>
      </div>
    );
  }

  const btnBase: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 8,
    fontSize: 14, fontWeight: 600,
    border: "none",
    cursor: "pointer",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Quantity selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "#222", whiteSpace: "nowrap" }}>
          Quantity:
        </label>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 4, overflow: "hidden" }}>
          <button
            onClick={dec}
            disabled={quantity <= 1}
            style={{
              width: 36, height: 36, border: "none",
              backgroundColor: "#f9f9f9",
              color: quantity <= 1 ? "#ccc" : "#333",
              cursor: quantity <= 1 ? "not-allowed" : "pointer",
              fontSize: 20, fontWeight: 700,
              borderRight: "1px solid #ddd",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span style={{ width: 44, height: 36, fontWeight: 600, color: "#222", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {quantity}
          </span>
          <button
            onClick={inc}
            disabled={quantity >= maxQty}
            style={{
              width: 36, height: 36, border: "none",
              backgroundColor: "#f9f9f9",
              color: quantity >= maxQty ? "#ccc" : "#333",
              cursor: quantity >= maxQty ? "not-allowed" : "pointer",
              fontSize: 20, fontWeight: 700,
              borderLeft: "1px solid #ddd",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* 2×2 action buttons */}
      <div className="grid grid-cols-2" style={{ gap: 12 }}>

        {/* ADD TO CART — CSS fade between icon states */}
        <TapButton
          onClick={handleAddToCart}
          style={{
            ...btnBase,
            backgroundColor: added ? "#34BE82" : "#800000",
            color: "#FFFFFF",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = added ? "#34BE82" : "#5C0000"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = added ? "#34BE82" : "#800000"; }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, transition: "opacity 0.2s" }}>
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? "Added" : "Add To Cart"}
          </span>
        </TapButton>

        {/* BUY NOW */}
        <TapButton
          onClick={handleBuyNow}
          style={{ ...btnBase, backgroundColor: "#1a1a2e", color: "#FFFFFF" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0d0d1f"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a2e"; }}
        >
          <ShoppingCart size={16} /> Buy Now
        </TapButton>

        {/* ORDER ON WHATSAPP */}
        <TapButton
          onClick={handleWhatsApp}
          style={{ ...btnBase, backgroundColor: "#25D366", color: "#FFFFFF" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1db954"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#25D366"; }}
        >
          <WhatsAppIcon size={16} /> Order on WhatsApp
        </TapButton>

        {/* CALL FOR ORDER */}
        <TapButton
          onClick={handleCall}
          style={{ ...btnBase, backgroundColor: "#1a3a6b", color: "#FFFFFF" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#142d55"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a3a6b"; }}
        >
          <Phone size={16} /> Call For Order
        </TapButton>
      </div>
    </div>
  );
}

/* ── Sticky Add-to-Cart bar for mobile ─────────────────── */
export function StickyCartBar({ product }: AddToCartSectionProps) {
  const { addItem } = useCart();
  const { toast }   = useToast();

  const handleAdd = () => {
    if (product.stock === 0) return;
    addItem({
      id: product.id, productId: product.id, title: product.title,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      image: product.images?.[0]?.imageUrl || null,
      stock: product.stock, slug: product.slug,
    });
    trackAddToCart(product, 1);
    toast.success(`"${product.title}" added to cart`);
  };

  return (
    <div
      className="md:hidden fixed left-0 right-0 z-40 flex items-center px-4 py-3"
      style={{
        bottom: 64,
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #eee",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
        gap: 12,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="line-clamp-1" style={{ fontSize: 12, color: "#888" }}>
          {product.title}
        </p>
        <p style={{ fontWeight: 700, color: "#800000", fontSize: 15 }}>
          {formatPriceEn(Number(product.price))}
        </p>
      </div>
      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        style={{
          padding: "10px 20px",
          borderRadius: 4, fontWeight: 600, fontSize: 13,
          border: "none",
          cursor: product.stock === 0 ? "not-allowed" : "pointer",
          backgroundColor: product.stock === 0 ? "#F5F5F5" : "#800000",
          color: product.stock === 0 ? "#aaa" : "#FFFFFF",
          flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
          transition: "background-color 0.15s",
        }}
      >
        <ShoppingCart size={15} /> Add to Cart
      </button>
    </div>
  );
}
