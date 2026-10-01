// The admin UI was written against Next.js routes (/api/...). Map them onto the plugin's REST API
// and attach the WordPress REST nonce, so the original components run unchanged.
function toRest(url: string): string | null {
  if (!/^\/api\//.test(url)) return null;
  const { restUrl } = window.SH_ADMIN;
  let path = url.slice(5);
  if (path === "upload") path = "admin/upload";
  else if (path.indexOf("courier/steadfast") === 0) path = "admin/" + path;
  // everything else keeps its path: admin/*, site-content/*, categories, settings
  const q = path.indexOf("?");
  if (q > -1 && restUrl.indexOf("?") > -1) path = path.slice(0, q) + "&" + path.slice(q + 1);
  return restUrl + path;
}

const origFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === "string") {
    const mapped = toRest(input);
    if (mapped) {
      const headers = new Headers(init?.headers || {});
      headers.set("X-WP-Nonce", window.SH_ADMIN.nonce);
      return origFetch(mapped, { ...init, headers, credentials: "same-origin" });
    }
  }
  return origFetch(input, init);
};

const origOpen = XMLHttpRequest.prototype.open;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: any[]) {
  const mapped = typeof url === "string" ? toRest(url) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (origOpen as any).call(this, method, mapped || url, ...rest);
  if (mapped) {
    this.setRequestHeader("X-WP-Nonce", window.SH_ADMIN.nonce);
    this.withCredentials = true;
  }
};
export {};
