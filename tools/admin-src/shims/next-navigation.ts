// Minimal stand-in for next/navigation: the admin runs as a tiny SPA under /admin/*.
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
if (typeof window !== "undefined") window.addEventListener("popstate", notify);

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

declare global {
  interface Window { SH_ADMIN: { user: unknown; restUrl: string; nonce: string; uploadsBase: string; siteUrl: string; [k: string]: unknown } }
}

export function navigate(href: string, replace = false) {
  const hard = !window.SH_ADMIN.user || href.indexOf("/admin/login") === 0 || !/^\/admin(\/|$|\?)/.test(href);
  if (hard) { window.location.href = href; return; }
  if (replace) history.replaceState(null, "", href); else history.pushState(null, "", href);
  window.scrollTo(0, 0);
  notify();
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname.replace(/\/+$/, "") || "/", () => "/");
}

export function useRouter() {
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, true),
    back: () => { history.back(); },
    forward: () => { history.forward(); },
    refresh: () => { window.dispatchEvent(new Event("sh:refresh")); },
    prefetch: () => {},
  };
}

export function useSearchParams() {
  return new URLSearchParams(window.location.search);
}
