// usage: node diff.js a.png b.png out.png  -> prints size + mismatch stats
const fs = require('fs'), { PNG } = require('pngjs'), pm = require('pixelmatch');
const [a, b, out] = process.argv.slice(2);
const A = PNG.sync.read(fs.readFileSync(a)), B = PNG.sync.read(fs.readFileSync(b));
const w = Math.min(A.width, B.width), h = Math.min(A.height, B.height);
const crop = (I) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(I, o, 0, 0, w, h, 0, 0); return o; };
const ca = crop(A), cb = crop(B), d = new PNG({ width: w, height: h });
const n = pm(ca.data, cb.data, d.data, w, h, { threshold: 0.1 });
fs.writeFileSync(out, PNG.sync.write(d));
console.log(`A ${A.width}x${A.height}  B ${B.width}x${B.height}  diffPixels ${n} (${(100 * n / (w * h)).toFixed(2)}%)`);
