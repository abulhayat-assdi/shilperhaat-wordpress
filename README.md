# Shilperhaat — WordPress

Bangladesh handcraft marketplace, converted from Next.js + PostgreSQL to **WordPress + MySQL**.

- `wp-content/themes/shilperhaat` — storefront theme (pixel-matched to the original; compiled Tailwind CSS committed)
- `wp-content/plugins/shilperhaat-cms` — catalog/orders on **WooCommerce**, REST API, importer and the admin panel at `/admin`
- `releases/` — installable zips (theme + plugin); `assets/uploads` — media
- `docs/INSTALL-bn.md` — step-by-step install for Coolify / cPanel (Bengali)
- `tools/` — dev-time build and visual-diff scripts (not needed on the server)

Architecture notes and project rules: see `CLAUDE.md`.
