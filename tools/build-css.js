// Dev-time helper: compile Tailwind for the theme (and admin) into committed CSS files.
// usage: node build-css.js [theme|admin|all]
const { execFileSync } = require("child_process");
const path = require("path");
const target = process.argv[2] || "all";
const root = path.resolve(__dirname, "..");
const bin = path.join(__dirname, "node_modules", ".bin", "tailwindcss");
function build(input, output) {
  execFileSync(bin, ["-i", path.join(__dirname, input), "-o", path.join(root, output), "--minify"], { stdio: "inherit", cwd: __dirname });
}
if (target === "theme" || target === "all") build("app.src.css", "wp-content/themes/shilperhaat/assets/css/app.css");
if ((target === "admin" || target === "all") && require("fs").existsSync(path.join(__dirname, "admin.src.css")))
  build("admin.src.css", "wp-content/plugins/shilperhaat-cms/admin/assets/admin.css");
