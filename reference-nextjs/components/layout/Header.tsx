"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Menu,
  User,
  Package,
  ChevronDown,
  X,
  Phone,
  HelpCircle,
  Info,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useSiteLayout } from "@/lib/site-layout-context";
import { formatWhatsAppUrl, formatPhoneUrl } from "@/lib/contact-settings";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

/* ─── nav data ─────────────────────────────────────────────── */
type NavItem = {
  href: string;
  label: string;
  dropdown?: { href: string; label: string }[];
};

/* ─── More dropdown helper ──────────────────────────────────── */
function MoreDropdownItem({
  href,
  label,
  icon,
  onClose,
  external,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClose: () => void;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        color: "#333",
        textDecoration: "none",
        fontSize: 14,
        fontFamily: "'Open Sans', sans-serif",
        transition: "background-color 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FFF0F0"; (e.currentTarget as HTMLAnchorElement).style.color = "#800000"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ""; (e.currentTarget as HTMLAnchorElement).style.color = "#333"; }}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [navSticky, setNavSticky]           = useState(false);
  const [moreOpen, setMoreOpen]             = useState(false);
  const [navItems, setNavItems]             = useState<NavItem[]>([]);
  const headerMiddleRef                     = useRef<HTMLDivElement>(null);
  const moreRef                             = useRef<HTMLDivElement>(null);
  const { itemCount, isHydrated, openCartDrawer } = useCart();
  const { data: layout } = useSiteLayout();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(({ categories }) => {
        if (Array.isArray(categories) && categories.length > 0) {
          setNavItems(
            categories.map((c: { name: string; slug: string }) => ({
              href: `/shop?category=${c.slug}`,
              label: c.name,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const mobileNavLinks = navItems.map((n) => ({ href: n.href, label: n.label }));

  /* Sticky nav on scroll */
  useEffect(() => {
    const handleScroll = () => {
      const midHeight = headerMiddleRef.current?.offsetHeight ?? 72;
      setNavSticky(window.scrollY > midHeight);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.paddingTop = navSticky ? "48px" : "0";
    return () => { document.body.style.paddingTop = "0"; };
  }, [navSticky]);

  /* Close "More" dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP HEADER  (md and up)
      ════════════════════════════════════════ */}
      <header className="hidden md:block bg-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

        {/* Row 1 — Logo · Search · Icons */}
        <div ref={headerMiddleRef} className="bg-white" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <div
            className="max-w-7xl mx-auto px-5"
            style={{ height: 72, display: "flex", alignItems: "center", gap: 24 }}
          >
            {/* ── Logo ── */}
            <Link
              href="/"
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
            >
              {layout.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={layout.logoUrl}
                  alt={layout.siteName}
                  style={{ maxHeight: 48, maxWidth: 160, width: "auto", height: "auto", objectFit: "contain", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    backgroundColor: "#800000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {layout.logoLetter}
                </div>
              )}
            </Link>

            {/* ── Search bar ── */}
            <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  height: 44,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  transition: "border-color 0.2s",
                }}
                onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#800000"; }}
                onBlurCapture={(e)  => { (e.currentTarget as HTMLDivElement).style.borderColor = "#ddd"; }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in..."
                  style={{
                    flex: 1, minWidth: 0,
                    outline: "none", border: "none",
                    padding: "0 14px",
                    fontSize: 14, color: "#333",
                    fontFamily: "'Open Sans',sans-serif",
                    backgroundColor: "transparent",
                  }}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  style={{
                    flexShrink: 0, height: "100%", padding: "0 18px",
                    backgroundColor: "#800000",
                    border: "none", cursor: "pointer",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* ── Right icon group ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
              <HeaderIcon href="/track-order" icon={<Package size={22} />} label="Track Order" />
              <HeaderIcon href="/account"     icon={<User    size={22} />} label="Sign In"     />

              {/* Cart */}
              <button
                onClick={openCartDrawer}
                aria-label="Open cart"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "#333", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#800000"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#333"; }}
              >
                <div style={{ position: "relative" }}>
                  <ShoppingCart size={22} />
                  {isHydrated && itemCount > 0 && (
                    <span
                      suppressHydrationWarning
                      style={{
                        position: "absolute", top: -6, right: -8,
                        backgroundColor: "#800000", color: "#fff",
                        fontSize: 10, fontWeight: 700,
                        width: 17, height: 17, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "inherit", whiteSpace: "nowrap" }}>Cart</span>
              </button>

              {/* More dropdown */}
              <div ref={moreRef} style={{ position: "relative", flexShrink: 0 }}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    background: "none", border: "none", cursor: "pointer",
                    color: moreOpen ? "#800000" : "#333",
                    padding: 0,
                  }}
                >
                  {moreOpen ? <X size={22} /> : <Menu size={22} />}
                  <span style={{ fontSize: 11, color: "inherit", whiteSpace: "nowrap" }}>More</span>
                </button>

                {moreOpen && (
                  <div
                    style={{
                      position: "absolute", right: 0, top: "calc(100% + 12px)",
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      border: "1px solid #eee",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      minWidth: 200, zIndex: 1000,
                      overflow: "hidden",
                    }}
                  >
                    <MoreDropdownItem href="/about"    label="About Us"  icon={<Info size={16} />} onClose={() => setMoreOpen(false)} />
                    <MoreDropdownItem href="/blog"     label="Blog"      icon={<BookOpen size={16} />} onClose={() => setMoreOpen(false)} />
                    <MoreDropdownItem href="/faq"      label="FAQs"      icon={<HelpCircle size={16} />} onClose={() => setMoreOpen(false)} />
                    <MoreDropdownItem href={formatPhoneUrl(layout.phone)} label="Call Us" icon={<Phone size={16} />} onClose={() => setMoreOpen(false)} />
                    <MoreDropdownItem
                      href={formatWhatsAppUrl(layout.whatsappNumber)}
                      label="WhatsApp"
                      icon={<MessageCircle size={16} style={{ color: "#25D366" }} />}
                      onClose={() => setMoreOpen(false)}
                      external
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — Dark navigation bar */}
        <nav
          style={{
            backgroundColor: "#041F1E",
            height: 48,
            width: "100%",
            ...(navSticky
              ? { position: "fixed", top: 0, left: 0, zIndex: 1000, boxShadow: "0 2px 12px rgba(0,0,0,0.25)", animation: "slideDown 0.3s ease" }
              : { position: "relative", zIndex: 10 }),
          }}
        >
          <div
            className="max-w-7xl mx-auto px-5 h-full overflow-x-auto"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            <ul
              style={{
                display: "flex", alignItems: "stretch", height: "100%",
                listStyle: "none", margin: 0, padding: 0,
                minWidth: "max-content",
              }}
            >
              {navItems.map((item) => (
                <NavMenuItem key={item.href} item={item} />
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* ════════════════════════════════════════
          MOBILE HEADER  (below md)
      ════════════════════════════════════════ */}
      <header
        className="md:hidden sticky top-0 z-50 bg-white"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        {/* Main row: hamburger | logo | search | cart */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", minHeight: 52,
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{ flexShrink: 0, padding: 6, background: "none", border: "none", cursor: "pointer" }}
            aria-label="Open menu"
          >
            <Menu size={22} style={{ color: "#333" }} />
          </button>

          <Link
            href="/"
            style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            {layout.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={layout.logoUrl}
                alt={layout.siteName}
                style={{ maxHeight: 40, maxWidth: 130, width: "auto", height: "auto", objectFit: "contain", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: "#800000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 13,
                }}
              >
                {layout.logoLetter}
              </div>
            )}
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            style={{
              flex: 1, display: "flex", alignItems: "stretch",
              border: "1px solid #ddd", borderRadius: 4,
              overflow: "hidden", minWidth: 0,
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1, minWidth: 0, outline: "none", border: "none",
                padding: "6px 12px", fontSize: 12, color: "#333",
                fontFamily: "'Open Sans',sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                flexShrink: 0, padding: "0 10px",
                backgroundColor: "#800000",
                border: "none", cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center",
              }}
            >
              <Search size={13} />
            </button>
          </form>

          {/* Cart */}
          <button
            onClick={openCartDrawer}
            aria-label="Cart"
            style={{ flexShrink: 0, position: "relative", padding: 6, color: "#333", background: "none", border: "none", cursor: "pointer" }}
          >
            <ShoppingCart size={22} />
            {isHydrated && itemCount > 0 && (
              <span
                suppressHydrationWarning
                style={{
                  position: "absolute", top: 0, right: 0,
                  backgroundColor: "#800000", color: "#fff",
                  fontSize: 9, fontWeight: 700,
                  width: 15, height: 15, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable category strip */}
        <div
          className="overflow-x-auto"
          style={{ backgroundColor: "#041F1E", scrollbarWidth: "none" } as React.CSSProperties}
        >
          <div style={{ display: "flex", alignItems: "center", padding: "0 8px", minWidth: "max-content" }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: "white", fontSize: 12, fontWeight: 500,
                  padding: "8px 12px", textDecoration: "none",
                  whiteSpace: "nowrap", flexShrink: 0,
                  fontFamily: "'Open Sans',sans-serif",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

<MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={mobileNavLinks}
      />

      <CartDrawer />
    </>
  );
}

/* ─── HeaderIcon ────────────────────────────────────────────── */
function HeaderIcon({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        color: "#333", textDecoration: "none", flexShrink: 0,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#800000"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#333"; }}
    >
      {icon}
      <span style={{ fontSize: 11, color: "inherit", whiteSpace: "nowrap", fontFamily: "'Open Sans',sans-serif" }}>
        {label}
      </span>
    </Link>
  );
}

/* ─── NavMenuItem with hover dropdown ───────────────────────── */
function NavMenuItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  return (
    <li
      style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={() => item.dropdown && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          height: "100%", padding: "0 16px",
          color: "#FFFFFF",
          fontSize: 14, fontWeight: 500,
          fontFamily: "'Open Sans',sans-serif",
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#800000"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF"; }}
      >
        {item.label}
        {item.dropdown && <ChevronDown size={10} style={{ opacity: 0.7 }} />}
      </Link>

      {item.dropdown && open && (
        <ul
          style={{
            position: "absolute", top: "100%", left: 0,
            listStyle: "none", margin: 0, padding: "8px 0",
            backgroundColor: "#FFFFFF",
            borderRadius: "0 0 6px 6px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            minWidth: 180, zIndex: 999,
            animation: "fadeInDown 0.18s ease",
          }}
        >
          {item.dropdown.map((sub) => (
            <li key={sub.href}>
              <Link
                href={sub.href}
                style={{
                  display: "block", padding: "9px 18px",
                  color: "#444", fontSize: 13,
                  textDecoration: "none",
                  fontFamily: "'Open Sans',sans-serif",
                  transition: "background-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FFF0F0"; (e.currentTarget as HTMLAnchorElement).style.color = "#800000"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#444"; }}
              >
                {sub.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
