"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSiteLayout } from "@/lib/site-layout-context";
import { useAdminSession } from "@/lib/admin-session-context";
import { getPageKeyFromPath } from "@/lib/admin-pages";
import {
  LayoutDashboard, Package, Grid3X3, ImageIcon,
  Star, ShoppingBag, Settings, LogOut, ExternalLink, X, Menu,
  Layout, FileText, MessageSquare, BookOpen, Ticket, ShieldCheck, Crown,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard",      href: "/admin/dashboard",      icon: LayoutDashboard, label: "Dashboard"      },
  { key: "products",       href: "/admin/products",        icon: Package,         label: "Products"       },
  { key: "categories",     href: "/admin/categories",      icon: Grid3X3,         label: "Categories"     },
  { key: "banners",        href: "/admin/banners",         icon: ImageIcon,       label: "Banners"        },
  { key: "reviews",        href: "/admin/reviews",         icon: Star,            label: "Reviews"        },
  { key: "orders",         href: "/admin/orders",          icon: ShoppingBag,     label: "Orders"         },
  { key: "coupons",        href: "/admin/coupons",         icon: Ticket,          label: "Coupon Codes"   },
  { key: "pages",          href: "/admin/pages",           icon: FileText,        label: "Pages"          },
  { key: "blog",           href: "/admin/blog",            icon: BookOpen,        label: "Blog"           },
  { key: "site-layout",    href: "/admin/site-layout",     icon: Layout,          label: "Site Layout"    },
  { key: "contact-widget", href: "/admin/contact-widget",  icon: MessageSquare,   label: "Contact Widget" },
  { key: "settings",       href: "/admin/settings",        icon: Settings,        label: "Settings"       },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  adminName?: string;
}

export default function AdminLayout({ children, title, adminName }: AdminLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname.startsWith(href);
  const { data: layout } = useSiteLayout();
  const { session, isSuperAdmin, allowedPages } = useAdminSession();

  const displayName = adminName ?? session?.name ?? "Admin";
  const currentPageKey = getPageKeyFromPath(pathname);

  // Client-side access guard (covers 'use client' pages like coupons, blog, pages)
  useEffect(() => {
    if (!session) {
      router.push("/admin/login");
      return;
    }
    if (
      !isSuperAdmin &&
      currentPageKey &&
      currentPageKey !== "dashboard" &&
      !allowedPages.includes(currentPageKey)
    ) {
      router.push("/admin/dashboard");
    }
  }, [session, isSuperAdmin, currentPageKey, allowedPages, router]);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.key === "dashboard") return true;
    return allowedPages.includes(item.key);
  });

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-[10px] mx-2 rounded-lg transition-colors mb-0.5 ${
                active
                  ? "bg-[#800000] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {isSuperAdmin && (
          <>
            <div className="mx-4 my-2 border-t border-white/10" />
            <Link
              href="/admin/access-management"
              onClick={() => mobile && setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-[10px] mx-2 rounded-lg transition-colors mb-0.5 ${
                isActive("/admin/access-management")
                  ? "bg-[#800000] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ShieldCheck size={18} />
              <span className="text-[13px] font-medium">Access Management</span>
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1 flex-shrink-0">
        {isSuperAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
            <Crown size={14} className="text-[#800000]" />
            <span className="text-xs text-[#800000] font-semibold">Super Admin</span>
          </div>
        )}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          <ExternalLink size={16} />
          Website
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col bg-[#1a1208] text-white fixed top-0 left-0 h-screen w-60 overflow-hidden z-[100]">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 flex-shrink-0">
          {layout.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={layout.logoUrl}
              alt={layout.siteName}
              style={{ maxHeight: 36, maxWidth: 120, width: "auto", height: "auto", objectFit: "contain", display: "block" }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {layout.logoLetter || "S"}
            </div>
          )}
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 bg-[#1a1208] text-white flex flex-col md:hidden">
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                {layout.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={layout.logoUrl}
                    alt={layout.siteName}
                    style={{ maxHeight: 32, maxWidth: 110, width: "auto", height: "auto", objectFit: "contain", display: "block" }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {layout.logoLetter || "S"}
                  </div>
                )}
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-white/60">
                <X size={20} />
              </button>
            </div>
            <SidebarContent mobile />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="md:ml-60 h-screen overflow-y-auto flex flex-col">
        {/* Top bar */}
        <header className="h-20 bg-white border-b border-[#eee] flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-700">{displayName}</p>
              <p className="text-xs text-gray-400">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow ${isSuperAdmin ? "bg-[#800000]" : "bg-gray-500"}`}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
