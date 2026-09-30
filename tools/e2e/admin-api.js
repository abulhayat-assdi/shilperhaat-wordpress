// usage: node admin-api.js <baseUrl> <email> <password>
// Exercises every admin endpoint through the bundled UI's fetch shim (same code path the UI uses).
const { chromium } = require('playwright-core');
(async () => {
  const [base, email, pw] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(base + '/admin/login', { waitUntil: 'networkidle' });
  await p.fill('input[type=email]', email); await p.fill('input[type=password]', pw); await p.click('button[type=submit]');
  await p.waitForURL(/dashboard/);
  const call = (method, url, body) => p.evaluate(async ([m, u, bd]) => {
    const r = await fetch(u, { method: m, headers: { 'Content-Type': 'application/json' }, body: bd ? JSON.stringify(bd) : undefined });
    let j = null; try { j = await r.json(); } catch (e) {}
    return { s: r.status, j };
  }, [method, url, body]);
  const show = (name, r, pick) => console.log(name.padEnd(28), r.s, JSON.stringify(pick ? pick(r.j) : r.j).slice(0, 140));
  let r;
  // categories
  r = await call('POST', '/api/admin/categories', { name: 'Test Cat', slug: 'test-cat', isFeatured: true, sortOrder: 7, imageUrl: '' }); show('category create', r, j => j.category); const cid = r.j.category.id;
  r = await call('POST', '/api/admin/categories', { name: 'Dup', slug: 'test-cat' }); show('category dup', r);
  r = await call('PUT', '/api/admin/categories/' + cid, { name: 'Test Cat 2', slug: 'test-cat', isFeatured: false, sortOrder: 9 }); show('category update', r, j => j.category.name);
  // product
  r = await call('POST', '/api/admin/products', { title: 'বাংলা টেস্ট প্রোডাক্ট', slug: 'bangla-test-product', description: '<p>Hello <script>alert(1)</script><b>bold</b></p>', price: 500, compareAtPrice: 650, stock: 5, categoryId: cid, isFeatured: true, isBestSelling: true, status: 'ACTIVE', sku: 'T-1', tags: ['a', 'b'], images: ['/uploads/products/1785851438920-mk4qksnf2t8.webp'], videoUrl: null, youtubeUrl: 'https://youtu.be/abcdefghijk', youtubeVideoId: 'abcdefghijk' }); show('product create', r, j => j.product && [j.product.id, j.product.slug, j.product.price, j.product.compareAtPrice, j.product.description]); const pid = r.j.product.id;
  r = await call('POST', '/api/admin/products', { title: 'dup', slug: 'bangla-test-product', price: 1 }); show('product dup slug', r);
  r = await call('PUT', '/api/admin/products/' + pid, { title: 'বাংলা টেস্ট ২', slug: 'bangla-test-product', price: 450, stock: 0, status: 'OUT_OF_STOCK', categoryId: cid, tags: ['x'], images: [] }); show('product update', r, j => j.product && [j.product.status, j.product.stock, j.product.images.length]);
  const pub = await p.evaluate(async (u) => (await fetch(u)).status, base + '/product/' + encodeURIComponent('bangla-test-product'));
  console.log('public product page'.padEnd(28), pub);
  // banners
  r = await call('POST', '/api/admin/banners', { title: 'T', imageUrl: '/uploads/banners/x.webp', sortOrder: 5, isActive: true }); show('banner create', r, j => j.banner); const bid = r.j.banner.id;
  r = await call('PUT', '/api/admin/banners/' + bid, { title: 'T2', imageUrl: '/uploads/banners/x.webp', isActive: false }); show('banner update', r, j => j.banner.isActive);
  r = await call('DELETE', '/api/admin/banners/' + bid); show('banner delete', r);
  // reviews
  r = await call('POST', '/api/admin/reviews', { name: 'Rev', content: 'Great', rating: 4, isVisible: true, sortOrder: 1 }); show('review create', r, j => j.review.id); const rid = r.j.review.id;
  r = await call('PUT', '/api/admin/reviews/' + rid, { name: 'Rev2', content: 'Great!!', rating: 5, isVisible: false, sortOrder: 2 }); show('review update', r, j => [j.review.name, j.review.isVisible]);
  r = await call('DELETE', '/api/admin/reviews/' + rid); show('review delete', r);
  // coupons
  r = await call('POST', '/api/admin/coupons', { code: 'e2e5', type: 'FIXED', value: 50, minOrderAmount: 100, maxUses: 3, isActive: true, expiresAt: '2030-01-01', description: 'x' }); show('coupon create', r, j => j.coupon); const kid = r.j.coupon && r.j.coupon.id;
  r = await call('POST', '/api/admin/coupons', { code: 'E2E5', type: 'FIXED', value: 50 }); show('coupon dup', r);
  r = await call('PUT', '/api/admin/coupons/' + kid, { isActive: false, value: 60 }); show('coupon update', r, j => [j.coupon.isActive, j.coupon.value]);
  r = await call('DELETE', '/api/admin/coupons/' + kid); show('coupon delete', r);
  // pages
  r = await call('GET', '/api/admin/pages'); show('pages list', r, j => j.pages.length);
  r = await call('PUT', '/api/admin/pages/faq', { subtitle: 'Edited subtitle', sections: [{ id: 'faq-s1', title: 'A', content: '<h2>Hi</h2><script>x</script>', order: 1 }] }); show('page update', r, j => [j.page.subtitle, j.page.sections[0].content]);
  // site content
  r = await call('GET', '/api/site-content/site-layout'); const lay = r.j.value; show('site-layout get', r, j => Object.keys(j.value).length);
  lay.navItems = []; lay.footerLinks.information.push({ href: '/newpage', label: 'New Page' });
  r = await call('PUT', '/api/admin/site-content/site-layout', { value: lay }); show('site-layout put', r, j => !!j.value);
  r = await call('GET', '/api/admin/pages'); show('pages after links', r, j => j.pages.some(x => x.slug === 'newpage'));
  r = await call('PUT', '/api/admin/site-content/contact-widget', { value: { phoneNumber: '01600000000', widgetEnabled: true, whatsappUrl: 'https://wa.me/8801789117183', messengerUrl: 'https://m.me/x', emailAddress: 'a@b.co', welcomeMessage: 'hi', buttonPosition: 'bottom-left' } }); show('contact-widget put', r, j => j.value.buttonPosition);
  // settings
  r = await call('PUT', '/api/admin/settings', { siteName: 'Shilperhaat', logoUrl: '/uploads/brand/1781274194261-uja62no351a.webp', footerCopyright: '', whatsappNumber: '+8801789117183', deliveryCharge: 60, freeDeliveryMin: 2500 }); show('settings put', r, j => j.settings);
  r = await call('PUT', '/api/admin/integrations', { steadfast: { apiKey: 'k1', secretKey: 's1' }, meta: { pixelId: '1234567890', accessToken: 'tok', testEventCode: 'TEST1' } }); show('integrations put', r);
  r = await call('GET', '/api/courier/steadfast'); show('steadfast test (offline)', r);
  // orders
  r = await call('GET', '/api/admin/data/orders'); show('orders data', r, j => j.orders.length); const oid = r.j.orders[0].id;
  r = await call('PUT', '/api/admin/orders/' + oid, { status: 'CONFIRMED', adminNote: 'called' }); show('order confirm', r, j => [j.order.status, j.order.adminNote]);
  r = await call('PUT', '/api/admin/orders/' + oid, { status: 'CANCELLED' }); show('order cancel', r, j => j.order.status);
  r = await call('DELETE', '/api/admin/orders/' + oid); show('order delete', r);
  // users
  r = await call('POST', '/api/admin/users', { name: 'Staff One', email: 'staff1@example.com', password: 'secret123', role: 'admin', pageAccess: ['products', 'orders', 'bogus'] }); show('user create', r, j => j.user); const uid = r.j.user && r.j.user.id;
  r = await call('PUT', '/api/admin/users/' + uid, { role: 'admin', pageAccess: ['products'] }); show('user update', r, j => j.user.pageAccess);
  r = await call('GET', '/api/admin/users'); show('users list', r, j => j.users.length);
  // cleanup
  r = await call('DELETE', '/api/admin/products/' + pid); show('product delete', r);
  r = await call('DELETE', '/api/admin/categories/' + cid); show('category delete', r);
  await b.close();
  // staff login + access rules
  const b2 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const c2 = await b2.newContext(); const p2 = await c2.newPage();
  await p2.goto(base + '/admin/login', { waitUntil: 'networkidle' });
  await p2.fill('input[type=email]', 'staff1@example.com'); await p2.fill('input[type=password]', 'secret123'); await p2.click('button[type=submit]');
  await p2.waitForURL(/dashboard/);
  const call2 = (m, u) => p2.evaluate(async ([mm, uu]) => { const r = await fetch(uu, { method: mm }); return r.status; }, [m, u]);
  console.log('staff products (allowed)'.padEnd(28), await call2('GET', '/api/admin/data/products'));
  console.log('staff orders (denied)'.padEnd(28), await call2('GET', '/api/admin/data/orders'));
  console.log('staff users (denied)'.padEnd(28), await call2('GET', '/api/admin/users'));
  console.log('sidebar:', (await p2.textContent('aside')).replace(/\s+/g, ' ').slice(0, 120));
  await b2.close();
})();
