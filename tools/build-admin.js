// Dev-time: bundle the admin SPA (React) into plugin/admin/assets/admin.js and compile its Tailwind CSS.
const esbuild = require("esbuild");
const path = require("path");
const { execFileSync } = require("child_process");
const src = path.join(__dirname, "admin-src");
const out = path.join(__dirname, "../wp-content/plugins/shilperhaat-cms/admin/assets");
esbuild.build({
  entryPoints: [path.join(src, "entry.tsx")],
  bundle: true, minify: true, sourcemap: false, target: ["es2019"], format: "iife",
  outfile: path.join(out, "admin.js"),
  jsx: "automatic",
  loader: { ".ts": "ts", ".tsx": "tsx" },
  alias: {
    "@": src,
    "next/link": path.join(src, "shims/next-link.tsx"),
    "next/image": path.join(src, "shims/next-image.tsx"),
    "next/navigation": path.join(src, "shims/next-navigation.ts"),
  },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
}).then(() => {
  execFileSync(path.join(__dirname, "node_modules/.bin/tailwindcss"), ["-i", path.join(__dirname, "admin.src.css"), "-o", path.join(out, "admin.css"), "--minify"], { stdio: "inherit", cwd: __dirname });
}).catch(() => process.exit(1));
