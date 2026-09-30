// usage: node smoke-all.js <baseUrl>
// Loads every public route on desktop + mobile and reports JS errors / failed or 4xx/5xx requests; then exercises mobile UI.
const { chromium } = require('playwright-core');
(async () => {
  const base = process.argv[2] || 'http://localhost:8080';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const routes = ['/', '/shop', '/shop?category=baby-kantha&sort=price_desc&minPrice=500', '/shop?search=katha', '/shop?search=zzzz', '/shop?page=2', '/product/complete-feeding-set', '/cart', '/checkout', '/thank-you', '/track-order', '/account', '/about', '/faq', '/contact', '/privacy-policy', '/terms-of-use', '/refund-policy', '/delivery-policy', '/shipping-info', '/support', '/how-to-order', '/careers', '/press', '/naim', '/nope', '/product/nope', '/robots.txt', '/sitemap.xml', '/manifest.webmanifest', '/favicon.ico'];
  let bad = 0;
  for (const [tag, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    const issues = [];
    p.on('pageerror', e => issues.push('pageerror ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/facebook|google|ERR_|Failed to load resource.*(40[34])/.test(m.text())) issues.push('console ' + m.text().slice(0, 140)); });
    p.on('response', r => { const u = r.url(); if (u.startsWith(base) && r.status() >= 400 && !/\/nope|favicon/.test(u)) issues.push(r.status() + ' ' + u.replace(base, '')); });
    for (const r of routes) {
      const res = await p.goto(base + r, { waitUntil: 'networkidle' }).catch(e => ({ status: () => 'ERR ' + e.message }));
      const st = res.status();
      const expect = /nope/.test(r) ? 404 : 200;
      if (st !== expect) { issues.push(`status ${st} (want ${expect}) ${r}`); }
    }
    console.log(tag, issues.length ? issues : 'clean');
    bad += issues.length;
    await ctx.close();
  }
  // mobile UI
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.click('[data-sh-open-menu]'); await p.waitForTimeout(400);
  console.log('mobile menu open:', await p.evaluate(() => getComputedStyle(document.querySelector('#sh-mm')).transform !== 'matrix(1, 0, 0, 1, -300, 0)' ));
  await p.click('[data-sh-close-menu]'); await p.waitForTimeout(400);
  await p.click('[data-sh-open-contact]'); console.log('bottom-nav contact popup:', await p.isVisible('.sh-fc-pop'));
  await p.mouse.click(10, 300); await p.waitForTimeout(200); console.log('popup closes on outside tap:', !(await p.isVisible('.sh-fc-pop')));
  await p.goto(base + '/shop', { waitUntil: 'networkidle' });
  await p.click('[data-shop-open]'); console.log('filter drawer:', await p.isVisible('#sh-shop-drawer'));
  await p.check('#sh-shop-drawer input[value=best_selling]'); await p.waitForLoadState('networkidle'); console.log('drawer filter url:', p.url());
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  const before = await p.evaluate(() => document.querySelector('#sh-cat-track').scrollLeft);
  await p.click('[data-cat-scroll="1"]'); await p.waitForTimeout(600);
  console.log('category scroller moved:', (await p.evaluate(() => document.querySelector('#sh-cat-track').scrollLeft)) >= before);
  // desktop: sticky nav + hero autoplay
  const c2 = await b.newContext({ viewport: { width: 1440, height: 900 } }); const d = await c2.newPage();
  await d.goto(base + '/', { waitUntil: 'networkidle' });
  await d.evaluate(() => window.scrollTo(0, 400)); await d.waitForTimeout(400);
  console.log('nav sticky:', await d.evaluate(() => document.querySelector('#sh-nav').classList.contains('is-sticky') && document.body.style.paddingTop));
  const first = await d.evaluate(() => [...document.querySelectorAll('.sh-hero-slide')].findIndex(s => s.style.display !== 'none'));
  await d.waitForTimeout(4500);
  console.log('hero advanced:', first, '->', await d.evaluate(() => [...document.querySelectorAll('.sh-hero-slide')].findIndex(s => s.style.display !== 'none')));
  await b.close();
  process.exit(bad ? 1 : 0);
})();
