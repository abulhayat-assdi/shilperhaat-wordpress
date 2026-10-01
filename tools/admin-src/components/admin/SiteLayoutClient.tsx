"use client";

import { useState, useRef } from "react";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
} from "lucide-react";
import {
  useSiteLayout,
  NavItem,
  NavDropdownItem,
  FooterLinkItem,
} from "@/lib/site-layout-context";

type Tab = "brand" | "navigation" | "contact" | "footer";

/* ─── reusable field components ──────────────────────────────── */
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #D1D5DB",
        borderRadius: 6,
        fontSize: 14,
        color: "#111827",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.15s",
        fontFamily: "inherit",
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#800000"; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "#D1D5DB"; }}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #D1D5DB",
        borderRadius: 6,
        fontSize: 14,
        color: "#111827",
        outline: "none",
        resize: "vertical",
        boxSizing: "border-box",
        fontFamily: "inherit",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#800000"; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "#D1D5DB"; }}
    />
  );
}


function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        padding: "24px",
        marginBottom: 20,
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #F3F4F6" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ─── Link list editor ────────────────────────────────────────── */
function LinkListEditor({
  items,
  onChange,
}: {
  items: FooterLinkItem[];
  onChange: (items: FooterLinkItem[]) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const addItem = () => {
    const next = [...items, { href: "", label: "" }];
    onChange(next);
    setExpandedIdx(next.length - 1);
  };

  const removeItem = (i: number) => {
    const next = items.filter((_, idx) => idx !== i);
    onChange(next);
    if (expandedIdx === i) setExpandedIdx(null);
  };

  const updateItem = (i: number, patch: Partial<FooterLinkItem>) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  };

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            marginBottom: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", backgroundColor: "#F9FAFB",
              cursor: "pointer",
            }}
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
          >
            <GripVertical size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: "#374151", fontWeight: 500 }}>
              {item.label || <em style={{ color: "#9CA3AF" }}>Untitled</em>}
            </span>
            <span style={{ fontSize: 11, color: "#9CA3AF", marginRight: 4 }}>{item.href}</span>
            <button
              onClick={(e) => { e.stopPropagation(); removeItem(i); }}
              style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: 2 }}
            >
              <Trash2 size={14} />
            </button>
            {expandedIdx === i ? <ChevronUp size={14} style={{ color: "#9CA3AF" }} /> : <ChevronDown size={14} style={{ color: "#9CA3AF" }} />}
          </div>
          {expandedIdx === i && (
            <div style={{ padding: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Label</label>
                <Input value={item.label} onChange={(v) => updateItem(i, { label: v })} placeholder="Label text" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>URL / Path</label>
                <Input value={item.href} onChange={(v) => updateItem(i, { href: v })} placeholder="/path-here" />
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={addItem}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#800000", background: "none", border: "1px dashed #800000",
          borderRadius: 6, padding: "7px 14px", cursor: "pointer", width: "100%",
          justifyContent: "center", marginTop: 4,
        }}
      >
        <Plus size={14} /> Add Link
      </button>
    </div>
  );
}

