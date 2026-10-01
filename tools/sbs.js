// usage: node sbs.js ref.png wp.png out.png x y w h   -> side-by-side crop (ref left, wp right)
const fs=require('fs'),{PNG}=require('pngjs');const [a,b,o,x,y,w,h]=process.argv.slice(2);
const A=PNG.sync.read(fs.readFileSync(a)),B=PNG.sync.read(fs.readFileSync(b));const W=+w,H=+h;
const O=new PNG({width:W*2+10,height:H});O.data.fill(255);PNG.bitblt(A,O,+x,+y,W,H,0,0);PNG.bitblt(B,O,+x,+y,W,H,W+10,0);fs.writeFileSync(o,PNG.sync.write(O));
