--
-- PostgreSQL database dump
--

\restrict oo8wFzn1AJCD42YfFP2af6qmItarX5L5rPlqNQJIDo4Fwxfih4XovzGBSWusnSI

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'OUT_OF_STOCK'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: admin_page_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_page_access (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "pageKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id text NOT NULL,
    title text,
    subtitle text,
    "imageUrl" text NOT NULL,
    "mobileImageUrl" text,
    "buttonText" text,
    "buttonLink" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text DEFAULT ''::text NOT NULL,
    content text NOT NULL,
    "coverImage" text DEFAULT ''::text NOT NULL,
    author text DEFAULT ''::text NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    tags text[],
    "isPublished" boolean DEFAULT true NOT NULL,
    "readTime" integer DEFAULT 3 NOT NULL,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "imageUrl" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    code text NOT NULL,
    type public."DiscountType" DEFAULT 'FIXED'::public."DiscountType" NOT NULL,
    value numeric(10,2) NOT NULL,
    "minOrderAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "maxUses" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    description text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text,
    "productTitle" text NOT NULL,
    "productImage" text,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    "lineTotal" numeric(10,2) NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "customerName" text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    notes text,
    subtotal numeric(10,2) NOT NULL,
    "deliveryCharge" numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    "paymentMethod" text DEFAULT 'COD'::text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "adminNote" text,
    "courierConsignmentId" text,
    "courierTrackingCode" text,
    "courierSentAt" timestamp(3) without time zone,
    "courierStatus" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "couponCode" text,
    discount numeric(10,2) DEFAULT 0 NOT NULL
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    subtitle text DEFAULT ''::text NOT NULL,
    sections jsonb NOT NULL,
    "metaTitle" text DEFAULT ''::text NOT NULL,
    "metaDescription" text DEFAULT ''::text NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    "imageUrl" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "altText" text
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "compareAtPrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    "categoryId" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isBestSelling" boolean DEFAULT false NOT NULL,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    sku text,
    tags text[],
    "videoUrl" text,
    "youtubeUrl" text,
    "youtubeVideoId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    name text NOT NULL,
    title text,
    rating integer DEFAULT 5 NOT NULL,
    content text NOT NULL,
    "avatarUrl" text,
    role text,
    "isVisible" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "productId" text
);


