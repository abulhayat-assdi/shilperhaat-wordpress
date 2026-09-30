"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useSiteLayout } from "@/lib/site-layout-context";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}


const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#666",
  textDecoration: "none",
  fontFamily: "'Open Sans', sans-serif",
  display: "block",
  padding: "4px 0",
  lineHeight: 1.6,
  transition: "color 0.2s",
};

const headingStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#222",
  marginBottom: 16,
  fontFamily: "'Open Sans', sans-serif",
};

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        style={linkStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#800000"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#666"; }}
      >
        {label}
      </Link>
    </li>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: layout } = useSiteLayout();
  const footerLinks = layout.footerLinks;

  // "Shop By" is built automatically from the store's categories;
  // the manually configured links are only a fallback while loading.
  const [categories, setCategories] = useState<{ name: string; slug: string }[] | null>(null);
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.categories) && json.categories.length > 0) {
          setCategories(json.categories);
        }
      })
      .catch(() => {
        // keep the fallback links if the fetch fails
      });
  }, []);

  const shopLinks = categories
    ? categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name }))
    : footerLinks.shop;

  // Always offer the blog in the Information column, unless the admin
  // already added a blog link somewhere in the footer.
  const hasBlogLink = Object.values(footerLinks).some((group) =>
    group.some((l) => l.href === "/blog" || l.href.startsWith("/blog?"))
  );
  const informationLinks = hasBlogLink
    ? footerLinks.information
    : [...footerLinks.information, { href: "/blog", label: "Blog" }];

  return (
    <footer style={{ backgroundColor: "#f9f9f9", borderTop: "1px solid #eee" }}>

      {/* Main footer body */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-5" style={{ paddingTop: 48, paddingBottom: 40 }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5" style={{ gap: 32 }}>

          {/* ── Brand column ── */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              {layout.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={layout.logoUrl}
                  alt={layout.siteName}
                  style={{ maxHeight: 44, maxWidth: 140, width: "auto", height: "auto", objectFit: "contain", display: "block" }}
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
            </div>

            <p
              style={{
                fontSize: 13, color: "#666", lineHeight: 1.7,
                marginBottom: 16, maxWidth: 240,
                fontFamily: "'Open Sans',sans-serif",
              }}
            >
              {layout.footerDescription}
            </p>

            {/* Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <a
                href={`https://wa.me/${layout.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#666", textDecoration: "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#800000"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#666"; }}
              >
                <Phone size={13} style={{ flexShrink: 0 }} />
                <span>{layout.phone}</span>
              </a>
              {layout.email && (
              <a
                href={`mailto:${layout.email}`}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#666", textDecoration: "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#800000"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#666"; }}
              >
                <Mail size={13} style={{ flexShrink: 0 }} />
                <span>{layout.email}</span>
              </a>
              )}
              {layout.address && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#666" }}>
                <MapPin size={13} style={{ flexShrink: 0 }} />
                <span>{layout.address}</span>
              </div>
              )}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: layout.facebookUrl,  icon: <FacebookIcon />,  label: "Facebook"  },
                { href: layout.twitterUrl,   icon: <TwitterIcon />,   label: "Twitter"   },
                { href: layout.instagramUrl, icon: <InstagramIcon />, label: "Instagram" },
              ].filter((s) => s.href).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "1px solid #ddd",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#666", textDecoration: "none",
                    transition: "border-color 0.2s, color 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#800000";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#800000";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#ddd";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#666";
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Information ── */}
          <div>
            <h3 style={headingStyle}>Information</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {informationLinks.map((link) => (
                <FooterLink key={link.href + link.label} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>

          {/* ── Shop By ── */}
          <div>
            <h3 style={headingStyle}>Shop By</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {shopLinks.map((link) => (
                <FooterLink key={link.href} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h3 style={headingStyle}>Support</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.support.map((link) => (
                <FooterLink key={link.href + link.label} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>

          {/* ── Consumer Policy ── */}
          <div>
            <h3 style={headingStyle}>Consumer Policy</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.policy.map((link) => (
                <FooterLink key={link.href} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #eee" }}>
        <div
          className="w-full max-w-7xl mx-auto px-4 md:px-5"
          style={{ padding: "16px 20px", textAlign: "center" }}
        >
          <p suppressHydrationWarning style={{ fontSize: 12, color: "#999", fontFamily: "'Open Sans',sans-serif" }}>
            {layout.footerCopyright || `© ${currentYear} ${layout.siteName}. All rights reserved.`}
            {" "}· Made with ❤️ to support Bangladesh's artisans
          </p>
        </div>
      </div>
    </footer>
  );
}
