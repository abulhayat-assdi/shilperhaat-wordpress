// usage: node crop.js in.png out.png x y w h
const fs=require('fs'),{PNG}=require('pngjs');const [i,o,x,y,w,h]=process.argv.slice(2);
const A=PNG.sync.read(fs.readFileSync(i));const W=+w,H=+h;const O=new PNG({width:W,height:H});PNG.bitblt(A,O,+x,+y,W,H,0,0);fs.writeFileSync(o,PNG.sync.write(O));
