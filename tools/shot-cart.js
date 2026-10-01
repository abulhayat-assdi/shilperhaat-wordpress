// usage: node shot-cart.js <baseUrl> <outDir> <productId> [prefix]
// Seeds localStorage with a cart (one product, qty 2) and screenshots /cart and /checkout (empty + filled) on desktop/mobile.
const { chromium } = require('playwright-core');
(async () => {
  const [base, out, pid, prefix = ''] = process.argv.slice(2);
  require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const cart = [{ id: pid, productId: pid, title: 'Complete feeding set', price: 1399, compareAtPrice: 1560, image: '/uploads/products/1785851438920-mk4qksnf2t8.webp', quantity: 2, stock: 1000, slug: 'complete-feeding-set' }];
  for (const [tag, w, h] of [['d', 1440, 900], ['m', 390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await ctx.addInitScript((c) => { try { if (!localStorage.getItem('sh_cart_seeded')) { localStorage.setItem('sh_cart', JSON.stringify(c)); localStorage.setItem('sh_cart_seeded', '1'); } } catch (e) {} }, cart);
    const p = await ctx.newPage();
    const shot = async (name) => { await p.waitForTimeout(700); await p.screenshot({ path: `${out}/${prefix}${name}_${tag}.png`, fullPage: true }); console.log('saved', name, tag); };
    await p.goto(base + '/cart', { waitUntil: 'networkidle' }); await shot('cart');
    await p.goto(base + '/checkout', { waitUntil: 'networkidle' }); await shot('checkout');
    await p.click('button:has-text("PLACE ORDER")', { force: true }).catch(() => {});
    await p.fill('input[name=customerName]', 'Rahim Uddin'); await p.fill('input[name=phone]', '01712345678'); await p.fill('input[name=houseAddress]', 'House 12, Road 4');
    await p.click('button:has-text("Select District")'); await shot('checkout_dd');
    await p.click('button:text-is("Dhaka")').catch(() => {}); await p.fill('textarea[name=notes]', 'Call before delivery');
    await p.click('text=Have any coupon or gift voucher?'); await shot('checkout_filled');
    await ctx.close();
  }
  await b.close();
})();
