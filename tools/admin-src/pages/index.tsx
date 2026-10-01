// Client-side equivalents of app/admin/**/page.tsx (which were server components reading Prisma directly).
// Each adapter loads its data from the plugin's REST API and renders the original client component.
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LoginForm from "@/components/admin/LoginForm";
import ProductsClient from "@/components/admin/ProductsClient";
import ProductForm from "@/components/admin/ProductForm";
import CategoriesClient from "@/components/admin/CategoriesClient";
import BannersClient from "@/components/admin/BannersClient";
import ReviewsClient from "@/components/admin/ReviewsClient";
import OrdersClient from "@/components/admin/OrdersClient";
import SettingsClient from "@/components/admin/SettingsClient";
import AccessManagementClient from "@/components/admin/AccessManagementClient";
import ContactWidgetClient from "@/components/admin/ContactWidgetClient";
import SiteLayoutClient from "@/components/admin/SiteLayoutClient";
import CouponsClient from "@/components/admin/CouponsClient";
import PagesManager from "@/components/admin/PagesManager";
import { useAdminSession } from "@/lib/admin-session-context";
import { Package, ShoppingBag, Clock, Tag, Star } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
function useData<T = any>(path: string): { data: T | null; tick: number; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("sh:refresh", h);
    return () => window.removeEventListener("sh:refresh", h);
  }, []);
  useEffect(() => {
    let alive = true;
    setData(null);
    fetch("/api/admin/data/" + path)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => { if (!alive) return; if (!ok) setError(j.error || "Failed to load"); else setData(j as T); })
      .catch(() => alive && setError("Failed to load"));
    return () => { alive = false; };
  }, [path, tick]);
  return { data, tick, error };
}

function Loading({ title, error }: { title: string; error?: string | null }) {
  const { session } = useAdminSession();
  return (
    <AdminLayout title={title} adminName={session?.name}>
      <div className="text-sm text-gray-400 py-10 text-center">{error ? <span className="text-red-500">{error}</span> : "Loading…"}</div>
    </AdminLayout>
  );
}

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1208] via-[#2a1a0a] to-[#4a2c0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#800000] mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Shilperhaat</h1>
          <p className="text-white/60 text-sm mt-1">Admin Panel</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your credentials to continue</p>
          <LoginForm />
        </div>
        <p className="text-center text-white/40 text-xs mt-6">© 2024 Shilperhaat. All rights reserved.</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center text-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export function DashboardPage() {
  const { session } = useAdminSession();
  const { data, error } = useData("dashboard");
  if (!data) return <Loading title="Dashboard" error={error} />;
  const stats = data.stats, topProducts: any[] = data.topProducts || [];
  return (
    <AdminLayout title="Dashboard" adminName={session?.name}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#800000] to-[#7a4a1a] rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold">Welcome back, {session?.name}! 👋</h2>
          <p className="text-white/80 text-sm mt-1">Here&apos;s what&apos;s happening with Shilperhaat today.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Package} label="Active Products" value={stats.activeProducts} color="bg-green-50 text-green-600" />
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="bg-purple-50 text-purple-600" />
          <StatCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} color="bg-[#FFF0F0] text-[#800000]" />
          <StatCard icon={Tag} label="Categories" value={stats.totalCategories} color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={Star} label="Reviews" value={stats.totalReviews} color="bg-pink-50 text-pink-600" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: "/admin/products/new", label: "Add Product", icon: "➕" },
              { href: "/admin/categories", label: "Manage Categories", icon: "📂" },
              { href: "/admin/banners", label: "Update Banner", icon: "🖼️" },
              { href: "/admin/orders", label: "View Orders", icon: "📦" },
              { href: "/admin/contact-widget", label: "Contact Widget", icon: "💬" },
            ].map((a) => (
              <a key={a.href} href={a.href} className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-[#800000] hover:bg-[#FFF0F0] transition-colors text-sm font-medium text-gray-700">
                <span>{a.icon}</span>{a.label}
              </a>
            ))}
          </div>
        </div>
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Top Selling Products</h3>
              <a href="/admin/products" className="text-[#800000] text-sm hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-gray-400 font-bold text-sm w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">{product.category?.name}</p>
                  </div>
                  <span className="font-bold text-[#800000] text-sm">৳{Number(product.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Wrapped({ title, path, render }: { title: string; path: string; render: (d: any) => React.ReactNode }) {
  const { session } = useAdminSession();
  const { data, tick, error } = useData(path);
  if (!data) return <Loading title={title} error={error} />;
  return <AdminLayout title={title} adminName={session?.name}><React.Fragment key={tick}>{render(data)}</React.Fragment></AdminLayout>;
}

export const ProductsPage = () => <Wrapped title="Products" path="products" render={(d) => <ProductsClient products={d.products} />} />;
export const NewProductPage = () => <Wrapped title="Add New Product" path="product-form" render={(d) => <ProductForm categories={d.categories} />} />;
export const EditProductPage = ({ id }: { id: string }) => (
  <Wrapped title="Edit Product" path={"product-form?id=" + encodeURIComponent(id)} render={(d) => (d.product ? <ProductForm categories={d.categories} product={d.product} /> : <div className="text-center text-gray-500 py-10">Product not found.</div>)} />
);
export const CategoriesPage = () => <Wrapped title="Categories" path="categories" render={(d) => <CategoriesClient categories={d.categories} />} />;
export const BannersPage = () => <Wrapped title="Banners" path="banners" render={(d) => <BannersClient banners={d.banners} />} />;
export const ReviewsPage = () => <Wrapped title="Reviews" path="reviews" render={(d) => <ReviewsClient reviews={d.reviews} />} />;
export const OrdersPage = () => <Wrapped title="Orders" path="orders" render={(d) => <OrdersClient orders={d.orders} />} />;
export const SettingsPage = () => <Wrapped title="Site Settings" path="settings" render={(d) => <SettingsClient settings={d.settings} />} />;
export function AccessManagementPage() {
  const { session } = useAdminSession();
  return <Wrapped title="Access Management" path="users" render={(d) => <AccessManagementClient initialUsers={d.users} currentAdminId={session?.id || ""} />} />;
}
export const ContactWidgetPage = () => { const { session } = useAdminSession(); return <AdminLayout title="Contact Widget" adminName={session?.name}><ContactWidgetClient /></AdminLayout>; };
export const SiteLayoutPage = () => { const { session } = useAdminSession(); return <AdminLayout title="Site Layout" adminName={session?.name}><SiteLayoutClient /></AdminLayout>; };
export const CouponsPage = () => <CouponsClient />;
export const PagesPage = () => <PagesManager />;