--
-- Name: site_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_content (
    key text NOT NULL,
    value jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id text NOT NULL,
    "siteName" text DEFAULT 'Shilperhaat'::text NOT NULL,
    "logoUrl" text,
    "faviconUrl" text,
    "footerCopyright" text,
    "whatsappNumber" text,
    "socialLinks" jsonb,
    "deliveryCharge" numeric(10,2) DEFAULT 0 NOT NULL,
    "freeDeliveryMin" numeric(10,2),
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: admin_page_access; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_page_access (id, "adminId", "pageKey", "createdAt") FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, name, email, "passwordHash", role, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id, title, subtitle, "imageUrl", "mobileImageUrl", "buttonText", "buttonLink", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmr678fmu004m01p72n1w1nch	\N	\N	/uploads/banners/1783159628313-9pdbuf78yfw.webp	/uploads/banners/1783159675503-id5dwaz9j4c.webp	\N	\N	0	t	2026-07-04 10:08:01.062	2026-07-04 10:08:01.062
cmqai7avb000001mm89ana4mw	Impowering Traditions	This is the most valuable business for us. 	/uploads/banners/1783161459192-znar1exkr6m.webp	/uploads/banners/1783161483879-xfmgiku2swl.webp	Explore Now 	/shop	0	t	2026-06-12 05:46:26.375	2026-07-04 10:38:55.012
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, slug, title, excerpt, content, "coverImage", author, category, tags, "isPublished", "readTime", "publishedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, "imageUrl", "isFeatured", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmqb4ipuq000101o99488s2hm	Baby kantha	baby-kantha	/uploads/categories/1781280879013-jpt95u9blu.webp	t	100	2026-06-12 16:11:10.563	2026-06-12 16:14:40.994
cmqgf0fju001801p79tsbduzv	Feeding item (baby)	feeding-item-baby	/uploads/categories/1781600605076-us4gidztio.webp	t	500	2026-06-16 09:03:44.058	2026-06-16 09:03:44.058
cmr1upxld003v01p78qp1b3w9	For Little Ones	for-little-ones	/uploads/categories/1782896689947-wmy3jcyol6.webp	t	1	2026-07-01 09:06:37.778	2026-07-23 21:02:09.235
cmqg9295e000u01p7qmgbgk2n	(King size) nakshi Katha	king-size-nakshi-katha	/uploads/categories/1784840924086-7obl96uctjn.webp	t	200	2026-06-16 06:17:11.378	2026-07-23 21:08:51.515
cmqq9kaui002e01p7aia9qsi7	Mother item	mother-item	/uploads/categories/1784841620943-pxkzx1pvvv9.webp	t	100	2026-06-23 06:28:55.146	2026-07-23 21:20:25.483
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupons (id, code, type, value, "minOrderAmount", "maxUses", "usedCount", "isActive", "expiresAt", description, "createdAt", "updatedAt") FROM stdin;
cmqauv9sh000401pgxwz4lzsl	TEST10	PERCENTAGE	100.00	0.00	100	0	t	2026-06-13 23:59:59		2026-06-12 11:41:00.113	2026-06-12 11:41:00.113
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, "orderId", "productId", "productTitle", "productImage", price, quantity, "lineTotal") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "orderNumber", "customerName", phone, address, notes, subtotal, "deliveryCharge", total, "paymentMethod", status, "adminNote", "courierConsignmentId", "courierTrackingCode", "courierSentAt", "courierStatus", "createdAt", "updatedAt", "couponCode", discount) FROM stdin;
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pages (id, slug, title, subtitle, sections, "metaTitle", "metaDescription", "isPublished", "updatedAt") FROM stdin;
cmqaoq4fm000101pcjkzz1xfh	faq	Frequently Asked Questions	Find answers to common questions	[{"id": "faq-s1", "order": 1, "title": "Ordering & Payment", "content": "<h2>Ordering & Payment</h2><p><strong>Q: How do I place an order?</strong><br/>A: Browse our products, add to cart, and complete checkout. You can also order via WhatsApp.</p><p><strong>Q: What payment methods do you accept?</strong><br/>A: We accept Cash on Delivery, bKash, Nagad, and bank transfer.</p>"}, {"id": "faq-s2", "order": 2, "title": "Shipping & Returns", "content": "<h2>Shipping & Returns</h2><p><strong>Q: How long does delivery take?</strong><br/>A: 3-5 business days within Dhaka, 5-7 days outside Dhaka.</p><p><strong>Q: What is your return policy?</strong><br/>A: We accept returns within 7 days of delivery for unused items.</p>"}]	FAQ - Shilperhaat	Frequently asked questions	t	2026-06-12 08:49:02.193
cmqaoq4fm000201pcl3ph07h7	contact	Contact Us	We would love to hear from you	[{"id": "contact-s1", "order": 1, "title": "Get In Touch", "content": "<h2>Get In Touch</h2><p>📞 Phone: 01700000000</p><p>✉️ Email: info@shilperhaat.com</p><p>📍 Address: Dhaka, Bangladesh</p><p>🕐 Hours: Monday - Saturday, 10AM - 8PM</p>"}, {"id": "contact-s2", "order": 2, "title": "Order via WhatsApp", "content": "<h2>Order via WhatsApp</h2><p>For quick orders and inquiries, message us on WhatsApp at +880-1700-000000. Our team responds within 30 minutes during business hours.</p>"}]	Contact Us - Shilperhaat	Contact Shilperhaat	t	2026-06-12 08:49:02.193
cmqaoq4fm000301pcoskjoyso	privacy-policy	Privacy Policy	How we collect and use your information	[{"id": "privacy-policy-s1", "order": 1, "title": "Information We Collect", "content": "<h2>Information We Collect</h2><p>We collect information you provide when placing orders including name, phone number, email address, and delivery address. We also collect browsing data to improve our website.</p>"}, {"id": "privacy-policy-s2", "order": 2, "title": "How We Use Your Information", "content": "<h2>How We Use Your Information</h2><p>Your information is used only to process orders and improve our services. We never sell your personal data to third parties. Your data is stored securely and protected.</p>"}]	Privacy Policy - Shilperhaat	Privacy policy	t	2026-06-12 08:49:02.193
cmqaoq4fm000401pcep025yfn	terms-of-use	Terms of Use	Terms and conditions for using Shilperhaat	[{"id": "terms-of-use-s1", "order": 1, "title": "Terms & Conditions", "content": "<h2>Terms & Conditions</h2><p>By using Shilperhaat, you agree to these terms. All products are handmade and may have slight variations from images shown. Prices are in Bangladeshi Taka (৳).</p>"}, {"id": "terms-of-use-s2", "order": 2, "title": "User Responsibilities", "content": "<h2>User Responsibilities</h2><p>Users must provide accurate delivery information. Shilperhaat is not responsible for delays caused by incorrect addresses. All disputes are subject to Bangladesh law.</p>"}]	Terms of Use - Shilperhaat	Terms of use	t	2026-06-12 08:49:02.193
cmqaoq4fm000501pcaqaf6zfe	refund-policy	Refund Policy	Our refund and exchange policy	[{"id": "refund-policy-s1", "order": 1, "title": "Return & Refund Policy", "content": "<h2>Return & Refund Policy</h2><p>We accept returns within 7 days of delivery. Items must be unused and in original condition. To initiate a return, contact us via WhatsApp or email with your order number and reason.</p>"}, {"id": "refund-policy-s2", "order": 2, "title": "Refund Process", "content": "<h2>Refund Process</h2><p>Approved refunds are processed within 3-5 business days. Refunds are issued via the original payment method. Delivery charges are non-refundable unless the item was defective.</p>"}]	Refund Policy - Shilperhaat	Refund policy	t	2026-06-12 08:49:02.193
cmqaoq4fm000601pcwxjj6e72	delivery-policy	Delivery Policy	Shipping and delivery information	[{"id": "delivery-policy-s1", "order": 1, "title": "Delivery Areas & Times", "content": "<h2>Delivery Areas & Times</h2><p>We deliver across Bangladesh. Dhaka city: 2-3 business days. Outside Dhaka: 4-6 business days. We use trusted courier partners for all deliveries.</p>"}, {"id": "delivery-policy-s2", "order": 2, "title": "Delivery Charges", "content": "<h2>Delivery Charges</h2><p>Free delivery on orders above ৳1,500. Below ৳1,500: ৳60 inside Dhaka, ৳120 outside Dhaka. Express delivery available on request for additional charge.</p>"}]	Delivery Policy - Shilperhaat	Delivery policy	t	2026-06-12 08:49:02.193
cmqaoq4fm000701pc8m0pdk4y	shipping-info	Shipping Info	Everything about our shipping process	[{"id": "shipping-info-s1", "order": 1, "title": "How We Ship", "content": "<h2>How We Ship</h2><p>All orders are carefully packed to protect products during transit. We use Sundarban Courier, Pathao, and Redx for reliable delivery across Bangladesh.</p>"}, {"id": "shipping-info-s2", "order": 2, "title": "Tracking Your Order", "content": "<h2>Tracking Your Order</h2><p>After shipment, you will receive a tracking number via SMS and email. Use this to track your order on the courier's website. Contact us if you face any issues.</p>"}]	Shipping Info - Shilperhaat	Shipping information	t	2026-06-12 08:49:02.193
cmqaoq4fm000801pcvlu559am	support	Support Center	We are here to help you	[{"id": "support-s1", "order": 1, "title": "How Can We Help?", "content": "<h2>How Can We Help?</h2><p>Our support team is available Monday to Saturday, 10AM to 8PM. Reach us via phone, WhatsApp, or email. Average response time is under 1 hour during business hours.</p>"}, {"id": "support-s2", "order": 2, "title": "Support Channels", "content": "<h2>Support Channels</h2><p>📞 Call: 01700000000<br/>💬 WhatsApp: +880-1700-000000<br/>✉️ Email: support@shilperhaat.com<br/>For urgent issues, WhatsApp is the fastest way to reach us.</p>"}]	Support - Shilperhaat	Customer support	t	2026-06-12 08:49:02.193
cmqaoq4fm000901pcsmfht5x6	how-to-order	How to Order	Simple steps to place your order	[{"id": "how-to-order-s1", "order": 1, "title": "Online Ordering Steps", "content": "<h2>Online Ordering Steps</h2><p><strong>Step 1:</strong> Browse products and select what you like.<br/><strong>Step 2:</strong> Click \\"Add to Cart\\" or \\"Buy Now\\".<br/><strong>Step 3:</strong> Enter your delivery address and phone number.<br/><strong>Step 4:</strong> Select Cash on Delivery or online payment.<br/><strong>Step 5:</strong> Confirm your order. Done!</p>"}, {"id": "how-to-order-s2", "order": 2, "title": "Order via WhatsApp", "content": "<h2>Order via WhatsApp</h2><p>Prefer to order by phone? Simply send us a WhatsApp message with the product name and your delivery address. Our team will confirm your order and arrange delivery.</p>"}]	How to Order - Shilperhaat	How to order	t	2026-06-12 08:49:02.193
cmqaoq4fm000a01pcidnokiv8	track-order	Track Your Order	Check the status of your order	[{"id": "track-order-s1", "order": 1, "title": "Track Your Order", "content": "<h2>Track Your Order</h2><p>Enter your order number or phone number below to check your order status. You can also contact us directly via WhatsApp at +880-1700-000000 for order updates.</p>"}, {"id": "track-order-s2", "order": 2, "title": "Order Status Guide", "content": "<h2>Order Status Guide</h2><p><strong>Processing:</strong> Order received and being prepared.<br/><strong>Shipped:</strong> Order handed to courier.<br/><strong>Out for Delivery:</strong> Order is on its way.<br/><strong>Delivered:</strong> Order successfully delivered.</p>"}]	Track Order - Shilperhaat	Track your order	t	2026-06-12 08:49:02.193
cmqaoq4fm000b01pctiapzi0t	blog	Blog	Stories, tips and news from Shilperhaat	[{"id": "blog-s1", "order": 1, "title": "Latest Articles", "content": "<h2>Latest Articles</h2><p>Our blog is coming soon. We will share stories about our artisans, textile traditions, and tips for caring for your handcraft products.</p>"}]	Blog - Shilperhaat	Shilperhaat blog	t	2026-06-12 08:49:02.193
cmqaoq4fm000c01pcel6fzufm	careers	Careers	Join the Shilperhaat team	[{"id": "careers-s1", "order": 1, "title": "Work With Us", "content": "<h2>Work With Us</h2><p>We are always looking for passionate people who believe in preserving Bangladesh's craft heritage. If you are interested in joining our team, send your CV to careers@shilperhaat.com.</p>"}, {"id": "careers-s2", "order": 2, "title": "Current Openings", "content": "<h2>Current Openings</h2><p>No current openings. Check back soon or send us your profile for future opportunities.</p>"}]	Careers - Shilperhaat	Career opportunities	t	2026-06-12 08:49:02.193
cmqaoq4fm000d01pclerix01o	press	Press	Media resources and press releases	[{"id": "press-s1", "order": 1, "title": "Press & Media", "content": "<h2>Press & Media</h2><p>For media inquiries, interviews, or press resources, contact our team at press@shilperhaat.com. We are happy to share our story about promoting Bangladeshi handcraft traditions.</p>"}]	Press - Shilperhaat	Press and media	t	2026-06-12 08:49:02.193
cmqaoq4fm000e01pcvlh1ssxx	account	My Account	Manage your account	[{"id": "account-s1", "order": 1, "title": "My Account", "content": ""}]	My Account - Shilperhaat	My account	t	2026-06-12 08:49:02.193
cmqaoq4fl000001pc77oufolg	about	About Us	Our story and mission	[{"id": "about-s1", "order": 1, "title": "Main Content", "content": "<h2>Who We Are</h2><p>Shilperhaat is Bangladesh's premier handcraft textile marketplace, dedicated to preserving and promoting traditional Bengali craftsmanship. We connect skilled artisans directly with customers who value authentic, hand-crafted textiles.</p>"}, {"id": "about-s2", "order": 2, "title": "Additional Content", "content": "<h2>Our Mission</h2><p>Our mission is to bring Bangladesh's rich textile heritage to every home. We work with master artisans across the country to offer premium quality Katha, Chadar, Nakshi Katha, Blankets, and Muslin products.</p>"}]	About Us - Shilperhaat	Learn about Shilperhaat	t	2026-06-12 12:03:52.269
cmqb8pmk1000001lr314d5b7c	naim	About		[{"id": "naim-s1", "order": 1, "title": "Main Content", "content": "<p>Write the content for About here.</p>"}]	About - Shilperhaat	About	t	2026-06-12 18:08:31.345
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, "productId", "imageUrl", "sortOrder", "altText") FROM stdin;
cmt3z29qg001801mt03vu850t	cmqe8mde5000001p7t7i7dcc6	/uploads/products/1784841870973-rtfv3chx18d.webp	0	\N
cmt3z29qg001901mt8zwksj4n	cmqe8mde5000001p7t7i7dcc6	/uploads/products/1781468842273-g9a36r9eyvm.webp	1	\N
cmt3z29qg001a01mtpb90tpvo	cmqe8mde5000001p7t7i7dcc6	/uploads/products/1781468848518-g7vpjwg5irn.webp	2	\N
cmt3z29qg001b01mtdigu7dbf	cmqe8mde5000001p7t7i7dcc6	/uploads/products/1781468855036-6y3xq3jm1vo.webp	3	\N
cmt3z29qg001c01mtvqpkhba8	cmqe8mde5000001p7t7i7dcc6	/uploads/products/1781468859402-q66n3fd5ydd.webp	4	\N
cmt3z29qg001d01mt2eigeflv	cmqe8mde5000001p7t7i7dcc6	/uploads/products/1781468866506-jgy6ljva3zc.webp	5	\N
cmt3z29qg001e01mtip8bnrwt	cmqe8mde5000001p7t7i7dcc6	/uploads/products/1781468869579-pjeufotya9g.webp	6	\N
cmqgebz2h001201p7z0zdkg7c	cmqg9dte7000v01p7sr64gdwn	/uploads/products/1781590696526-nrcod8dz1sd.webp	0	\N
cmqgebz2h001301p70kjdvifj	cmqg9dte7000v01p7sr64gdwn	/uploads/products/1781590699335-fwdq783iftd.webp	1	\N
cmqgebz2h001401p74jaqnxpe	cmqg9dte7000v01p7sr64gdwn	/uploads/products/1781590703852-wj9hpv0ac0b.webp	2	\N
cmqgeezcw001601p79df4lnbg	cmqgeezcm001501p7r3ygi7et	/uploads/products/1781599581104-el4t6sbw7df.webp	0	\N
cmqgeezcw001701p72yw0e04o	cmqgeezcm001501p7r3ygi7et	/uploads/products/1781599586248-auneiw78g4d.webp	1	\N
cmqgg2k8t001a01p7k8jc3uye	cmqgg2k8p001901p72a7ajgk0	/uploads/products/1781602359455-2gresda9t6r.webp	0	\N
cmqgg2k8t001b01p7vvz0q1vr	cmqgg2k8p001901p72a7ajgk0	/uploads/products/1781602363089-lleic2mtl1.webp	1	\N
cmqgg2k8t001c01p7739byuln	cmqgg2k8p001901p72a7ajgk0	/uploads/products/1781602365732-uct2nuzpi4q.webp	2	\N
cmqgp6489001j01p79bad40qn	cmqggldgo001d01p74awq3idq	/uploads/products/1781603179769-2649gwdnbl7.webp	0	\N
cmqgp6489001k01p74oohrbtj	cmqggldgo001d01p74awq3idq	/uploads/products/1781603367424-8zfpmjixau.webp	1	\N
cmqgp6489001l01p78964zo12	cmqggldgo001d01p74awq3idq	/uploads/products/1781603369830-5twtwg53xi.webp	2	\N
cmqgpe6ob001n01p74gtiqy7x	cmqgpe6o6001m01p7ustug5hu	/uploads/products/1781617988550-tyrxowat2j.webp	0	\N
cmqgpe6ob001o01p7s6z9cf57	cmqgpe6o6001m01p7ustug5hu	/uploads/products/1781617991371-5lpogmxnfx4.webp	1	\N
cmqgpe6ob001p01p7pjfuwfxm	cmqgpe6o6001m01p7ustug5hu	/uploads/products/1781617994536-getgbjnwcis.webp	2	\N
cmqgpwscw001r01p7lkej06uk	cmqgpwscn001q01p752lpg3x7	/uploads/products/1781618842885-wxnkulsx3hm.webp	0	\N
cmqgpwscw001s01p7xqt82r12	cmqgpwscn001q01p752lpg3x7	/uploads/products/1781618848969-m90tzqtffu.webp	1	\N
cmqgpwscw001t01p7riv3ujio	cmqgpwscn001q01p752lpg3x7	/uploads/products/1781618893823-3v6sjjvy70q.webp	2	\N
cmqgrbjgr001w01p7vmu395n0	cmqgr485x001u01p7ryzznj2o	/uploads/products/1781620929384-i069rwuxqr.webp	0	\N
cmqhnr1ox002101p7m1ydohlj	cmqgrh45u001x01p7oewlvwyn	/uploads/products/1781621405846-a9ejcltrrkh.webp	0	\N
cmqhnr1ox002201p7bmvw7ill	cmqgrh45u001x01p7oewlvwyn	/uploads/products/1781621484364-8abbalf7ufx.webp	1	\N
cmqhnr1ox002301p7td2dl7eb	cmqgrh45u001x01p7oewlvwyn	/uploads/products/1781621487156-racx2uvyki.webp	2	\N
cmqhnwd5g002501p75d4dx69p	cmqhnwd5b002401p76l3o47wt	/uploads/products/1781675898786-amk6lz2h4y.webp	0	\N
cmqhnwd5g002601p7ehru73vx	cmqhnwd5b002401p76l3o47wt	/uploads/products/1781675979646-8q9n5grpyjh.webp	1	\N
cmqhnwd5g002701p75yjkx6rt	cmqhnwd5b002401p76l3o47wt	/uploads/products/1781675986676-tzzarhymgpf.webp	2	\N
cmqqb10c8002g01p733by121h	cmqqb10c4002f01p7hko274j4	/uploads/products/1782198503364-v49e2sv0e2j.webp	0	\N
cmqqb10c8002h01p786uoojkr	cmqqb10c4002f01p7hko274j4	/uploads/products/1782198504967-2n4i0hzebt8.webp	1	\N
cmqqb10c8002i01p7ddfxf82n	cmqqb10c4002f01p7hko274j4	/uploads/products/1782198526970-vsnnyn3xd1g.webp	2	\N
cmqqb10c8002j01p70p2ut5gj	cmqqb10c4002f01p7hko274j4	/uploads/products/1782198541013-yng28m0zhnq.webp	3	\N
cmqz0c2wc003i01p7o341rgbf	cmqe9wmcf000s01p7dq6v2by8	/uploads/products/1782724780188-lgb5si3bxks.webp	0	\N
cmqz0c2wc003j01p7o26250xm	cmqe9wmcf000s01p7dq6v2by8	/uploads/products/1782724781436-ha8nqbv8as6.webp	1	\N
cmqz0c2wc003k01p7d6p2q60s	cmqe9wmcf000s01p7dq6v2by8	/uploads/products/1782724783112-q62miux1f6f.webp	2	\N
cmqz0c2wc003l01p7zg3deqho	cmqe9wmcf000s01p7dq6v2by8	/uploads/products/1782724784569-owfh0xkka3.webp	3	\N
cmqz0c2wc003m01p74d2mubx4	cmqe9wmcf000s01p7dq6v2by8	/uploads/products/1782724786453-tp0o6m8dwkc.webp	4	\N
cmqz0c2wc003n01p7sk58mc15	cmqe9wmcf000s01p7dq6v2by8	/uploads/products/1782724788080-jsh6u22hg98.webp	5	\N
cmqz0h1am003p01p7olsghe6k	cmqz0h1ai003o01p7s0sbow8n	/uploads/products/1782724982241-7w37qwetmq8.webp	0	\N
cmqz0h1am003q01p7olkf71pp	cmqz0h1ai003o01p7s0sbow8n	/uploads/products/1782724983433-hst2uta652t.webp	1	\N
cmqz0h1am003r01p7e1sdum75	cmqz0h1ai003o01p7s0sbow8n	/uploads/products/1782724984646-iwrzv269w6.webp	2	\N
cmqz0h1am003s01p7mpd8f3iu	cmqz0h1ai003o01p7s0sbow8n	/uploads/products/1782724985766-nc2tu7xp4lc.webp	3	\N
cmqz0h1am003t01p7l6c8rxka	cmqz0h1ai003o01p7s0sbow8n	/uploads/products/1782724986897-13w7xzl6upt.webp	4	\N
cmqz0h1am003u01p7f01ewrrq	cmqz0h1ai003o01p7s0sbow8n	/uploads/products/1782724988139-lxkol70gxa.webp	5	\N
cmt3yzat6000m01mtq8m1wud4	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378395905-kh1sx2dhdt8.webp	0	\N
cmr65rh5n004101p7inb5jbdt	cmqe9dcmw000q01p702dikskr	/uploads/products/1781470111259-osml23x4b7q.webp	0	\N
cmr65rh5n004201p7odq5fckp	cmqe9dcmw000q01p702dikskr	/uploads/products/1782723907104-p5rnkjmtgzj.webp	1	\N
cmr65rh5n004301p777g174y2	cmqe9dcmw000q01p702dikskr	/uploads/products/1782723910588-oaaj4en5ws.webp	2	\N
cmr65rh5n004401p7jwqya24e	cmqe9dcmw000q01p702dikskr	/uploads/products/1782723912806-u518dqm31vq.webp	3	\N
cmr65rh5n004501p7ty66c4q9	cmqe9dcmw000q01p702dikskr	/uploads/products/1782723914158-sh9lss2dkh.webp	4	\N
cmr65rh5n004601p790rbs41n	cmqe9dcmw000q01p702dikskr	/uploads/products/1782723915336-f74q8u8dmvn.webp	5	\N
cmt3yzat6000n01mt6hj4sruy	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378394865-gmne00x9who.webp	1	\N
cmt3yzat6000o01mtx7slq9f5	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378397360-6px8s6e4fl5.webp	2	\N
cmt3yzat6000p01mtdi6hw1oj	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378398984-r1pmef3uk1q.webp	3	\N
cmt3yzat6000q01mt0qet0vg0	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378400182-m6d3hadmm7d.webp	4	\N
cmt3yzat6000r01mt881n6ult	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378401620-42fspd4ww21.webp	5	\N
cmt3yzat6000s01mt78wyeo8d	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378403898-kdwylkctd0f.webp	6	\N
cmt3yzat6000t01mt40c4drfe	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378407826-6xam6mpfzh8.webp	7	\N
cmr65s8us004e01p7kmfa31tv	cmqq9bbed002c01p79mveys3u	/uploads/products/1782195667930-vqlvtnqa91b.webp	0	\N
cmr65s8us004f01p7n8nr3va3	cmqq9bbed002c01p79mveys3u	/uploads/products/1782206471278-ruri55lvx7e.webp	1	\N
cmr65s8us004g01p7ffwz0i0d	cmqq9bbed002c01p79mveys3u	/uploads/products/1782206487831-e4dys55xek7.webp	2	\N
cmr65s8us004h01p7kvb0hp5x	cmqq9bbed002c01p79mveys3u	/uploads/products/1782206509105-2w9ncrbtjem.webp	3	\N
cmt3yzat6000u01mtxjpwtanz	cmrxzs6yg000001l5lxzhx6ex	/uploads/products/1787378409619-3cmo0ijrap8.webp	8	\N
cmsyyyqch000501mtff3bzgv4	cmr1vmcm3003w01p7du72hbf4	/uploads/products/1782898247538-gqci1opp1ig.webp	0	\N
cmsyyyqch000601mt86mugl0b	cmr1vmcm3003w01p7du72hbf4	/uploads/products/1784840653340-6a1w3o3kukx.webp	1	\N
cmsyyyqch000701mtb27tmdpk	cmr1vmcm3003w01p7du72hbf4	/uploads/products/1782898250975-hpjyjo9ih2j.webp	2	\N
cmsyyyqch000801mt5c1zaolp	cmr1vmcm3003w01p7du72hbf4	/uploads/products/1782898253824-1tkjj16cgsv.webp	3	\N
cmt3yzzx4000v01mttbif8njf	cmsepw1m4000001phihs6290r	/uploads/products/1785851438920-mk4qksnf2t8.webp	0	\N
cmt3yzzx4000w01mtl0ahlvjf	cmsepw1m4000001phihs6290r	/uploads/products/1785851439439-n9svheusk7.webp	1	\N
cmt3yzzx4000x01mtwhepspw1	cmsepw1m4000001phihs6290r	/uploads/products/1785851439887-y96ysbf3adi.webp	2	\N
cmt3yzzx4000y01mtwr47oext	cmsepw1m4000001phihs6290r	/uploads/products/1785851440314-s3toxcpq02.webp	3	\N
cmt3yzzx4000z01mtgf915ha5	cmsepw1m4000001phihs6290r	/uploads/products/1785851440748-b4xbc9b23ti.webp	4	\N
cmt3yzzx4001001mtkso3keim	cmsepw1m4000001phihs6290r	/uploads/products/1785851441091-vhjc6w5eaqo.webp	5	\N
cmt3yzzx4001101mtzxm7kl9c	cmsepw1m4000001phihs6290r	/uploads/products/1785851441537-xs2efnoioy.webp	6	\N
cmt3yzzx4001201mts6q5bv13	cmsepw1m4000001phihs6290r	/uploads/products/1785851441920-qyf2lnd9wrn.webp	7	\N
cmt3yzzx4001301mt1k2li8gg	cmsepw1m4000001phihs6290r	/uploads/products/1785851442261-gdjxm41t4vr.webp	8	\N
cmt3yzzx4001401mthoa942vc	cmsepw1m4000001phihs6290r	/uploads/products/1785851442625-203djawi9k3.webp	9	\N
cmt3yzzx4001501mtlqtolmgf	cmsepw1m4000001phihs6290r	/uploads/products/1785851443016-t1y6192572.webp	10	\N
cmt3yzzx4001601mtb55wzujd	cmsepw1m4000001phihs6290r	/uploads/products/1785851443428-o0xls477i6.webp	11	\N
cmt3yzzx4001701mtdgfya1zp	cmsepw1m4000001phihs6290r	/uploads/products/1785851443831-gd05dk5uwj9.webp	12	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, title, slug, description, price, "compareAtPrice", stock, "categoryId", "isFeatured", "isBestSelling", status, sku, tags, "videoUrl", "youtubeUrl", "youtubeVideoId", "createdAt", "updatedAt") FROM stdin;
cmqgg2k8p001901p72a7ajgk0	"King size" premium jamalpuri nakshi katha (maroon color-2)	king-size-premium-jamalpuri-nakshi-katha-maroon-color-2	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div>★হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div>★উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div>★সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div>★নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div>★ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><br></div><div><i><font color="#f48721"><b>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</b></font></i></div>	2280.00	2850.00	20	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{}	\N	\N	\N	2026-06-16 09:33:23.065	2026-06-16 09:33:23.065
cmqg9dte7000v01p7sr64gdwn	"King size" premium jamalpuri nakshi katha (Navy color)	king-size-premium-jamalpuri-nakshi-katha-navy-color	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div>★হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div>★উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div>★সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div>★নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div>★ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><br></div><div><font color="#f48721"><i>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</i></font></div>	2280.00	2850.00	2	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-16 06:26:10.831	2026-06-16 08:44:42.95
cmqgeezcm001501p7r3ygi7et	"King size" premium jamalpuri nakshi katha (maroon color)	king-size-premium-jamalpuri-nakshi-katha-maroon-color	<h2><u><b><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত</font></b></u>&nbsp;</h2><div><br></div><div>★হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div>★উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div>★সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div>★নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div>★ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><font color="#f48721"><i><br></i></font></div><div><font color="#f48721"><i>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</i></font></div>	2280.00	2850.00	50	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-16 08:47:03.286	2026-06-16 08:47:03.286
cmqe9wmcf000s01p7dq6v2by8	(Big size) Ac baby nakshi Katha  (7-Peace)	big-size-ac-baby-nakshi-katha-7-peace	<font color="#e53e3e"><b>এসি বেবি নকশি কাঁথা সম্পর্কে বিস্তারিত..&nbsp;</b></font><div><br></div><div><font color="#f48721"><i><b>৭ পিস এসি বেবি নকশি কাঁথা মাত্র ১,৫৮০ টাকা</b></i></font><br><div><br></div><div><b>সাইজ</b> ৩২"৪২"+</div><div>(অর্থাৎ বেবী নকশী কাঁথার সবচেয়ে বড় সাইজ)&nbsp;</div><div><br></div><div>★উভয় পাশে সেম কাজ (ডাবল লেয়ার)</div><div><br></div><div>★পরিপূর্ণ সুতী কাপড়ের তৈরি&nbsp;</div><div>(গরমে বাবুর রাফ ইউজ এর জন্য পারফেক্ট নকশি কাঁথা)</div><div><br></div><div><br></div></div>	1580.00	1780.00	90	cmqb4ipuq000101o99488s2hm	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-14 21:05:15.807	2026-06-29 09:20:30.633
cmqggldgo001d01p74awq3idq	"King size" premium jamalpuri nakshi katha (red color)	king-size-premium-jamalpuri-nakshi-katha-red-color	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div>★হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div>★উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div>★সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div>★নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div>★ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><br></div><div><i><font color="#f48721">"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</font></i></div>	2280.00	2850.00	20	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-16 09:48:00.744	2026-06-16 13:48:05.476
cmqgpe6o6001m01p7ustug5hu	"King size" premium jamalpuri nakshi katha (magenta color)	king-size-premium-jamalpuri-nakshi-katha-magenta-color	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div>★হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div>★উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div>★সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div>★নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div>★ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><br></div><div><font color="#f48721"><i><b>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</b></i></font></div>	2280.00	2850.00	20	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-16 13:54:21.894	2026-06-16 13:54:21.894
cmqgpwscn001q01p752lpg3x7	"King size" premium jamalpuri nakshi katha (pink color)	king-size-premium-jamalpuri-nakshi-katha-pink-color	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div><font color="#e53e3e">★</font>হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div><font color="#e53e3e">★</font>উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div><font color="#e53e3e">★</font>সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div><font color="#e53e3e">★</font>নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div><font color="#e53e3e">★</font>ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><br></div><div><font color="#f48721"><b><i>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</i></b></font></div>	2280.00	2850.00	20	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-16 14:08:49.799	2026-06-16 14:08:49.799
cmqgr485x001u01p7ryzznj2o	"King size" premium jamalpuri nakshi katha (Yolo color)	king-size-premium-jamalpuri-nakshi-katha-yolo-color	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div><font color="#e53e3e">★</font>হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div><font color="#e53e3e">★</font>উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div><font color="#e53e3e">★</font>সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div><font color="#e53e3e">★</font>নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div><font color="#e53e3e">★</font>ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><h2><font color="#f48721"><i><br>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</i></font></h2>	2280.00	2850.00	10	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-16 14:42:36.501	2026-06-16 14:48:17.736
cmqgrh45u001x01p7oewlvwyn	"King size" premium jamalpuri nakshi katha (Red color-02)	king-size-premium-jamalpuri-nakshi-katha-red-color-02	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div><font color="#e53e3e">★</font>হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div><font color="#e53e3e">★</font>উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div><font color="#e53e3e">★</font>সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div><font color="#e53e3e">★</font>নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div><font color="#e53e3e">★</font>ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><br></div><div><font color="#f48721"><b><i>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</i></b></font></div>	2280.00	2850.00	20	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-16 14:52:37.842	2026-06-17 05:56:08.91
cmqhnwd5b002401p76l3o47wt	"King size" premium jamalpuri nakshi katha (yellow color-02)	king-size-premium-jamalpuri-nakshi-katha-yellow-color-02	<h2><font color="#e53e3e">কিং সাইজ জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত&nbsp;</font></h2><div><br></div><div><font color="#e53e3e">★</font>হাইগ্রেডের মোটা সুতী কাপড়ের তৈরি&nbsp;</div><div><font color="#e53e3e">★</font>উভয় পাশে সেম কাপড়। ব্যাক সাইডে কোন ধরনের ফলস বা পাতলা কাপড় নেই।&nbsp;</div><div><font color="#e53e3e">★</font>সেলাই লক করা। অর্থাৎ হঠাৎ কোথাও টান লাগলে ছিঁড়ে যাবে না।</div><div><font color="#e53e3e">★</font>নকশি কাঁথাগুলো তৈরির পর আমাদের এখানেই একবার ওয়াশ করা হয়ে থাকে। সুতরাং আপনি দেখলেই বুঝতে পারবেন কালার গিয়েছে কিনা।</div><div><font color="#e53e3e">★</font>ফ্রন্ট সাইডে ভারী কাজ। ব্যাকসাইডে সলিড কাপড় লাগানো। যেন গায়ে দেওয়ার পর আপনি পরিপূর্ণ ওম পেতে পারেন</div><div><br></div><div><font color="#f48721"><i>"এক কথায় কোয়ালিটিতে আপনি পরিপূর্ণ সন্তুষ্ট থাকবেন ইনশাল্লাহ"</i></font></div>	2280.00	2850.00	20	cmqg9295e000u01p7qmgbgk2n	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-17 06:00:17.039	2026-06-17 06:00:17.039
cmqqb10c4002f01p7hko274j4	Very necessary product for breastfeeding mom	very-necessary-product-for-breastfeeding-mom	পরে লিখব	1650.00	1950.00	100	cmqq9kaui002e01p7aia9qsi7	f	f	ACTIVE	\N	{"100% silicon"}	\N	\N	\N	2026-06-23 07:09:54.292	2026-06-23 07:09:54.292
cmqz0h1ai003o01p7s0sbow8n	Ac baby nakshi Katha (10 piece)	ac-baby-nakshi-katha-10-piece	<h2>এসি বেবি নকশি কাঁথা সম্পর্কে বিস্তারিত..&nbsp;</h2><div><br></div><h2><font color="#e53e3e"><b>১০ পিস এসি বেবি নকশি কাঁথা মাত্র ২১৯০ টাকা</b></font></h2><div><br></div><h2>সাইজ ৩২"৪২"+</h2><div>(অর্থাৎ বেবী নকশী কাঁথার সবচেয়ে বড় সাইজ)&nbsp;</div><div><br></div><div><font color="#e53e3e">★</font><b>উভয় পাশে সেম কাজ (ডাবল লেয়ার)</b></div><div><br></div><div><font color="#e53e3e">★</font><b>পরিপূর্ণ সুতী কাপড়ের তৈরি&nbsp;</b></div><div><b>(গরমে বাবুর রাফ ইউজ এর জন্য পারফেক্ট নকশি কাঁথা)</b></div><div><br></div><div><br></div>	2190.00	2500.00	100	cmqb4ipuq000101o99488s2hm	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-06-29 09:24:21.834	2026-06-29 09:24:21.834
cmqe9dcmw000q01p702dikskr	Jamalpuri gorgeous nakshi Katha. (5-piece) "1pis ac nakshi Katha free"	jamalpuri-gorgeous-nakshi-katha-5-piece	<b>জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত..&nbsp;&nbsp;</b><div><br></div><div><font color="#f48721"><i>(৫ পিসের কম্বো গিফট বক্সের সাথে ১টি এসি বেবি নকশি কাঁথা সম্পূর্ণ ফ্রি)</i></font></div><div><br></div><div><b>সাইজ</b>&nbsp;</div><div>★ ৩২"/৪১"</div><div>(বাবুর আড়াই থেকে তিন বছর পর্যন্ত ইজিলি ইউজ করা যায়)</div><div><br></div><div><b>কাঁথা বৃত্তান্ত</b></div><div>★ হুবুহু বড় নকশী কাঁথার মোটা সুতি কাপড় দিয়ে তৈরি হয় এই কাঁথাগুলো&nbsp;</div><div>&nbsp;</div><div>★ নকশী কাঁথাগুলোর ব্যাকপার্টে কোন ধরনের ফলস বা পাতলা কাপড় নেই। উভয় পাশে সেম সুতি কাপড় ইউজ করা হয় ।&nbsp;</div><div><br></div><div>★ জামালপুরের স্থানীয় কর্মীদের ৭-১০  দিন টানা পরিশ্রমে আমাদের একটি একটি কাঁথা তৈরি হয় ।&nbsp;</div><div><br></div><div>★ বাবুর আরামের জন্য কাঁথাগুলোর ব্যাকপার্টে সলিড কাপড় লাগানো থাকে। যেন গায়ে সুতার রেশ না পড়ে এবং বাবু পুরোপুরি ওম পেতে পারে&nbsp;&nbsp;</div>	2380.00	2650.00	50	cmqb4ipuq000101o99488s2hm	f	t	ACTIVE	\N	{"100% poplin cotton"}	/uploads/videos/1781470126664-o75m2ydpks.mp4	\N	\N	2026-06-14 20:50:16.76	2026-07-04 09:26:50.259
cmqe8mde5000001p7t7i7dcc6	Jamalpuri gorgeous nakshi Katha (5-piece) "1pis ac nakshi Katha free"	jamalpuri-gorgeous-nakshi-katha-5-piece-1pis-ac-nakshi-katha-free	<h3><b>জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে  বিস্তারিত..&nbsp;&nbsp;</b></h3><div><br></div><div><b><font color="#f48721"><i>(৫ পিসের কম্বো গিফট বক্সের সাথে ১টি এসি বেবি নকশি কাঁথা সম্পূর্ণ ফ্রি)</i></font><br></b><div><br><div><b>সাইজ</b>&nbsp;</div><div>★ ৩২"/৪১"</div><div>(বাবুর আড়াই থেকে তিন বছর পর্যন্ত ইজিলি ইউজ করা যায়)<br><div><br></div><div><b>কাঁথা বৃত্তান্ত</b></div><div>★ হুবুহু বড় নকশী কাঁথার মোটা সুতি কাপড় দিয়ে তৈরি হয় এই কাঁথাগুলো&nbsp;</div><div>&nbsp;</div><div>★ নকশী কাঁথাগুলোর ব্যাকপার্টে কোন ধরনের ফলস বা পাতলা কাপড় নেই। উভয় পাশে সেম সুতি কাপড় ইউজ করা হয় ।&nbsp;</div><div><br></div><div>★ জামালপুরের স্থানীয় কর্মীদের ৭-১০&nbsp; দিন টানা পরিশ্রমে আমাদের একটি একটি  কাঁথা তৈরি হয় ।&nbsp;</div><div><br></div><div>★  বাবুর আরামের জন্য কাঁথাগুলোর ব্যাকপার্টে সলিড কাপড় লাগানো থাকে। যেন গায়ে সুতার রেশ না পড়ে এবং বাবু পুরোপুরি ওম পেতে পারে&nbsp;&nbsp;</div><div><br></div></div></div></div>	2380.00	2650.00	149	cmr1upxld003v01p78qp1b3w9	f	t	ACTIVE	\N	{"100% poplin cotton"}	/uploads/videos/1781468851465-worowcu4h2.mp4	\N	\N	2026-06-14 20:29:18.029	2026-09-16 07:22:51.957
cmqq9bbed002c01p79mveys3u	Jamalpuri gorgeous nakshi Katha. (3-piece)	jamalpuri-gorgeous-nakshi-katha-3-piece	<h2><font color="#e53e3e">জামালপুরি গর্জিয়াস নকশি কাঁথা সম্পর্কে বিস্তারিত..&nbsp;&nbsp;</font></h2><div><br></div><h2>সাইজ&nbsp;</h2><div><font color="#e53e3e">★</font> ৩২"/৪১"</div><div>(বাবুর আড়াই থেকে তিন বছর পর্যন্ত ইজিলি ইউজ করা যায়)</div><div><br></div><h2>কাঁথা বৃত্তান্ত</h2><div><font color="#e53e3e">★</font> হুবুহু বড় নকশী কাঁথার মোটা সুতি কাপড় দিয়ে তৈরি হয় এই কাঁথাগুলো&nbsp;</div><div>&nbsp;</div><div><font color="#e53e3e">★</font> নকশী কাঁথাগুলোর ব্যাকপার্টে কোন ধরনের ফলস বা পাতলা কাপড় নেই। উভয় পাশে সেম সুতি কাপড় ইউজ করা হয় ।&nbsp;</div><div><br></div><div><font color="#e53e3e">★</font> জামালপুরের স্থানীয় কর্মীদের ৭-১০ দিন টানা পরিশ্রমে আমাদের একটি একটি কাঁথা তৈরি হয় ।&nbsp;</div><div><br></div><div><font color="#e53e3e">★</font> বাবুর আরামের জন্য কাঁথাগুলোর ব্যাকপার্টে সলিড কাপড় লাগানো থাকে। যেন গায়ে সুতার রেশ না পড়ে এবং বাবু পুরোপুরি ওম পেতে পারে&nbsp;&nbsp;</div>	1460.00	1680.00	99	cmqb4ipuq000101o99488s2hm	f	t	ACTIVE	\N	{"100% poplin cotton"}	/uploads/videos/1782206663793-x9z5fs0um8.mp4	\N	\N	2026-06-23 06:21:55.957	2026-09-22 04:04:55.669
cmrxzs6yg000001l5lxzhx6ex	baby adjustable (Mustard) Pillow 1	baby-adjustable-mustard-pillow-1	<h2><font color="#e53e3e"><u>সরিষা বালিশ সম্পর্কে বিস্তারিত</u></font><u style="color: rgb(229, 62, 62); font-size: 1.25em;">&nbsp;</u></h2><div><u style="color: rgb(229, 62, 62); font-size: 1.25em;"><br></u></div><div><span style="font-size: 17.5px;"><font color="#222831">&nbsp;</font><font color="#e53e3e">★</font><font color="#222831"> বাবুর মাথার শেপ গোল করতে সরিষা বালিশের ব্যবহার প্রায় শত শত বছরের পুরোনো&nbsp;</font></span></div><div><font color="#222831"><span style="font-size: 17.5px;"><br></span></font></div><div><span style="font-size: 17.5px;"><font color="#e53e3e">★</font><font color="#222831"> জন্মের পর শিশুরস তাদের&nbsp; ঘাড় ঠিক ভাবে ধরে রাখতে পারে না। এই বালিশটা তাদের ঘাড় কে দারুন সাপোর্ট দেয়&nbsp;</font></span></div><div><font color="#222831"><span style="font-size: 17.5px;"><br></span></font></div><div><span style="font-size: 17.5px;"><font color="#e53e3e">★</font><font color="#222831">বালিশের ফেব্রিক গুলো সরাসরি চায়না ইমপোর্টেড। অত্যন্ত উন্নত মানের ফেব্রিক ইউজ করা হয়েছে আলহামদুলিল্লাহ&nbsp;</font></span></div><div><font color="#222831"><span style="font-size: 17.5px;"><br></span></font></div><div><span style="font-size: 17.5px;"><font color="#e53e3e">★</font><font color="#222831">১০০% সুপার কটন</font></span></div><div><font color="#222831"><span style="font-size: 17.5px;"><br></span></font></div><div><span style="font-size: 17.5px;"><font color="#e53e3e">★</font><font color="#222831">প্রতিটি কভারের ভেতরে আরও একটি কভার রয়েছে। তার ভেতরে সরিষা রাখা।&nbsp;</font></span></div><div><font color="#222831"><span style="font-size: 17.5px;"><br></span></font></div><div><span style="font-size: 17.5px;"><font color="#e53e3e"><b>★</b></font><font color="#222831">দুই পাশে পিলো থাকায়&nbsp; বাবুর মাথার সাথে খুব সহজে অ্যাডজাস্ট হয়ে যায়।&nbsp;</font></span></div><div><font color="#222831"><span style="font-size: 17.5px;"><br></span></font></div><div><span style="font-size: 17.5px;"><font color="#f48721"><i><b>একথায় বাবুর মাথাকে গোল করতে এবং ঘাড় কে সাপোর্ট দিতে অত্যন্ত প্রয়োজনীয় একটি প্রোডাক্ট</b></i></font></span></div><div><font color="#222831"><span style="font-size: 17.5px;"><br></span></font></div>	590.00	720.00	96	cmr1upxld003v01p78qp1b3w9	f	f	ACTIVE	\N	{"100% cotton"}	\N	\N	\N	2026-07-23 20:56:58.936	2026-08-22 06:00:50.292
cmr1vmcm3003w01p7du72hbf4	(3 piece combo) nakshi Katha & sarisha pillow	3-piece-combo-nakshi-katha-sarisha-pillow	<h2><font color="#e53e3e">২ টি লাহোরী নকশি কাঁথা ও ১ টি সরিষা বালিশের দারুন কম্বো!🥰</font></h2><div><br></div><h2><font color="#f48721">সরিষা বালিশ&nbsp;</font></h2><div>(চায়না ইমপোর্টেড) সরিষা বালিশ বাবুর মাথাকে গোল করতে এবং তার ঘাড়ের সঠিক পজিশন ধরে রাখতে অত্যন্ত প্রয়োজনীয় একটি প্রোডাক্ট।</div><div><br></div><h2><font color="#f48721"><b>লাহোরী নকশিকাঁথা&nbsp;</b></font></h2><div><font color="#f48721"><b><br></b></font></div><div><font color="#f48721">★</font> <b>সাইজ ৩২"/৪১"+</b></div><div>&nbsp; &nbsp;(অর্থাৎ বেবি নকশী কাঁথার সবচেয়ে বড় সাইজের )</div><div><br></div><div><font color="#f48721">★</font> <b>সর্বোচ্চ মানের সুতী কাপড়ের পরিপূর্ণ নিশ্চয়তা</b></div><div>&nbsp;</div><div><font color="#f48721">★</font> <b>উভয় পাশে সেম কাপড়&nbsp;</b></div><div>&nbsp; &nbsp;(ব্যাকসাইডে কোন ধরনের ফলস বা পাতলা কাপড়</div><div>&nbsp; &nbsp;ইউজ করা হয়নি)</div><div><br></div><div><font color="#f48721">★</font> <b>সেলাই লক করা&nbsp;</b></div><div>&nbsp; &nbsp; (কোথাও টান লাগলে ছিঁড়ে যাবে না)</div><div><br></div><div>&nbsp;<font color="#e53e3e"><b>বাবুর জন্য অত্যন্ত প্রয়োজনীয় একটি দারুণ কম্ব</b></font></div>	1480.00	1890.00	50	cmr1upxld003v01p78qp1b3w9	f	t	ACTIVE	\N	{"100% poplin cotton"}	\N	\N	\N	2026-07-01 09:31:50.235	2026-08-18 18:01:32.893
cmsepw1m4000001phihs6290r	Complete feeding set	complete-feeding-set	<h2><font color="#e53e3e">Complete Baby Feeding Set&nbsp;<span style="font-size: 1.1em; font-weight: normal;">–&nbsp;</span></font></h2><h2><span style="font-size: 1.1em; font-weight: normal; color: rgb(229, 62, 62);">(13 Pieces) ✅</span></h2><div><span style="color: rgb(34, 40, 49); font-size: 1.25em; font-weight: 700;"><br></span></div><div><span style="color: rgb(34, 40, 49); font-size: 1.25em; font-weight: 700;">আমাদের শিল্পেরহাটে সবচেয়ে বেশি বিক্রিত পণ্য, "এই প্রিমিয়াম ফিডিং সেটটি" আলহামদুলিল্লাহ&nbsp;</span></div><h2><br>কারণ আমরা বাবা মাদেরকে এটা নিশ্চিত করতে পেরেছি যে এই প্যাকেজে সবকিছুই দিচ্ছি ব্রান্ডের ও অত্যন্ত হাই কোয়ালিটির</h2><div><br></div><h2><font color="#e53e3e">প্যাকেজে থাকছে</font>-</h2><h2><font color="#e53e3e">★</font>ডাকবিগ ব্র্যান্ডের প্রিমিয়াম মামপট।&nbsp;</h2><h2><font color="#e53e3e">★</font>অ্যাপল বিয়ার ব্যান্ডের ফুডগ্রেড ফুল</h2><h2>&nbsp; &nbsp; সিলিকন স্পুন ফিডার&nbsp;</h2><h2><font color="#e53e3e">★</font>একটি 304 গ্রেডের স্টেইনলেস স্টিট&nbsp; &nbsp; &nbsp; পট,</h2><h2><font color="#e53e3e">★</font>এপোল বিয়ার ব্যান্ডের ফুড মেশার।</h2><h2><font color="#e53e3e">★</font>একটি সিলিকন ফ্রুড পেসিফিয়ার ।</h2><h2><font color="#e53e3e">★</font>ট্রে বিপ,</h2><h2><u><font color="#e53e3e">★</font></u>সিলিকন ডাবল স্পুন।&nbsp;</h2><h2><font color="#e53e3e">★</font>নি প্রটেকশন প্যাড</h2><h2><font color="#e53e3e">★</font>ফুড গ্রেড সিলিকন ফিংগার ব্রাশ।&nbsp;</h2><h2><font color="#e53e3e">★</font>শাওয়ার ব্রাশ</h2><h2><font color="#e53e3e">★</font>এল ই ডি ইয়ার পিক,</h2><h2><font color="#e53e3e">★</font>মামপট ও ফিডারের স্ট্রো ক্লিনার</h2><div><br></div><h2><font color="#f48721"><i>কোন অপ্রয়োজনীয় বা সস্তা পণ্য নয়।&nbsp;<br></i></font><font color="#f48721"><i>অত্যন্ত প্রয়োজনীয় সব প্রোডাক্ট দিয়ে সাজানো হয়েছে আমাদের এই প্যাকেজটি</i></font></h2>	1399.00	1560.00	1000	cmr1upxld003v01p78qp1b3w9	f	f	ACTIVE	\N	{"100% food grade silicon"}	\N	\N	\N	2026-08-04 13:52:07.468	2026-08-22 06:01:22.827
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, name, title, rating, content, "avatarUrl", role, "isVisible", "sortOrder", "createdAt", "updatedAt", "productId") FROM stdin;
cmsfm4kfv000r01phhh8n9r4y	naim	\N	5	I'm really happy with this Complete Baby Feeding Set! The quality is excellent, and everything arrived exactly as shown in the pictures.\nThe feeding bottle, silicone bowl, spoon, fruit feeder, bib, and all the other accessories are well-made, baby-friendly, and very useful for daily feeding. It's so convenient to have everything in one complete set instead of buying each item separately.\nThe packaging was secure and premium, and the product is definitely worth the price. I highly recommend this set to any parent looking for a complete feeding solution or a thoughtful baby gift.\nThank you, Shilperhaat! I'll definitely shop again. ❤️	\N	\N	f	0	2026-08-05 04:54:32.827	2026-08-05 04:54:32.827	cmsepw1m4000001phihs6290r
\.