/* ─── Nav item editor ─────────────────────────────────────────── */
function NavItemEditor({
  items,
  onChange,
}: {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<number, boolean>>({});

  const add = () => {
    const next = [...items, { href: "", label: "" }];
    onChange(next);
    setExpandedIdx(next.length - 1);
  };

  const remove = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (expandedIdx === i) setExpandedIdx(null);
  };

  const update = (i: number, patch: Partial<NavItem>) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  };

  const addDropdown = (i: number) => {
    const existing = items[i].dropdown || [];
    update(i, { dropdown: [...existing, { href: "", label: "" }] });
    setExpandedDropdowns((prev) => ({ ...prev, [i]: true }));
  };

  const removeDropdown = (i: number) => {
    update(i, { dropdown: undefined });
  };

  const updateDropdownItem = (navIdx: number, dropIdx: number, patch: Partial<NavDropdownItem>) => {
    const existing = items[navIdx].dropdown || [];
    update(navIdx, {
      dropdown: existing.map((d, di) => (di === dropIdx ? { ...d, ...patch } : d)),
    });
  };

  const removeDropdownItem = (navIdx: number, dropIdx: number) => {
    const existing = items[navIdx].dropdown || [];
    const next = existing.filter((_, di) => di !== dropIdx);
    update(navIdx, { dropdown: next.length ? next : undefined });
  };

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{ border: "1px solid #E5E7EB", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}
        >
          {/* Item header row */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", backgroundColor: "#F9FAFB", cursor: "pointer" }}
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
          >
            <GripVertical size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#374151" }}>
              {item.label || <em style={{ color: "#9CA3AF" }}>Untitled</em>}
            </span>
            {item.dropdown && (
              <span style={{ fontSize: 11, backgroundColor: "#FEF3C7", color: "#92400E", borderRadius: 4, padding: "2px 6px" }}>
                {item.dropdown.length} sub-items
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); remove(i); }}
              style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: 2 }}
            >
              <Trash2 size={14} />
            </button>
            {expandedIdx === i ? <ChevronUp size={14} style={{ color: "#9CA3AF" }} /> : <ChevronDown size={14} style={{ color: "#9CA3AF" }} />}
          </div>

          {expandedIdx === i && (
            <div style={{ padding: 14 }}>
              {/* Label + URL */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Label</label>
                  <Input value={item.label} onChange={(v) => update(i, { label: v })} placeholder="Nav label" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>URL / Path</label>
                  <Input value={item.href} onChange={(v) => update(i, { href: v })} placeholder="/shop?category=katha" />
                </div>
              </div>

              {/* Dropdown sub-items */}
              <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Dropdown Sub-items
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!item.dropdown && (
                      <button
                        onClick={() => addDropdown(i)}
                        style={{ fontSize: 12, color: "#800000", background: "none", border: "1px solid #800000", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}
                      >
                        + Add Dropdown
                      </button>
                    )}
                    {item.dropdown && (
                      <>
                        <button
                          onClick={() => addDropdown(i)}
                          style={{ fontSize: 12, color: "#800000", background: "none", border: "1px solid #800000", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}
                        >
                          + Add
                        </button>
                        <button
                          onClick={() => removeDropdown(i)}
                          style={{ fontSize: 12, color: "#EF4444", background: "none", border: "1px solid #EF4444", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}
                        >
                          Remove All
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {item.dropdown?.map((sub, di) => (
                  <div
                    key={di}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 6, alignItems: "center" }}
                  >
                    <Input value={sub.label} onChange={(v) => updateDropdownItem(i, di, { label: v })} placeholder="Sub label" />
                    <Input value={sub.href} onChange={(v) => updateDropdownItem(i, di, { href: v })} placeholder="/path" />
                    <button
                      onClick={() => removeDropdownItem(i, di)}
                      style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {!item.dropdown && (
                  <p style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>No dropdown — click "Add Dropdown" to create one.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={add}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#800000", background: "none", border: "1px dashed #800000",
          borderRadius: 6, padding: "8px 14px", cursor: "pointer", width: "100%",
          justifyContent: "center", marginTop: 4,
        }}
      >
        <Plus size={14} /> Add Nav Item
      </button>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function SiteLayoutClient() {
  const { data, update, save, reset, isDirty } = useSiteLayout();
  const [activeTab, setActiveTab] = useState<Tab>("brand");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Maximum size is 2MB.");
      e.target.value = "";
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "site");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        update({ logoUrl: data.url });
      } else {
        alert("Logo upload failed. Please try again.");
      }
    } catch {
      alert("Logo upload failed. Please try again.");
    }
    e.target.value = "";
  };

  const handleSave = async () => {
    const ok = await save();
    if (!ok) {
      alert("Failed to save. Please try again.");
      return;
    }
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "brand",      label: "Brand & Logo"     },
    { id: "navigation", label: "Navigation"       },
    { id: "contact",    label: "Contact & Social" },
    { id: "footer",     label: "Footer"           },
  ];

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'Inter', 'Open Sans', sans-serif" }}>
      {/* Page title + Save bar */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Site Layout</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
            Manage everything that appears in the header and footer of your store.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isDirty && (
            <span style={{ fontSize: 12, color: "#D97706", display: "flex", alignItems: "center", gap: 4 }}>
              <AlertCircle size={13} /> Unsaved changes
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ fontSize: 12, color: "#16A34A", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={13} /> Saved
            </span>
          )}
          <button
            onClick={() => { if (confirm("Reset all settings to default values?")) reset(); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 6,
              border: "1px solid #D1D5DB", backgroundColor: "#fff",
              fontSize: 13, color: "#6B7280", cursor: "pointer",
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 6,
              border: "none", backgroundColor: "#800000",
              fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
            }}
          >
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex", gap: 2,
          borderBottom: "1px solid #E5E7EB",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              border: "none", background: "none",
              fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "#800000" : "#6B7280",
              borderBottom: activeTab === tab.id ? "2px solid #800000" : "2px solid transparent",
              marginBottom: -1, cursor: "pointer", whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Brand & Logo ─────────────────────────────────────── */}
      {activeTab === "brand" && (
        <div>
          <SectionCard title="Logo & Brand Identity">
            {/* Site Name + Tagline */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
              <Field label="Site Name" hint="Shown in logo area and browser tab">
                <Input value={data.siteName} onChange={(v) => update({ siteName: v })} placeholder="Shilperhaat" />
              </Field>
              <Field label="Tagline" hint="Small text below the site name">
                <Input value={data.tagline} onChange={(v) => update({ tagline: v })} placeholder="Handcraft Marketplace" />
              </Field>
            </div>

            {/* Logo upload area */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Logo Image
              </label>
              <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>
                Upload a logo to replace the letter circle everywhere on the site. PNG, JPG, SVG, WebP — max 2 MB.
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              {/* Clickable upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${data.logoUrl ? "#800000" : "#D1D5DB"}`,
                  borderRadius: 8,
                  padding: data.logoUrl ? "16px" : "28px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: data.logoUrl ? "#FFF0F0" : "#FAFAFA",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#800000"; (e.currentTarget as HTMLDivElement).style.backgroundColor = "#FFF0F0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = data.logoUrl ? "#800000" : "#D1D5DB"; (e.currentTarget as HTMLDivElement).style.backgroundColor = data.logoUrl ? "#FFF0F0" : "#FAFAFA"; }}
              >
                {data.logoUrl ? (
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.logoUrl}
                      alt="Logo preview"
                      style={{ maxHeight: 80, maxWidth: 220, objectFit: "contain", margin: "0 auto", display: "block" }}
                    />
                    <p style={{ fontSize: 12, color: "#800000", marginTop: 8, fontWeight: 500 }}>Click to change</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} style={{ color: "#9CA3AF", margin: "0 auto 8px", display: "block" }} />
                    <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Click to upload logo</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>PNG, JPG, SVG, WebP — max 2 MB</p>
                  </div>
                )}
              </div>

              {/* Remove button */}
              {data.logoUrl && (
                <button
                  onClick={() => update({ logoUrl: "" })}
                  style={{
                    marginTop: 8, display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "#EF4444",
                    background: "none", border: "1px solid #EF4444",
                    borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                  }}
                >
                  <X size={13} /> Remove logo
                </button>
              )}
            </div>

            {/* Width + Height — only shown when logo is uploaded */}
            {data.logoUrl && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
                <Field label="Logo Width (px)" hint="Display width in header / footer">
                  <Input
                    value={String(data.logoWidth || 140)}
                    onChange={(v) => update({ logoWidth: Math.max(1, parseInt(v, 10) || 140) })}
                    placeholder="140"
                    type="number"
                  />
                </Field>
                <Field label="Logo Height (px)" hint="Display height in header / footer">
                  <Input
                    value={String(data.logoHeight || 50)}
                    onChange={(v) => update({ logoHeight: Math.max(1, parseInt(v, 10) || 50) })}
                    placeholder="50"
                    type="number"
                  />
                </Field>
              </div>
            )}

            {/* Fallback letter — only shown when no logo uploaded */}
            {!data.logoUrl && (
              <Field label="Logo Letter (fallback)" hint="Letter shown in the circle when no image is uploaded">
                <div style={{ maxWidth: 120 }}>
                  <Input
                    value={data.logoLetter}
                    onChange={(v) => update({ logoLetter: v.slice(0, 1).toUpperCase() || "S" })}
                    placeholder="S"
                  />
                </div>
              </Field>
            )}

            {/* Live preview */}
            <div style={{ marginTop: 16, padding: 16, backgroundColor: "#FAF0E6", borderRadius: 8, border: "1px dashed #E5E7EB" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {data.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.logoUrl}
                    alt={data.siteName}
                    style={{
                      maxHeight: 48,
                      maxWidth: 160,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
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
                    {data.logoLetter}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────────── */}
      {activeTab === "navigation" && (
        <div>
          <SectionCard title="Navigation Items">
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
              These items appear in the dark navigation bar. Expand any item to edit its label, URL, and optional dropdown sub-items.
            </p>
            <NavItemEditor
              items={data.navItems}
              onChange={(navItems) => update({ navItems })}
            />
          </SectionCard>
        </div>
      )}

      {/* ── Contact & Social ─────────────────────────────────── */}
      {activeTab === "contact" && (
        <div>
          <SectionCard title="Contact Information">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Phone Number" hint="Shown in footer and More menu">
                <Input value={data.phone} onChange={(v) => update({ phone: v })} placeholder="01700000000" />
              </Field>
              <Field label="WhatsApp Number" hint="Used for WhatsApp links (digits only, with country code)">
                <Input value={data.whatsappNumber} onChange={(v) => update({ whatsappNumber: v })} placeholder="8801700000000" />
              </Field>
              <Field label="Email Address">
                <Input value={data.email} onChange={(v) => update({ email: v })} placeholder="info@shilperhaat.com" type="email" />
              </Field>
              <Field label="Address">
                <Input value={data.address} onChange={(v) => update({ address: v })} placeholder="Dhaka, Bangladesh" />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Social Media Links">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label="Facebook URL">
                <Input value={data.facebookUrl} onChange={(v) => update({ facebookUrl: v })} placeholder="https://facebook.com/yourpage" />
              </Field>
              <Field label="Twitter / X URL">
                <Input value={data.twitterUrl} onChange={(v) => update({ twitterUrl: v })} placeholder="https://twitter.com/yourhandle" />
              </Field>
              <Field label="Instagram URL">
                <Input value={data.instagramUrl} onChange={(v) => update({ instagramUrl: v })} placeholder="https://instagram.com/yourpage" />
              </Field>
            </div>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
              Leave a field empty to hide that social icon from the footer.
            </p>
          </SectionCard>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────── */}
      {activeTab === "footer" && (
        <div>
          <SectionCard title="Footer Brand Section">
            <Field label="Footer Description" hint="Short paragraph shown below the logo in the footer">
              <Textarea
                value={data.footerDescription}
                onChange={(v) => update({ footerDescription: v })}
                rows={2}
                placeholder="Bringing Bangladesh's traditional handcraft textiles to your doorstep..."
              />
            </Field>
            <Field label="Copyright Text" hint="Shown in the bottom bar of the footer">
              <Input
                value={data.footerCopyright}
                onChange={(v) => update({ footerCopyright: v })}
                placeholder="© 2025 Shilperhaat. All rights reserved."
              />
            </Field>
          </SectionCard>

          <SectionCard title="Information Links">
            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12, lineHeight: 1.6 }}>
              Tip: add a link with a new path (e.g. <code>/our-story</code>) and an editable page is
              created automatically in the <strong>Pages</strong> manager when you save — no 404s.
            </p>
            <LinkListEditor
              items={data.footerLinks.information}
              onChange={(information) =>
                update({ footerLinks: { ...data.footerLinks, information } })
              }
            />
          </SectionCard>

          <SectionCard title="Shop By Links">
            <div
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "12px 14px", backgroundColor: "#F0FDF4",
                border: "1px solid #BBF7D0", borderRadius: 8,
              }}
            >
              <CheckCircle2 size={16} style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
                Shop By links are generated automatically from your <strong>Categories</strong>.
                Every category you add appears here and links to its product listing — no manual
                setup needed. Manage them from the <strong>Categories</strong> page.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Support Links">
            <LinkListEditor
              items={data.footerLinks.support}
              onChange={(support) =>
                update({ footerLinks: { ...data.footerLinks, support } })
              }
            />
          </SectionCard>

          <SectionCard title="Consumer Policy Links">
            <LinkListEditor
              items={data.footerLinks.policy}
              onChange={(policy) =>
                update({ footerLinks: { ...data.footerLinks, policy } })
              }
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
}
