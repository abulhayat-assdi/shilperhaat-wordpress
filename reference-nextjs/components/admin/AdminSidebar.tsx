"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ImageIcon,
  Star,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products",  icon: Package,         label: "Products"  },
  { href: "/admin/categories",icon: Grid3X3,         label: "Categories"},
  { href: "/admin/banners",   icon: ImageIcon,       label: "Banners"   },
  { href: "/admin/reviews",   icon: Star,            label: "Reviews"   },
  { href: "/admin/orders",    icon: ShoppingBag,     label: "Orders"    },
  { href: "/admin/settings",  icon: Settings,        label: "Settings"  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#1a1208] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      } min-h-screen flex-shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          S
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm">Shilperhaat</div>
            <div className="text-xs text-white/50">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors mb-0.5 ${
                active
                  ? "bg-[#800000] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          title="View Website"
        >
          <ExternalLink size={16} />
          {!collapsed && <span className="text-xs">Website</span>}
        </a>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-xs">Logout</span>}
          </button>
        </form>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 bg-[#1a1208] border border-white/20 rounded-full p-0.5 text-white/60 hover:text-white"
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        style={{ position: "relative" }}
      />
    </aside>
  );
}
