// Dev-only: regenerates assets/js/districts.js from the original source (read-only).
// Run from the repo root: node --experimental-strip-types tools/theme-build/build-districts.mjs
import fs from "node:fs";
const m = await import("../../reference-nextjs/lib/bangladesh-districts.ts");
fs.writeFileSync(
  "wp-content/themes/shilperhaat/assets/js/districts.js",
  "/* Generated from reference-nextjs/lib/bangladesh-districts.ts (district → thanas). */\nwindow.SH_DISTRICTS=" +
    JSON.stringify(m.BANGLADESH_DISTRICTS.map((d) => ({ n: d.name, t: d.thanas }))) + ";\n"
);
