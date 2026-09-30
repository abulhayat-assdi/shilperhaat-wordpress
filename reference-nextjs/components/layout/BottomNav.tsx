"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Menu, MessageCircle, MessageSquare } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useContactPopup } from "@/lib/contact-popup-context";
import { useSiteLayout } from "@/lib/site-layout-context";
import { formatWhatsAppUrl } from "@/lib/contact-settings";

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount, isHydrated, openCartDrawer } = useCart();
  const { setOpen: openContactPopup } = useContactPopup();
  const { data: siteLayout } = useSiteLayout();
  const whatsappUrl = formatWhatsAppUrl(siteLayout.whatsappNumber);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EEEEEE] safe-area-inset-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {/* Menu */}
        <NavItem href="/shop" icon={Menu} label="Menu" active={isActive("/shop")} />

        {/* Cart — opens drawer */}
        <button
          onClick={openCartDrawer}
          className="flex flex-col items-center gap-0.5 px-2"
          aria-label="Cart"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <ShoppingCart size={22} style={{ color: isHydrated && itemCount > 0 ? "#800000" : "#888888" }} strokeWidth={isHydrated && itemCount > 0 ? 2.5 : 1.75} />
            {isHydrated && itemCount > 0 && (
              <span
                suppressHydrationWarning
                className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                style={{ backgroundColor: "#800000" }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </div>
          <span className="text-xs" style={{ color: isHydrated && itemCount > 0 ? "#800000" : "#888888", fontWeight: isHydrated && itemCount > 0 ? 600 : 400 }}>
            Cart
          </span>
        </button>

        {/* Home — elevated center button */}
        <div className="relative flex flex-col items-center">
          <Link href="/" aria-label="Home">
            <div
              className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center -mt-5 border-4 border-white"
              style={{
                backgroundColor: isActive("/") ? "#800000" : "#041F1E",
                transition: "transform 0.1s ease, background-color 0.2s",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(0.92)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
            >
              <Home size={24} className="text-white" />
            </div>
          </Link>
          <span className="text-xs mt-0.5" style={{ color: "#888888" }}>Home</span>
        </div>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-2"
          aria-label="WhatsApp"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <MessageCircle size={22} className="text-[#16a34a]" />
          </div>
          <span className="text-xs" style={{ color: "#888888" }}>WhatsApp</span>
        </a>

        {/* Contact — opens the shared contact popup */}
        <button
          onClick={() => openContactPopup(true)}
          className="flex flex-col items-center gap-0.5 px-2"
          aria-label="Contact"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <MessageSquare size={22} style={{ color: "#888888" }} strokeWidth={1.75} />
          </div>
          <span className="text-xs" style={{ color: "#888888" }}>Contact</span>
        </button>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-2"
      aria-label={label}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        <Icon
          size={22}
          style={{ color: active ? "#800000" : "#888888" }}
          strokeWidth={active ? 2.5 : 1.75}
        />
      </div>
      <span
        className="text-xs"
        style={{
          color: active ? "#800000" : "#888888",
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
      </span>
    </Link>
  );
}
