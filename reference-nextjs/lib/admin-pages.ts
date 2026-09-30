export interface AdminPageDef {
  key: string;
  label: string;
  href: string;
}

export const ADMIN_PAGES: AdminPageDef[] = [
  { key: "dashboard",      label: "Dashboard",      href: "/admin/dashboard"      },
  { key: "products",       label: "Products",        href: "/admin/products"       },
  { key: "categories",     label: "Categories",      href: "/admin/categories"     },
  { key: "banners",        label: "Banners",         href: "/admin/banners"        },
  { key: "reviews",        label: "Reviews",         href: "/admin/reviews"        },
  { key: "orders",         label: "Orders",          href: "/admin/orders"         },
  { key: "coupons",        label: "Coupon Codes",    href: "/admin/coupons"        },
  { key: "pages",          label: "Pages",           href: "/admin/pages"          },
  { key: "blog",           label: "Blog",            href: "/admin/blog"           },
  { key: "site-layout",    label: "Site Layout",     href: "/admin/site-layout"    },
  { key: "contact-widget", label: "Contact Widget",  href: "/admin/contact-widget" },
  { key: "settings",       label: "Settings",        href: "/admin/settings"       },
];

export function getPageKeyFromPath(pathname: string): string | null {
  for (const page of ADMIN_PAGES) {
    if (pathname.startsWith(page.href)) return page.key;
  }
  return null;
}

export function getPageLabel(key: string): string {
  return ADMIN_PAGES.find((p) => p.key === key)?.label ?? key;
}
