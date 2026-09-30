# শিল্পেরহাট — Shilperhaat

> বাংলার ঐতিহ্যবাহী হস্তশিল্প পণ্যের অনলাইন বাজার  
> A production-ready Bengali e-commerce platform for traditional Bangladeshi handcraft textiles.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT + bcrypt (HTTP-only cookies) |
| Validation | Zod v4 + React Hook Form |
| Image Handling | Next.js Image + Sharp (server-side) |
| Font | Hind Siliguri (Bengali), Inter (UI) |

---

## Project Structure

```
shilperhaat-app/
├── app/
│   ├── layout.tsx                  # Root layout (lang="bn")
│   ├── globals.css                 # Tailwind v4, CSS variables, Bengali font
│   ├── sitemap.ts                  # Auto-generated sitemap
│   ├── robots.ts                   # Blocks /admin from crawlers
│   ├── (public)/                   # Route group — public-facing pages
│   │   ├── layout.tsx              # Providers + Header + Footer + BottomNav
│   │   ├── page.tsx                # Homepage
│   │   ├── shop/page.tsx           # Product listing with filters
│   │   ├── product/[slug]/page.tsx # Product detail
│   │   ├── cart/page.tsx           # Cart page
│   │   ├── checkout/page.tsx       # Checkout (COD)
│   │   └── thank-you/page.tsx      # Order confirmation
│   └── admin/                      # Admin panel (English)
│       ├── login/page.tsx
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── categories/page.tsx
│       ├── banners/page.tsx
│       ├── reviews/page.tsx
│       ├── orders/page.tsx
│       └── settings/page.tsx
├── api/
│   ├── admin/login/route.ts
│   ├── admin/logout/route.ts
│   ├── admin/products/route.ts
│   ├── admin/products/[id]/route.ts
│   ├── orders/route.ts
│   └── upload/route.ts
├── components/
│   ├── layout/                     # Header, Footer, BottomNav
│   ├── home/                       # HeroBanner, FeaturedCategories, ReviewCarousel, etc.
│   ├── product/                    # ProductCard, ProductGallery, AddToCartSection
│   ├── shop/                       # ShopFilters, ProductGrid
│   ├── checkout/                   # CheckoutPageClient, ThankYouClient
│   └── admin/                      # AdminLayout, ProductForm, etc.
├── lib/
│   ├── prisma.ts                   # Prisma singleton (graceful fallback)
│   ├── auth.ts                     # JWT + bcrypt auth helpers
│   ├── cart-context.tsx            # Cart state (localStorage + useReducer)
│   ├── toast-context.tsx           # Toast notification system
│   ├── dummy-data.ts               # Sample data (mirrors Prisma schema)
│   ├── validations.ts              # Zod schemas
│   └── utils.ts                    # Helpers: cn, formatPrice, generateSlug, etc.
├── types/index.ts                  # TypeScript interfaces
└── prisma/schema.prisma            # Database schema
```

---

## Quick Start (Development)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shilperhaat"

# JWT Secret (generate a strong random string)
NEXTAUTH_SECRET="your-super-secret-jwt-key-min-32-chars"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# WhatsApp number for bottom nav link
NEXT_PUBLIC_WHATSAPP_NUMBER="8801XXXXXXXXX"
```

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Seed initial data

```bash
# Create admin user (run once)
npx ts-node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.create({
    data: { email: 'admin@shilperhaat.com', passwordHash: hash, name: 'Admin' }
  });
  console.log('Admin created');
}
main().finally(() => prisma.\$disconnect());
"
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Connecting Real Database

The app currently ships with dummy data in `lib/dummy-data.ts`. Each page has commented-out Prisma queries ready to activate.

**To switch to live database**, in each page/route replace:
```ts
import { dummyProducts } from "@/lib/dummy-data";
const products = dummyProducts;
```
with:
```ts
import { prisma } from "@/lib/prisma";
const products = await prisma.product.findMany({ include: { images: true } });
```

Every page already contains the exact Prisma query as a `// TODO` comment.

---

## Admin Panel

Access: `/admin/login`  
Default credentials (after seeding): `admin@shilperhaat.com` / `admin123`

| Section | URL |
|---------|-----|
| Dashboard | `/admin/dashboard` |
| Products | `/admin/products` |
| Categories | `/admin/categories` |
| Banners | `/admin/banners` |
| Reviews | `/admin/reviews` |
| Orders | `/admin/orders` |
| Settings | `/admin/settings` |

Auth uses JWT stored in an HTTP-only cookie (`sh_admin_token`). Sessions expire in 7 days.

---

## Key Features

### Public Store (Bengali)
- 🏠 **Homepage** — Hero banner carousel → Featured categories → Top-selling products → Per-category sections → Customer reviews → Footer
- 🛍️ **Shop** — Filter by category, price range, search query; sort by latest/price/popularity
- 📦 **Product detail** — Image gallery, description, add-to-cart, buy now, sticky mobile CTA
- 🛒 **Cart** — localStorage persistence, quantity control, delivery charge calculation
- 💳 **Checkout** — Cash on Delivery only, address form, order summary
- ✅ **Thank-you page** — Order confirmation with order number
- 📱 **Mobile bottom nav** — Menu | Cart | Home (elevated) | WhatsApp | Account

### Admin Panel (English)
- 🔐 Secure JWT auth
- 📊 Dashboard with order/sales stats
- 🏪 Full product CRUD with image upload
- 🗂️ Category management
- 🖼️ Banner management
- ⭐ Review moderation
- 📋 Order management with status updates
- ⚙️ Site settings

---

## Design System

| Variable | Value | Usage |
|----------|-------|-------|
| `--primary` | `#c8860a` | Buttons, links, accents |
| `--primary-dark` | `#a06c07` | Hover states |
| `--primary-light` | `#f5d78e` | Backgrounds, highlights |
| `--secondary` | `#4a2c0a` | Dark text, secondary elements |
| `--background` | `#fdf8f3` | Page background (warm white) |
| `--foreground` | `#1a1208` | Body text |
| `--muted` | `#f0e8d8` | Cards, muted backgrounds |
| `--border` | `#e0d0b0` | Borders, dividers |

Font: **Hind Siliguri** for Bengali text, **Inter** for UI/admin.

---

## Image Upload

Product images are stored locally in `public/uploads/`. The upload API:
- Validates file type (image/\*)
- Enforces 5MB size limit
- Returns a public URL for immediate use
- **Production**: Replace with Cloudinary/S3 by changing `app/api/upload/route.ts`

---

## VPS Deployment

### Build

```bash
npm run build
npm start
```

### PM2 (recommended)

```bash
npm install -g pm2
pm2 start npm --name "shilperhaat" -- start
pm2 save
pm2 startup
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/shilperhaat/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Environment variables (production)

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shilperhaat"
NEXTAUTH_SECRET="<strong-random-64-char-string>"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_WHATSAPP_NUMBER="8801XXXXXXXXX"
NODE_ENV="production"
```

---

## Known Notes

- `app/page.tsx` exists alongside `app/(public)/page.tsx` — both map to `/`. The `app/page.tsx` returns `null` and should be **deleted** if a route conflict error appears during build.
- Prisma client is generated lazily — run `npx prisma generate` before first start.
- Admin panel has no rate limiting by default — add it before production.
- Payment gateway (bKash, SSLCommerz, etc.) is intentionally not implemented. COD only.

---

## License

Private / Commercial — শিল্পেরহাট © 2025
