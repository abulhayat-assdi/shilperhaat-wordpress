"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface NavDropdownItem {
  href: string;
  label: string;
}

export interface NavItem {
  href: string;
  label: string;
  dropdown?: NavDropdownItem[];
}

export interface FooterLinkItem {
  href: string;
  label: string;
}

export interface SiteLayoutData {
  // Brand
  siteName: string;
  tagline: string;
  logoLetter: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;

  // Contact
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;

  // Social links
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;

  // Navigation
  navItems: NavItem[];

  // Footer
  footerDescription: string;
  footerCopyright: string;
  footerLinks: {
    information: FooterLinkItem[];
    shop: FooterLinkItem[];
    support: FooterLinkItem[];
    policy: FooterLinkItem[];
  };
}

const DEFAULT_DATA: SiteLayoutData = {
  siteName: "Shilperhaat",
  tagline: "Handcraft Marketplace",
  logoLetter: "S",
  logoUrl: "",
  logoWidth: 140,
  logoHeight: 50,

  phone: "01700000000",
  whatsappNumber: "01700000000",
  email: "info@shilperhaat.com",
  address: "Dhaka, Bangladesh",

  facebookUrl: "https://facebook.com/shilperhaat",
  twitterUrl: "https://twitter.com/shilperhaat",
  instagramUrl: "https://instagram.com/shilperhaat",

  navItems: [
    { href: "/shop?category=katha", label: "Katha" },
    { href: "/shop?category=nakshi-katha", label: "Nakshi Katha" },
    {
      href: "/shop?category=chador",
      label: "Chadar",
      dropdown: [
        { href: "/shop?category=chador&filter=cotton", label: "Cotton Chadar" },
        { href: "/shop?category=chador&filter=jamdani", label: "Jamdani Chadar" },
        { href: "/shop?category=chador&filter=muslin", label: "Muslin Chadar" },
      ],
    },
    {
      href: "/shop?category=kambal",
      label: "Blanket",
      dropdown: [
        { href: "/shop?category=kambal&filter=wool", label: "Wool Blanket" },
        { href: "/shop?category=kambal&filter=cotton", label: "Cotton Blanket" },
      ],
    },
    { href: "/shop?category=muslin", label: "Muslin" },
    { href: "/shop?sort=newest", label: "New Arrivals" },
    { href: "/shop?filter=offer", label: "Offer Zone" },
    {
      href: "/shop",
      label: "Collections",
      dropdown: [
        { href: "/shop?category=katha", label: "Katha Collection" },
        { href: "/shop?category=nakshi-katha", label: "Nakshi Katha Collection" },
        { href: "/shop?category=gamcha", label: "Gamcha Collection" },
      ],
    },
    { href: "/about", label: "About" },
  ],

  footerDescription:
    "Bringing Bangladesh's traditional handcraft textiles to your doorstep. Premium-quality Katha, Chadar & Blankets.",
  footerCopyright: "© 2025 Shilperhaat. All rights reserved.",
  footerLinks: {
    information: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
      { href: "/about", label: "Company Information" },
      { href: "/blog", label: "Blog" },
      { href: "/terms-of-use", label: "Terms & Conditions" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/careers", label: "Careers" },
    ],
    shop: [
      { href: "/shop?category=katha", label: "Katha" },
      { href: "/shop?category=nakshi-katha", label: "Nakshi Katha" },
      { href: "/shop?category=chador", label: "Chadar" },
      { href: "/shop?category=kambal", label: "Blanket" },
      { href: "/shop?category=muslin", label: "Muslin" },
      { href: "/shop?category=jamdani", label: "Jamdani" },
    ],
    support: [
      { href: "/support", label: "Support Center" },
      { href: "/how-to-order", label: "How to Order" },
      { href: "/track-order", label: "Order Tracking" },
      { href: "/delivery-policy", label: "Payment" },
      { href: "/shipping-info", label: "Shipping" },
      { href: "/faq", label: "FAQ" },
    ],
    policy: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms-of-use", label: "Terms of Use" },
      { href: "/refund-policy", label: "Refund Policy" },
      { href: "/delivery-policy", label: "Delivery Policy" },
    ],
  },
};

const CONTENT_KEY = "site-layout";

interface SiteLayoutContextValue {
  data: SiteLayoutData;
  update: (patch: Partial<SiteLayoutData>) => void;
  save: () => Promise<boolean>;
  reset: () => Promise<void>;
  isDirty: boolean;
}

const SiteLayoutContext = createContext<SiteLayoutContextValue | null>(null);

export function SiteLayoutProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteLayoutData>(DEFAULT_DATA);
  const [saved, setSaved] = useState<SiteLayoutData>(DEFAULT_DATA);
  const [hydrated, setHydrated] = useState(false);
  const dataRef = React.useRef(data);
  dataRef.current = data;

  useEffect(() => {
    fetch(`/api/site-content/${CONTENT_KEY}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.value) {
          const parsed = { ...DEFAULT_DATA, ...(json.value as Partial<SiteLayoutData>) };
          setData(parsed);
          setSaved(parsed);
        }
      })
      .catch(() => {
        // keep defaults if the fetch fails
      })
      .finally(() => setHydrated(true));
  }, []);

  const update = useCallback((patch: Partial<SiteLayoutData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const current = dataRef.current;
    try {
      const res = await fetch(`/api/admin/site-content/${CONTENT_KEY}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: current }),
      });
      if (!res.ok) return false;
      setSaved(current);
      return true;
    } catch {
      return false;
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      await fetch(`/api/admin/site-content/${CONTENT_KEY}`, { method: "DELETE" });
    } catch {
      // ignore
    }
    setData(DEFAULT_DATA);
    setSaved(DEFAULT_DATA);
  }, []);

  const isDirty = hydrated && JSON.stringify(data) !== JSON.stringify(saved);

  return (
    <SiteLayoutContext.Provider value={{ data, update, save, reset, isDirty }}>
      {children}
    </SiteLayoutContext.Provider>
  );
}

export function useSiteLayout() {
  const ctx = useContext(SiteLayoutContext);
  if (!ctx) throw new Error("useSiteLayout must be used inside SiteLayoutProvider");
  return ctx;
}
