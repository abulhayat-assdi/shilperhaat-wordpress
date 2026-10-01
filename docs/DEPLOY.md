# Shilperhaat WordPress — ইনস্টল ও ডিপ্লয় গাইড

দুটি প্যাকেজ আছে (রিপোর `dist/` ফোল্ডারে, প্রতিটি কমিটের সাথে নতুন করে বিল্ড করা):

| ফাইল | কী |
|---|---|
| `dist/shilperhaat-cms.zip` | প্লাগিন — ডেটাবেস টেবিল, অ্যাডমিন প্যানেল, অর্ডার/কুপন API, Meta Pixel/CAPI, Steadfast |
| `dist/shilperhaat.zip` | থিম — পুরো ফ্রন্টএন্ড (হোম, শপ, প্রোডাক্ট, কার্ট, চেকআউট, ব্লগ, পেজ) |

PHP 8.1+ ও MySQL/MariaDB ছাড়া কিছু লাগে না। কোনো Node/build টুল হোস্টিংয়ে লাগবে না — CSS আগে থেকেই বিল্ড করা।

## ১. ইনস্টল (ম্যানুয়াল জিপ আপলোড)

1. WordPress ইনস্টল শেষ করুন (Coolify সার্ভিস `shilperhaat-wordpress` বা cPanel)।
2. **Plugins → Add New → Upload Plugin** → `shilperhaat-cms.zip` → **Activate**। (এটাই আগে করতে হবে।)
3. **Appearance → Themes → Add New → Upload Theme** → `shilperhaat.zip` → **Activate**।
4. অ্যাক্টিভেশনে পারমালিংক `/%postname%/` হয়ে যায় (`/shop`, `/product/...` ইত্যাদি আগের মতো URL)।

> আপলোড সীমা: থিম জিপ ≈ ০.৮ MB, প্লাগিন ≈ ০.০৬ MB — ডিফল্ট ২ MB সীমার মধ্যেই।

## ২. ডেটা ইমপোর্ট

WordPress অ্যাডমিনে বাম মেনুতে **Shilperhaat → Import data** (শুধু সুপার অ্যাডমিন দেখবে)।

1. **Database:** `data/seed/shilperhaat_seed.sql` আপলোড করে Import চাপুন। (প্রোডাক্ট, ছবির লিংক, ক্যাটাগরি, ব্যানার, পেজ, কুপন, রিভিউ, সাইট লেআউট, কন্টাক্ট উইজেট আসবে; অর্ডার/গ্রাহকের তথ্য আসে না।)
2. **Images & videos:** "Download files" চাপুন। পুরনো সাইট (`https://shilperhaat.com`) চালু থাকা অবস্থায় ৯৭টি রেফারেন্স করা ফাইল `wp-content/uploads/shilperhaat/` এ নেমে আসবে। (বিকল্প: `assets/uploads/` ফোল্ডার SFTP/File Manager দিয়ে ওই পাথে কপি।)
3. ইমপোর্টটি বারবার চালালেও সমস্যা নেই (একই ID রিপ্লেস হয়)।

WP-CLI থাকলে: `wp shilperhaat import-seed --file=data/seed/shilperhaat_seed.sql --uploads=assets/uploads`

## ৩. সিক্রেট/কী — শুধু প্লাগিন সেটিংসে

**Shilperhaat → Settings** (সুপার অ্যাডমিন):

- Meta Pixel ID, Conversions API access token, Test event code
- Steadfast API key ও Secret key

এগুলো কোডে বা ENV-তে যায় না। সিক্রেটগুলো ডাটাবেসে libsodium দিয়ে এনক্রিপ্ট হয়ে থাকে (WordPress-এর `AUTH_KEY`/`SECURE_AUTH_KEY` থেকে কী), UI-তে মাস্ক করা দেখায় (`••••1234`), ব্রাউজারে কখনো যায় না। "Test connection" বাটনে যাচাই করা যায়।

> `wp-config.php`-এর salts বদলালে সেভ করা সিক্রেট পড়া যাবে না — তখন কীগুলো আবার বসাতে হবে। ব্যাকআপের সময় `wp-config.php`-ও রাখুন।

## ৪. অ্যাডমিন ও অ্যাক্সেস

- WordPress **Administrator** = সুপার অ্যাডমিন (সব পেজ, Settings সিক্রেট, Access Management, Import)।
- **Shilperhaat → Access Management** থেকে "Shilperhaat Manager" ইউজার বানিয়ে কোন কোন পেজ (Products, Orders, …) খুলতে পারবে ঠিক করুন। ম্যানেজাররা WordPress-এর অন্য কিছু দেখে না।
- আগের অ্যাডমিন পাসওয়ার্ড/ইউজার ইমপোর্ট হয় না (ইচ্ছাকৃত) — নতুন বানান।

## ৫. লাইভ ডোমেইনে নেওয়া (শেষ ধাপ)

1. Coolify → সার্ভিসের Domain-এ `https://shilperhaat.com` দিন (এখন সাময়িক `http://wp.<IP>.sslip.io`)।
2. WordPress **Settings → General**-এ WordPress Address ও Site Address `https://shilperhaat.com` করুন।
3. পুরনো Next.js অ্যাপ বন্ধ/সরিয়ে DNS নতুন সার্ভিসে দিন। Coolify নিজেই SSL (Let's Encrypt) দেবে।
4. আগের গ্রাহকদের অর্ডার নম্বর (`SH…`) নতুন সাইটে আর থাকবে না — অর্ডার ডেটা ইচ্ছাকৃতভাবে ইমপোর্ট হয়নি। প্রয়োজনে পুরনো DB থেকে আলাদাভাবে আনুন।
5. **Search Engine Visibility** (Settings → Reading) বন্ধ আছে কিনা দেখুন।

## ৬. cPanel/সাধারণ হোস্টিং

একই জিপ আপলোড করলেই চলে। দরকার: PHP ≥ 8.1, `mysqli`, `sodium` (সাধারণত ডিফল্ট), `mod_rewrite`/pretty permalinks, `allow_url_fopen` লাগে না (WP HTTP API ব্যবহার করা হয়)।

## ৭. যা বদলায়নি / ইচ্ছাকৃত পার্থক্য

- ডিজাইন, লেআউট, কালার, ফন্ট (Open Sans, Hind Siliguri — থিমেই হোস্ট করা), অ্যানিমেশন একই।
- URL গুলো একই: `/shop`, `/product/{slug}`, `/cart`, `/checkout`, `/thank-you`, `/track-order`, `/blog`, `/{page-slug}`।
- কার্ট ব্রাউজারের `localStorage` (`sh_cart`) এ থাকে — আগের মতোই।
- সার্ভার-সাইড নতুন সুরক্ষা: অর্ডার/রিভিউ/ট্র্যাকিং এন্ডপয়েন্টে IP-ভিত্তিক রেট লিমিট, অর্ডারের ফোন/নাম/ঠিকানা সার্ভারে যাচাই।

## ৮. ডেভেলপারদের জন্য

```
tools/theme-build/        # dev-only: Tailwind বিল্ড, ফন্ট/আইকন/ডিস্ট্রিক্ট ডেটা জেনারেটর
  npm i && npm run build:css      # থিমের PHP/JS স্ক্যান করে assets/css/tailwind.css বানায়
  node build-fonts.mjs | build-icons.mjs
tools/build-zips.sh       # dist/*.zip বানায়
```

নতুন Tailwind ক্লাস ব্যবহার করলে `npm run build:css` আবার চালান ও ফলাফল কমিট করুন।
