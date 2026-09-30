import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/admin/AdminLayout";
import { Package, ShoppingBag, Clock, Tag, Star } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAdminSession();

  let stats = { totalProducts: 0, activeProducts: 0, totalOrders: 0, pendingOrders: 0, totalCategories: 0, totalReviews: 0 };
  let topProducts: any[] = [];

  try {
    const [productCount, activeCount, orderCount, pendingCount, categoryCount, reviewCount, bestsellers] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { status: "ACTIVE" } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.category.count(),
        prisma.review.count(),
        prisma.product.findMany({
          where: { isBestSelling: true },
          include: { category: { select: { name: true } }, images: { take: 1, orderBy: { sortOrder: "asc" } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);
    stats = { totalProducts: productCount, activeProducts: activeCount, totalOrders: orderCount, pendingOrders: pendingCount, totalCategories: categoryCount, totalReviews: reviewCount };
    topProducts = bestsellers;
  } catch {
    // DB unavailable — show zeros
  }

  return (
    <AdminLayout title="Dashboard" adminName={session.name}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#800000] to-[#7a4a1a] rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold">Welcome back, {session.name}! 👋</h2>
          <p className="text-white/80 text-sm mt-1">
            Here&apos;s what&apos;s happening with Shilperhaat today.
          </p>
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
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-[#800000] hover:bg-[#FFF0F0] transition-colors text-sm font-medium text-gray-700"
              >
                <span>{action.icon}</span>
                {action.label}
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

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center text-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
