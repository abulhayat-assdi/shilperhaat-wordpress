// usage: node shot-admin.js <baseUrl> <outDir> <email> <password> [prefix] [productId]
// Logs into the admin UI and screenshots every admin page (desktop).
const { chromium } = require('playwright-core');
(async () => {
  const [base, out, email, pw, prefix = '', pid = ''] = process.argv.slice(2);
  require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await p.goto(base + '/admin/login', { waitUntil: 'networkidle' });
  await p.screenshot({ path: `${out}/${prefix}login.png` });
  await p.fill('input[type=email]', email); await p.fill('input[type=password]', pw);
  await p.click('button[type=submit]');
  await p.waitForURL(/dashboard/, { timeout: 20000 });
  const pages = ['dashboard', 'products', 'products/new', pid ? 'products/' + pid : null, 'categories', 'banners', 'reviews', 'orders', 'coupons', 'pages', 'site-layout', 'contact-widget', 'settings', 'access-management'].filter(Boolean);
  for (const pg of pages) {
    await p.goto(base + '/admin/' + pg, { waitUntil: 'networkidle' }); await p.waitForTimeout(900);
    await p.screenshot({ path: `${out}/${prefix}${pg.replace(/\W+/g, '_')}.png`, fullPage: false });
    console.log('saved', pg);
  }
  console.log('ERRORS', JSON.stringify(errs, null, 1));
  await b.close();
})();
