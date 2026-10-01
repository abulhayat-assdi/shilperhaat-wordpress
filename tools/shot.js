// usage: node shot.js <baseUrl> <outDir> <path1,path2,...> [desktop|mobile|both]
const { chromium } = require('playwright-core');
(async () => {
  const [base, out, paths, mode = 'both'] = process.argv.slice(2);
  const fs = require('fs'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const vps = [];
  if (mode !== 'mobile') vps.push(['d', 1440, 900]);
  if (mode !== 'desktop') vps.push(['m', 390, 844]);
  for (const [tag, w, h] of vps) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    for (const path of paths.split(',')) {
      await p.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto', path, e.message));
      await p.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
      await p.waitForTimeout(1200);
      const name = (path === '/' ? 'home' : path.replace(/[^a-z0-9]+/gi, '_')) + '_' + tag + '.png';
      await p.screenshot({ path: `${out}/${name}`, fullPage: true });
      console.log('saved', name);
    }
    await ctx.close();
  }
  await b.close();
})();
