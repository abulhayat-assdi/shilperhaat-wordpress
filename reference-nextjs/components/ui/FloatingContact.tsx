"use client";

import { useState, useEffect, useRef } from "react";
import { X, Phone, Mail, ChevronRight } from "lucide-react";
import { fetchContactSettings, type ContactSettings } from "@/lib/contact-settings";
import { useSiteLayout } from "@/lib/site-layout-context";
import { useContactPopup } from "@/lib/contact-popup-context";

export default function FloatingContact() {
  const { open, setOpen } = useContactPopup();
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { data: layout } = useSiteLayout();

  useEffect(() => {
    fetchContactSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!settings || !settings.widgetEnabled) return null;

  const positionClass =
    settings.buttonPosition === "bottom-left"
      ? "left-6 right-auto"
      : "right-6 left-auto";

  const contacts = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      subtitle: "Chat with us on WhatsApp",
      href: settings.whatsappUrl,
      iconBg: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
    {
      key: "phone",
      label: "Call Us",
      subtitle: "Talk to our team directly",
      href: `tel:${settings.phoneNumber}`,
      iconBg: "#1a73e8",
      icon: <Phone size={18} />,
    },
    {
      key: "messenger",
      label: "Messenger",
      subtitle: "Message us on Facebook",
      href: settings.messengerUrl,
      iconBg: "#0084FF",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
        </svg>
      ),
    },
    {
      key: "email",
      label: "Email Us",
      subtitle: "Send us an email",
      href: `mailto:${settings.emailAddress}`,
      iconBg: "#EA4335",
      icon: <Mail size={18} />,
    },
  ];

  return (
    <div
      className={`fixed bottom-6 z-[9999] ${positionClass}`}
      ref={cardRef}
    >
      {/* Popup card */}
      {open && (
        <div
          className="absolute bottom-16 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            right: settings.buttonPosition === "bottom-right" ? 0 : "auto",
            left: settings.buttonPosition === "bottom-left" ? 0 : "auto",
            animation: "contactPopIn 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="relative px-5 pt-5 pb-6"
            style={{ background: "linear-gradient(135deg, #800000 0%, #5C0000 100%)" }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              {layout.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={layout.logoUrl}
                  alt={layout.siteName}
                  style={{ height: 36, width: "auto", maxWidth: 100, objectFit: "contain" }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  {layout.logoLetter || "S"}
                </div>
              )}
              <div>
                <div className="font-bold text-white text-sm">{layout.siteName || "Shilperhaat"}</div>
                <div className="text-white/80 text-xs">{layout.tagline || "Handcraft Marketplace"}</div>
              </div>
            </div>

            <p className="text-white font-semibold text-base">{settings.welcomeMessage}</p>
          </div>

          {/* Contact options */}
          <div className="py-2">
            {contacts.map((c) => (
              <a
                key={c.key}
                href={c.href}
                target={c.key !== "phone" && c.key !== "email" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: c.iconBg }}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{c.label}</div>
                  <div className="text-gray-400 text-xs">{c.subtitle}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-xs">We usually reply within a few minutes</p>
          </div>
        </div>
      )}

      {/* Trigger button — hidden on mobile (bottom nav handles it there), shown on md+ */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Contact us"
        className="relative hidden md:flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        style={{ width: 60, height: 60, background: "none", border: "none", padding: 0 }}
      >
        {/* Pulse ring */}
        {!open && (
          <span
            className="absolute inset-0"
            style={{
              borderRadius: "50% 50% 50% 12px / 50% 50% 50% 12px",
              background: "#800000",
              animation: "contactPulse 2s ease-out infinite",
              opacity: 0,
            }}
          />
        )}

        {/* Blob background */}
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #800000 0%, #5C0000 100%)",
            borderRadius: open ? "50%" : "50% 50% 12px 50%",
            transition: "border-radius 0.25s ease",
            boxShadow: "0 4px 18px rgba(128,0,0,0.55)",
          }}
        />

        {/* Icon */}
        <span className="relative z-10 flex items-center justify-center">
          {open ? (
            <X size={22} strokeWidth={2.5} />
          ) : (
            /* Chat bubble with dots — matches the reference image */
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path
                d="M13 2C7.477 2 3 6.03 3 11c0 2.56 1.13 4.87 2.96 6.52L5 23l5.55-2.46C11 20.84 12 21 13 21c5.523 0 10-4.03 10-9s-4.477-9-10-9z"
                fill="white"
                fillOpacity="0.95"
              />
              <circle cx="9" cy="11" r="1.4" fill="#800000" />
              <circle cx="13" cy="11" r="1.4" fill="#800000" />
              <circle cx="17" cy="11" r="1.4" fill="#800000" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
