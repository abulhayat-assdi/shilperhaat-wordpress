# Shilperhaat: Next.js থেকে WordPress কনভার্শন

## লক্ষ্য
`/reference-nextjs` (Next.js + Node + PostgreSQL) প্রজেক্টটিকে WordPress + MySQL-এ কনভার্ট করা।
- একটি কাস্টম WordPress থিম (`wp-content/themes/shilperhaat`)
- একটি কাস্টম CMS/অ্যাডমিন প্যানেল (প্লাগিন: `wp-content/plugins/shilperhaat-cms`)
- কারণ: Next.js/Node/Postgres হোস্টিং খরচ বেশি; ক্লায়েন্ট সস্তা PHP+MySQL হোস্টিং চায়।

## কঠোর নিয়ম
- ডিজাইন, লেআউট, কালার, ফন্ট, স্পেসিং, অ্যানিমেশন, থিম কোনোটাই বদলানো যাবে না। পিক্সেল-পারফেক্ট মিল থাকতে হবে।
- `/reference-nextjs` শুধু দেখার জন্য (read-only), এতে কিছু এডিট করা যাবে না।
- লাইভ ডোমেইন: shilperhaat.com (বর্তমান সাইট চালু, শেষ ধাপে DNS/ডিপ্লয়)।
- কোনো সিক্রেট, পাসওয়ার্ড, API কী, সার্ভার IP কমিট করা যাবে না।
- গ্রাহকের ব্যক্তিগত তথ্য (অর্ডার, ফোন, ঠিকানা) রিপোতে নেই, যোগও করা যাবে না।

## রিপোতে কী আছে
- `reference-nextjs/`: পুরনো সোর্স (Next.js, Prisma)। স্কিমা: `reference-nextjs/prisma/`।
- `design-screenshots/`: লাইভ সাইটের স্ক্রিনশট। ডিজাইন মিলল কিনা এগুলোর সাথে তুলনা করো (Playwright ইত্যাদি দিয়ে)।
- `data/seed/shilperhaat_seed.sql`: লাইভ PostgreSQL ডাম্প (pg_dump)। স্কিমা সব টেবিলের আছে; ডেটা আছে শুধু products, product_images, categories, banners, blog_posts, pages, reviews, coupons, site_content, site_settings। `orders`, `order_items`, `admin_users`, `admin_page_access` ও `_prisma_migrations`-এর ডেটা ইচ্ছাকৃতভাবে খালি।
- `assets/uploads/`: লাইভ সাইটের আপলোড (banners, blog, brand, categories, products, site, videos)। ডেটাবেসের `imageUrl` পাথ `/uploads/...` ধরনের; WordPress মিডিয়া/আপলোডে ম্যাপ করতে হবে।

## টার্গেট স্ট্যাক ও ডিপ্লয়
- PHP 8.1+, MySQL/MariaDB, WordPress (সর্বশেষ)। থিম বিল্ড টুল ছাড়া চলবে এমন সরল PHP/CSS/JS পছন্দনীয়।
- ডিপ্লয়: Coolify-তে WordPress + MySQL কনটেইনার অথবা সাধারণ cPanel হোস্টিং।
- এনভায়রনমেন্টে PHP, MariaDB, WP-CLI ইনস্টল করে লোকালি চালিয়ে টেস্ট করো।

## কাজের পদ্ধতি
1. প্রথমে `reference-nextjs` বিশ্লেষণ করে প্ল্যান দাও: পেজ/রুট তালিকা, ফিচার, ডেটা ম্যাপিং (Postgres → WP কাস্টম পোস্ট টাইপ/টেবিল), ধাপ, আনুমানিক খরচ। অনুমোদন ছাড়া কোড শুরু করো না।
2. ধাপে ধাপে কাজ: থিম স্কেলেটন → হোম → বাকি পেজ → শপ/কার্ট/চেকআউট/অর্ডার → CMS অ্যাডমিন প্যানেল → ডেটা ইমপোর্ট স্ক্রিপ্ট → ডিজাইন তুলনা ও টেস্ট।
3. প্রতি ধাপ শেষে কমিট ও পুশ করো, যাতে সেশন শেষ হলেও কাজ হারায় না।
4. ক্রেডিট সীমিত: অপ্রয়োজনীয় ফাইল পড়া/বড় আউটপুট এড়াও।
