import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Shilperhaat",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1208] via-[#2a1a0a] to-[#4a2c0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#800000] mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Shilperhaat</h1>
          <p className="text-white/60 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your credentials to continue</p>
          <LoginForm />
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2024 Shilperhaat. All rights reserved.
        </p>
      </div>
    </div>
  );
}
