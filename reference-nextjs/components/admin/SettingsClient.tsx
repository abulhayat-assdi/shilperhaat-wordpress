"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload, Eye, EyeOff, Truck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { SiteSetting } from "@/types";
import { siteSettingSchema, type SiteSettingInput } from "@/lib/validations";
import { getImageUrl } from "@/lib/utils";

interface SettingsClientProps {
  settings: SiteSetting;
}

export default function SettingsClient({ settings }: SettingsClientProps) {
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);

  // Steadfast courier credentials (stored in localStorage)
  const [steadfastApiKey, setSteadfastApiKey] = useState("");
  const [steadfastSecretKey, setSteadfastSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [courierSaved, setCourierSaved] = useState(false);
  const [courierTesting, setCourierTesting] = useState(false);
  const [courierTestResult, setCourierTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setSteadfastApiKey(localStorage.getItem("steadfast_api_key") || "");
    setSteadfastSecretKey(localStorage.getItem("steadfast_secret_key") || "");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(siteSettingSchema) as any,
    defaultValues: {
      siteName: settings.siteName,
      footerCopyright: settings.footerCopyright || "",
      whatsappNumber: settings.whatsappNumber || "",
      deliveryCharge: settings.deliveryCharge,
      freeDeliveryMin: settings.freeDeliveryMin || undefined,
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "brand");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.url);
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, logoUrl }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save settings");
    }
  };

  const saveCourierCredentials = () => {
    localStorage.setItem("steadfast_api_key", steadfastApiKey.trim());
    localStorage.setItem("steadfast_secret_key", steadfastSecretKey.trim());
    setCourierSaved(true);
    setCourierTestResult(null);
    setTimeout(() => setCourierSaved(false), 3000);
  };

  const testCourierConnection = async () => {
    setCourierTesting(true);
    setCourierTestResult(null);
    try {
      const params = new URLSearchParams({
        apiKey: steadfastApiKey.trim(),
        secretKey: steadfastSecretKey.trim(),
      });
      const res = await fetch(`/api/courier/steadfast?${params}`);
      const data = await res.json();
      if (res.ok) {
        setCourierTestResult({
          ok: true,
          message: `Connected! Balance: ৳${data.balance ?? "—"}`,
        });
      } else {
        setCourierTestResult({ ok: false, message: data.error || "Connection failed" });
      }
    } catch {
      setCourierTestResult({ ok: false, message: "Network error — could not reach Steadfast" });
    } finally {
      setCourierTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Brand */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Brand Settings</h3>

        {/* Logo */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {logoUrl ? (
                <Image src={getImageUrl(logoUrl)} alt="Logo" width={96} height={96} unoptimized className="object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-lg">S</div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                {isUploadingLogo ? (
                  <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={14} /> Upload Logo</>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} disabled={isUploadingLogo} />
              </label>
              <p className="text-xs text-gray-400 mt-1">PNG or SVG recommended. Max 2MB.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Name</label>
            <input
              {...register("siteName")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Footer Copyright Text</label>
            <input
              {...register("footerCopyright")}
              placeholder="© 2024 Shilperhaat. All rights reserved."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Contact & Social</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
          <input
            {...register("whatsappNumber")}
            placeholder="01700000000"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
          />
          <p className="text-xs text-gray-400 mt-1">Without country code. Used for WhatsApp button.</p>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Delivery Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Charge (৳)</label>
            <input
              {...register("deliveryCharge")}
              type="number"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
            />
            {errors.deliveryCharge && (
              <p className="text-red-500 text-xs mt-1">{errors.deliveryCharge.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Free Delivery Above (৳)
            </label>
            <input
              {...register("freeDeliveryMin")}
              type="number"
              placeholder="e.g. 2000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000]"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to disable free delivery</p>
          </div>
        </div>
      </div>

      {/* Steadfast Courier Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Truck size={18} className="text-[#1a3a6b]" />
          <h3 className="font-bold text-gray-800">Steadfast Courier Settings</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Add your Steadfast API credentials to enable one-click courier submission
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              API Key
            </label>
            <input
              type="text"
              value={steadfastApiKey}
              onChange={(e) => setSteadfastApiKey(e.target.value)}
              placeholder="Your Steadfast API Key"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000] font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={steadfastSecretKey}
                onChange={(e) => setSteadfastSecretKey(e.target.value)}
                placeholder="Your Steadfast Secret Key"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm outline-none focus:border-[#800000] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Get your API credentials from{" "}
            <span className="font-medium text-gray-600">
              portal.packzy.com → Profile → API Credentials
            </span>
          </p>

          {courierTestResult && (
            <div
              className={`text-xs px-3 py-2.5 rounded-lg flex items-center gap-2 ${
                courierTestResult.ok
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {courierTestResult.ok && <CheckCircle2 size={13} />}
              {courierTestResult.message}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={saveCourierCredentials}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                courierSaved
                  ? "bg-green-500 text-white"
                  : "bg-[#1a3a6b] hover:bg-[#142d54] text-white"
              }`}
            >
              {courierSaved ? (
                <>
                  <CheckCircle2 size={14} />
                  Credentials Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Credentials
                </>
              )}
            </button>

            <button
              type="button"
              onClick={testCourierConnection}
              disabled={courierTesting || !steadfastApiKey || !steadfastSecretKey}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {courierTesting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-colors ${
          saved
            ? "bg-green-500 text-white"
            : "bg-[#800000] hover:bg-[#5C0000] text-white disabled:opacity-70"
        }`}
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Saving...</>
        ) : saved ? (
          <>✓ Saved!</>
        ) : (
          <><Save size={16} /> Save Settings</>
        )}
      </motion.button>
    </form>
  );
}