--
-- Data for Name: site_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_content (key, value, "updatedAt") FROM stdin;
site-layout	{"email": "shilperhaat@gmail.com", "phone": "01606547497", "address": "Baridhara,dhaka", "logoUrl": "/uploads/site/1781687151903-4ithwhcnq57.webp", "tagline": "Handcraft Marketplace", "navItems": [{"href": "/shop?category=katha", "label": "Katha"}, {"href": "/shop?category=nakshi-katha", "label": "Nakshi Katha"}, {"href": "/shop?category=chador", "label": "Chadar", "dropdown": [{"href": "/shop?category=chador&filter=cotton", "label": "Cotton Chadar"}, {"href": "/shop?category=chador&filter=jamdani", "label": "Jamdani Chadar"}, {"href": "/shop?category=chador&filter=muslin", "label": "Muslin Chadar"}]}, {"href": "/shop?category=kambal", "label": "Blanket", "dropdown": [{"href": "/shop?category=kambal&filter=wool", "label": "Wool Blanket"}, {"href": "/shop?category=kambal&filter=cotton", "label": "Cotton Blanket"}]}, {"href": "/shop?category=muslin", "label": "Muslin"}, {"href": "/shop?sort=newest", "label": "New Arrivals"}, {"href": "/shop?filter=offer", "label": "Offer Zone"}, {"href": "/shop", "label": "Collections", "dropdown": [{"href": "/shop?category=katha", "label": "Katha Collection"}, {"href": "/shop?category=nakshi-katha", "label": "Nakshi Katha Collection"}, {"href": "/shop?category=gamcha", "label": "Gamcha Collection"}]}, {"href": "/about", "label": "About"}], "siteName": "Shilperhaat", "logoWidth": 140, "logoHeight": 50, "logoLetter": "S", "twitterUrl": "", "facebookUrl": "https://facebook.com/shilperhaat", "footerLinks": {"shop": [], "policy": [{"href": "/privacy-policy", "label": "Privacy Policy"}, {"href": "/terms-of-use", "label": "Terms of Use"}, {"href": "/refund-policy", "label": "Refund Policy"}, {"href": "/delivery-policy", "label": "Delivery Policy"}], "support": [{"href": "/track-order", "label": "Order Tracking"}, {"href": "/delivery-policy", "label": "Payment"}, {"href": "/shipping-info", "label": "Shipping"}, {"href": "/faq", "label": "FAQ"}], "information": [{"href": "/about", "label": "About Us"}, {"href": "/contact", "label": "Contact Us"}, {"href": "/about", "label": "Company Information"}, {"href": "/terms-of-use", "label": "Terms & Conditions"}, {"href": "/privacy-policy", "label": "Privacy Policy"}]}, "instagramUrl": "https://instagram.com/shilperhaat", "whatsappNumber": "+8801789117183", "footerCopyright": "© 2026 Shilperhaat. All rights reserved.", "footerDescription": "Bringing Bangladesh's traditional handcraft textiles to your doorstep. Premium-quality Katha, Chadar & Blankets."}	2026-07-22 06:18:21.932
contact-widget	{"phoneNumber": "01606547497", "whatsappUrl": "https://wa.me/8801789117183", "emailAddress": "shilperhaat01@gmail.com", "messengerUrl": "https://m.me/616518841553069", "widgetEnabled": true, "buttonPosition": "bottom-right", "welcomeMessage": "আমাদের সাথে যোগাযোগ করুন"}	2026-07-22 06:18:40.287
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, "siteName", "logoUrl", "faviconUrl", "footerCopyright", "whatsappNumber", "socialLinks", "deliveryCharge", "freeDeliveryMin", "updatedAt") FROM stdin;
cmqav6c7v000501pgwfzkl94r	Shilperhaat	/uploads/brand/1781274194261-uja62no351a.webp	\N	\N	https://wa.me/01789117183	null	0.00	\N	2026-06-29 09:33:53.67
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_page_access admin_page_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_page_access
    ADD CONSTRAINT admin_page_access_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: admin_page_access_adminId_pageKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "admin_page_access_adminId_pageKey_key" ON public.admin_page_access USING btree ("adminId", "pageKey");


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: pages_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- Name: admin_page_access admin_page_access_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_page_access
    ADD CONSTRAINT "admin_page_access_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict oo8wFzn1AJCD42YfFP2af6qmItarX5L5rPlqNQJIDo4Fwxfih4XovzGBSWusnSI

