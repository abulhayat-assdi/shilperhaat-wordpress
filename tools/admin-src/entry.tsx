import "./patch-network";
import React from "react";
import { createRoot } from "react-dom/client";
import { SiteLayoutProvider } from "@/lib/site-layout-context";
import { AdminSessionProvider } from "@/lib/admin-session-context";
import { usePathname, navigate } from "./shims/next-navigation";
import * as P from "./pages";

function Router() {
  const path = usePathname();
  const user = window.SH_ADMIN.user as { id: string; name: string; email: string; role: "super_admin" | "admin" } | null;

  if (path === "/admin/login") {
    if (user) { navigate("/admin/dashboard"); return null; }
    return <P.LoginPage />;
  }
  if (!user) { window.location.href = "/admin/login"; return null; }
  if (path === "/admin") { navigate("/admin/dashboard", true); return null; }

  const m = path.match(/^\/admin\/products\/([^/]+)$/);
  if (m && m[1] !== "new") return <P.EditProductPage key={m[1]} id={decodeURIComponent(m[1])} />;
  switch (path) {
    case "/admin/dashboard": return <P.DashboardPage />;
    case "/admin/products": return <P.ProductsPage />;
    case "/admin/products/new": return <P.NewProductPage />;
    case "/admin/categories": return <P.CategoriesPage />;
    case "/admin/banners": return <P.BannersPage />;
    case "/admin/reviews": return <P.ReviewsPage />;
    case "/admin/orders": return <P.OrdersPage />;
    case "/admin/coupons": return <P.CouponsPage />;
    case "/admin/pages": return <P.PagesPage />;
    case "/admin/site-layout": return <P.SiteLayoutPage />;
    case "/admin/contact-widget": return <P.ContactWidgetPage />;
    case "/admin/settings": return <P.SettingsPage />;
    case "/admin/access-management": return user.role === "super_admin" ? <P.AccessManagementPage /> : (navigate("/admin/dashboard", true), null);
    default:
      return <div className="min-h-screen flex flex-col items-center justify-center text-gray-500"><h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1><a className="text-[#800000] underline" href="/admin/dashboard">Back to dashboard</a></div>;
  }
}

function App() {
  const cfg = window.SH_ADMIN as unknown as { user: { id: string; name: string; email: string; role: "super_admin" | "admin" } | null; allowedPages: string[] };
  return (
    <SiteLayoutProvider>
      <AdminSessionProvider session={cfg.user} allowedPages={cfg.allowedPages || []}>
        <div className="min-h-screen bg-gray-50 font-sans"><Router /></div>
      </AdminSessionProvider>
    </SiteLayoutProvider>
  );
}

createRoot(document.getElementById("sh-admin-root")!).render(<App />);
