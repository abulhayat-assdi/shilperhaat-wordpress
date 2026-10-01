"use client";

import { useState, useEffect } from "react";
import { Save, ChevronRight, Phone, Mail } from "lucide-react";
import {
  fetchContactSettings,
  saveContactSettings,
  DEFAULT_CONTACT_SETTINGS,
  type ContactSettings,
} from "@/lib/contact-settings";

export default function ContactWidgetClient() {
  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchContactSettings().then(setSettings);
  }, []);

  function handleChange<K extends keyof ContactSettings>(key: K, value: ContactSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const ok = await saveContactSettings(settings);
    if (!ok) {
      alert("Failed to save. Please try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const previewContacts = [
    { label: "WhatsApp", subtitle: "Chat with us on WhatsApp", iconBg: "#25D366", icon: "💬" },
    { label: "Call Us",  subtitle: "Talk to our team directly",  iconBg: "#1a73e8", icon: "📞" },
    { label: "Messenger",subtitle: "Message us on Facebook",    iconBg: "#0084FF", icon: "💙" },
    { label: "Email Us", subtitle: "Send us an email",          iconBg: "#EA4335", icon: "✉️" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Contact Widget Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage the floating contact button that appears on your website
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            saved ? "bg-green-500 text-white" : "bg-[#800000] hover:bg-[#5C0000] text-white"
          }`}
        >
          {saved ? (
            <>✓ Saved!</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1 — Widget Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Widget Settings</h3>

            {/* Enable toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-800 text-sm">Enable Contact Widget</div>
                <div className="text-xs text-gray-400 mt-0.5">Show the floating button on your website</div>
              </div>
              <button
                onClick={() => handleChange("widgetEnabled", !settings.widgetEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.widgetEnabled ? "bg-[#800000]" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={settings.widgetEnabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    settings.widgetEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Button Position */}
            <div className="py-3 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Position</label>
              <div className="flex gap-3">
                {(["bottom-right", "bottom-left"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handleChange("buttonPosition", pos)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                      settings.buttonPosition === pos
                        ? "border-[#800000] bg-[#FFF0F0] text-[#800000]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {pos === "bottom-right" ? "Bottom Right" : "Bottom Left"}
                  </button>
                ))}
              </div>
            </div>

            {/* Welcome message */}
            <div className="pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Welcome Message</label>
              <input
                type="text"
                value={settings.welcomeMessage}
                onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                placeholder="আমাদের সাথে যোগাযোগ করুন"
              />
            </div>
          </div>

          {/* Section 2 — Contact Links */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Contact Links</h3>

            <div className="space-y-5">
              {/* WhatsApp */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs">💬</span>
                  WhatsApp Link
                </label>
                <input
                  type="url"
                  value={settings.whatsappUrl}
                  onChange={(e) => handleChange("whatsappUrl", e.target.value)}
                  placeholder="https://wa.me/8801700000000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Format: https://wa.me/ followed by country code and number. Example: https://wa.me/8801700000000
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#1a73e8] flex items-center justify-center text-white">
                    <Phone size={11} />
                  </span>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={settings.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="01700000000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                />
                <p className="text-xs text-gray-400 mt-1">Enter number without spaces or dashes</p>
              </div>

              {/* Messenger */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0084FF] flex items-center justify-center text-white text-xs">💙</span>
                  Facebook Messenger Link
                </label>
                <input
                  type="url"
                  value={settings.messengerUrl}
                  onChange={(e) => handleChange("messengerUrl", e.target.value)}
                  placeholder="https://m.me/yourpagename"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Format: https://m.me/ followed by your Facebook page username
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#EA4335] flex items-center justify-center text-white">
                    <Mail size={11} />
                  </span>
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) => handleChange("emailAddress", e.target.value)}
                  placeholder="info@shilperhaat.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
                />
                <p className="text-xs text-gray-400 mt-1">Customers will send email to this address</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Live Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4">Live Preview</h3>

            {/* Phone frame mockup */}
            <div
              className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-800 mx-auto"
              style={{ maxWidth: 220 }}
            >
              {/* Phone screen */}
              <div className="bg-gray-100 relative" style={{ minHeight: 380 }}>
                {/* Status bar */}
                <div className="bg-gray-800 h-5 flex items-center justify-end px-3">
                  <div className="text-white text-xs opacity-70">9:41</div>
                </div>

                {/* Popup preview */}
                <div className="mx-2 mt-3 rounded-xl overflow-hidden shadow-md bg-white text-xs">
                  {/* Header */}
                  <div
                    className="px-3 py-3"
                    style={{ background: "linear-gradient(135deg, #800000 0%, #5C0000 100%)" }}
                  >
                    <div className="font-bold text-white text-xs mb-0.5">Shilperhaat</div>
                    <div className="text-white/80 text-[10px] leading-tight">
                      {settings.welcomeMessage}
                    </div>
                  </div>

                  {/* Options */}
                  {previewContacts.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 px-3 py-2 border-b border-gray-50 last:border-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                        style={{ background: c.iconBg }}
                      >
                        {c.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-[10px]">{c.label}</div>
                        <div className="text-gray-400 text-[9px] truncate">{c.subtitle}</div>
                      </div>
                      <ChevronRight size={10} className="text-gray-300 flex-shrink-0" />
                    </div>
                  ))}

                  <div className="px-3 py-2 text-center text-[9px] text-gray-400">
                    We usually reply within a few minutes
                  </div>
                </div>

                {/* Floating button */}
                <div
                  className="absolute bottom-4 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg text-base"
                  style={{ background: settings.widgetEnabled ? "#800000" : "#d1d5db" }}
                >
                  💬
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">
              {settings.widgetEnabled ? "Widget is enabled" : "Widget is disabled"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
