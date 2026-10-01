// usage: node order-flow.js <baseUrl> <productId> <outDir> [prefix]
// Places a COD order through the real checkout UI, then screenshots thank-you and track-order.
const { chromium } = require('playwright-core');
(async () => {
  const [base, pid, out, prefix = ''] = process.argv.slice(2);
  require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const cart = [{ id: pid, productId: pid, title: 'Complete feeding set', price: 1399, compareAtPrice: 1560, image: '/uploads/products/1785851438920-mk4qksnf2t8.webp', quantity: 2, stock: 1000, slug: 'complete-feeding-set' }];
  await ctx.addInitScript((c) => { if (!localStorage.getItem('seeded')) { localStorage.setItem('sh_cart', JSON.stringify(c)); localStorage.setItem('seeded', '1'); } }, cart);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '/checkout', { waitUntil: 'networkidle' });
  await p.fill('input[name=customerName]', 'Rahim Uddin'); await p.fill('input[name=phone]', '01712345678'); await p.fill('input[name=houseAddress]', 'House 12, Road 4');
  await p.click('button:has-text("Select District")'); await p.click('button:text-is("Dhaka")');
  await p.click('button:has-text("Select Thana")'); await p.click('button:text-is("Gulshan")');
  await p.fill('textarea[name=notes]', 'Call before delivery');
  await p.click('button:has-text("PLACE ORDER")');
  await p.waitForURL(/thank-you/, { timeout: 20000 });
  await p.waitForTimeout(800);
  const url = p.url(); console.log('thank-you url:', url);
  await p.screenshot({ path: `${out}/${prefix}thankyou_d.png`, fullPage: true });
  const num = new URL(url).searchParams.get('order');
  await p.goto(base + '/track-order?order=' + num, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/${prefix}track_d.png`, fullPage: true });
  await p.goto(base + '/track-order', { waitUntil: 'networkidle' });
  await p.screenshot({ path: `${out}/${prefix}track_empty_d.png`, fullPage: true });
  console.log('order', num, 'errors', JSON.stringify(errs));
  await b.close();
})();
