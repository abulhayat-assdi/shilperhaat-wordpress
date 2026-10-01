# শিল্পেরহাট — WordPress ইনস্টল গাইড (Coolify / cPanel)

এই গাইড অনুসরণ করলে লাইভ সাইটের ডিজাইন, প্রোডাক্ট, ব্যানার, পেজ ও অ্যাডমিন প্যানেলসহ পুরো সাইট সাধারণ WordPress + MySQL-এ চালু হবে।
আলাদা ফ্রন্টএন্ড/ব্যাকএন্ড সার্ভার বা Docker কাস্টমাইজেশন লাগে না।

## ১. কী কী ফাইল লাগবে

| ফাইল | কোথায় পাবেন | কাজ |
|---|---|---|
| `releases/shilperhaat-theme.zip` | রিপোতে | থিম (পুরো ডিজাইন) |
| `releases/shilperhaat-cms.zip` | রিপোতে | প্লাগিন (ডেটা, অর্ডার, অ্যাডমিন প্যানেল) |
| `assets/uploads/` ফোল্ডার (৮৪MB) বা `bash tools/zip.sh` দিয়ে বানানো `dist/shilperhaat-uploads.zip` | রিপোতে | প্রোডাক্ট/ব্যানারের ছবি ও ভিডিও |
| WooCommerce | WordPress প্লাগিন স্টোর | অর্ডার/স্টক/কুপন ইঞ্জিন (আলাদাভাবে ইনস্টল করতে হবে) |

## ২. Coolify-তে ইনস্টল

1. Coolify → **New Resource → Service → WordPress (with MySQL/MariaDB)** তৈরি করুন এবং ডোমেইন দিন (HTTPS চালু)।
2. **Persistent Storage**: `wp-content` (অন্তত `wp-content/uploads`, `themes`, `plugins`) ভলিউমে আছে কিনা নিশ্চিত করুন, নইলে রিডিপ্লয়ে আপলোড হারাবে।
3. ডোমেইন খুলে সাধারণ WordPress ইনস্টল শেষ করুন (সাইটের নাম, অ্যাডমিন ইউজার/পাসওয়ার্ড/ইমেইল)।
4. WP-Admin → **Plugins → Add New → WooCommerce → Install → Activate**। Woo-র "Setup wizard" বাদ দিন (Skip)।
5. **Appearance → Themes → Add New → Upload** → `shilperhaat-theme.zip` → Install → **Activate**।
6. **Plugins → Add New → Upload** → `shilperhaat-cms.zip` → Install → **Activate**।
   - সক্রিয় করার পর প্রথম WP-Admin পেজ খুললেই দোকানের ডেটা (১৮ প্রোডাক্ট, ৫ ক্যাটাগরি, ব্যানার, ১৫ পেজ, কুপন, সাইট লেআউট) নিজে থেকে ইমপোর্ট হয়।
   - আবার ইমপোর্ট করতে: WP-Admin → **Shilperhaat** মেনু → *Import / re-import shop content*।
7. **ছবি ও ভিডিও** রাখুন `wp-content/uploads/shilperhaat/` ফোল্ডারে (ভেতরে `products`, `banners`, `categories`, `brand`, `site`, `videos`)।
   - Coolify → আপনার WordPress রিসোর্স → **Terminal** খুলে:
     ```bash
     mkdir -p /var/www/html/wp-content/uploads/shilperhaat && cd /var/www/html/wp-content/uploads/shilperhaat
     # zip ফাইলটি কোনোভাবে সার্ভারে তুলুন (SFTP / Coolify ফাইল আপলোড / curl), তারপর:
     apt-get update && apt-get install -y unzip && unzip -o shilperhaat-uploads.zip
     chown -R www-data:www-data /var/www/html/wp-content/uploads
     ```
   - সঠিক হলে **Shilperhaat** মেনুর "Shop media files present" সবুজ ✔ দেখাবে।
8. **Settings → Permalinks → Post name** (প্লাগিন নিজেই সেট করে; না হলে হাতে করুন)। Apache ইমেজে `.htaccess` নিজে তৈরি হয়। nginx হলে `try_files $uri $uri/ /index.php?$args;` লাগবে।
9. ভিডিও আপলোডের সীমা বাড়াতে (Shilperhaat মেনুতে "Upload limits" লাল থাকলে) `.htaccess`-এর শুরুতে যোগ করুন (Apache/mod_php):
   ```apache
   php_value upload_max_filesize 256M
   php_value post_max_size 256M
   php_value max_execution_time 300
   ```
   (PHP-FPM হলে একই মান `.user.ini`-তে `upload_max_filesize=256M` ও `post_max_size=256M` আকারে দিন।)

