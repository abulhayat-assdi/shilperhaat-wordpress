"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight, MessageCircle, User } from "lucide-react";
import { useSiteLayout } from "@/lib/site-layout-context";
import { formatWhatsAppUrl } from "@/lib/contact-settings";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

export default function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const { data: siteLayout } = useSiteLayout();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop — always in DOM, fade via opacity transition */}
      <div
        className="fixed inset-0 z-[60]"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
        onClick={onClose}
      />

      {/* Drawer — always in DOM, slide via transform transition */}
      <div
        className="fixed inset-y-0 left-0 z-[70] flex flex-col bg-white"
        style={{
          width: "80%",
          maxWidth: 300,
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {/* ── Orange header ── */}
        <div
          style={{
            backgroundColor: "#800000",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 15,
              }}
            >
              S
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>
              Shilperhaat
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 4 }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── Sign-in section ── */}
        <Link
          href="/account"
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 20px",
            backgroundColor: "#fff3e0",
            textDecoration: "none",
            borderBottom: "1px solid #eee",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 44, height: 44, borderRadius: "50%",
              backgroundColor: "#800000",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={22} style={{ color: "white" }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>Hello there!</div>
            <div style={{ fontSize: 13, color: "#800000", fontWeight: 500 }}>Sign in / Register →</div>
          </div>
        </Link>

        {/* ── Nav Links ── */}
        <nav style={{ flex: 1, overflowY: "auto" }}>
          {[...navLinks, { href: "/blog", label: "Blog" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px",
                color: "#333",
                textDecoration: "none",
                borderBottom: "1px solid #eee",
                fontSize: 15, fontWeight: 500,
                transition: "background-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fff8f0";
                (e.currentTarget as HTMLAnchorElement).style.color = "#800000";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "";
                (e.currentTarget as HTMLAnchorElement).style.color = "#333";
              }}
            >
              <span>{link.label}</span>
              <ChevronRight size={16} style={{ color: "#bbb", flexShrink: 0 }} />
            </Link>
          ))}

          {/* ── Get in touch ── */}
          <div style={{ padding: "20px 20px 8px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
              GET IN TOUCH
            </p>
            <a
              href={formatWhatsAppUrl(siteLayout.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 0",
                color: "#25D366",
                textDecoration: "none",
                fontSize: 14, fontWeight: 500,
              }}
            >
              <MessageCircle size={20} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </nav>

        {/* ── Footer strip ── */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #eee", backgroundColor: "#f9f9f9", flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center" }}>
            © 2025 Shilperhaat. Handcraft Marketplace.
          </p>
        </div>
      </div>
    </>
  );
}