## ৩. অ্যাডমিন প্যানেল ব্যবহার

- ঠিকানা: `https://আপনার-ডোমেইন/admin` (WP-Admin-এর ইমেইল + পাসওয়ার্ড দিয়ে লগইন)।
- Dashboard, Products, Categories, Banners, Reviews, Orders, Coupon Codes, Pages, Site Layout, Contact Widget, Settings এবং **Access Management** (শুধু Super Admin)।
- **Super Admin** = WordPress "Administrator"। **Admin (স্টাফ)** তৈরি করতে Access Management → নতুন ইউজার; পেজ ভিত্তিক অনুমতি দিন।
- অর্ডার: Orders পেজে স্ট্যাটাস বদল, নোট, **Steadfast-এ পাঠানো**। Woo-র নিজস্ব Orders পেজেও (WooCommerce → Orders) একই অর্ডার দেখা যায়।
- **Settings**: ডেলিভারি চার্জ/ফ্রি ডেলিভারি সীমা, লোগো, **Steadfast API Key/Secret**, **Meta Pixel ID + Conversions API token** (সার্ভারে সংরক্ষিত, ব্রাউজারে নয়)।
  - Coolify Environment Variables দিয়েও দেওয়া যায় (এগুলো Settings-এর মানের চেয়ে অগ্রাধিকার পায়): `STEADFAST_API_KEY`, `STEADFAST_SECRET_KEY`, `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_TEST_EVENT_CODE`।
- Steadfast API-র জন্য সার্ভার থেকে `portal.packzy.com` এ আউটবাউন্ড HTTPS খোলা থাকতে হবে।

## ৪. লাইভে যাওয়ার চেকলিস্ট (shilperhaat.com)

1. নতুন সাইটে একটি টেস্ট অর্ডার দিন (হোম → প্রোডাক্ট → কার্ট → চেকআউট → থ্যাংক-ইউ → ট্র্যাক অর্ডার) এবং `/admin` → Orders-এ দেখুন।
2. পুরনো সাইটের কুপন/ব্যানার/পেজ ঠিক আছে কিনা মিলিয়ে নিন; Site Layout-এ ফোন/হোয়াটসঅ্যাপ/ইমেইল যাচাই করুন।
3. ক্যাশ প্লাগিন/CDN ব্যবহার করলে এগুলো **ক্যাশের বাইরে** রাখুন: `/cart`, `/checkout`, `/thank-you`, `/track-order`, `/account`, `/admin*`, `/wp-json/*`।
4. DNS বদলান (পুরনো সার্ভারের বদলে নতুন Coolify সার্ভারে)। পুরনো `/uploads/...` ইউআরএল নিজে থেকে নতুন লোকেশনে রিডাইরেক্ট হয় এবং `/product/slug`, `/shop`, `/about` ইত্যাদি একই থাকে।
5. **Settings → Reading → Search engine visibility** বন্ধ আছে কিনা দেখুন।
6. ব্যাকআপ: ডাটাবেস + `wp-content/uploads` (Coolify ব্যাকআপ চালু করুন)।

## ৫. cPanel-এ সরানো (পরে)

1. cPanel → WordPress ইনস্টল (বা Softaculous) → WooCommerce, থিম, প্লাগিন একই ধাপে।
2. আগের সাইটের ডাটাবেস এক্সপোর্ট (`wp db export` / phpMyAdmin) → নতুন DB-তে ইমপোর্ট এবং `wp search-replace 'পুরনো-ডোমেইন' 'নতুন-ডোমেইন'`।
3. `wp-content/uploads/` (বিশেষ করে `shilperhaat/`) কপি করুন। আর কিছু লাগে না — Docker-নির্ভর কিছু নেই।

## ৬. ডেভেলপারদের জন্য

- থিম CSS: `tools/app.src.css` (+ `tools/theme-extra.css`) → `cd tools && npm install && npm run build:css` → `wp-content/themes/shilperhaat/assets/css/app.css` (কমিট করা থাকে; সার্ভারে Node লাগে না)।
- অ্যাডমিন UI: `tools/admin-src` (আগের Next.js অ্যাডমিনের কম্পোনেন্ট) → `npm run build:admin` → `wp-content/plugins/shilperhaat-cms/admin/assets/admin.js|css`।
- জিপ তৈরি: `bash tools/zip.sh`। আইকন: `node tools/gen-icons.js <lucide-react পাথ>`। সিড ডেটা: `php tools/seed-to-json.php`।
- ডিজাইন তুলনা: `tools/shot.js`, `tools/diff.js`, `tools/e2e/*` (Playwright)।
- `WP-CLI`: `wp shilperhaat import [--reset]`।
