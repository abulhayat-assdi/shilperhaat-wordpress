// usage: node rows.js a.png b.png  -> prints y-ranges (bands of 50px) with highest mismatch
const fs=require('fs'),{PNG}=require('pngjs');const [a,b]=process.argv.slice(2);
const A=PNG.sync.read(fs.readFileSync(a)),B=PNG.sync.read(fs.readFileSync(b));const w=Math.min(A.width,B.width),h=Math.min(A.height,B.height);
const bands=[];for(let y=0;y<h;y+=50){let n=0;for(let yy=y;yy<Math.min(h,y+50);yy++)for(let x=0;x<w;x++){const i=(yy*A.width+x)*4,j=(yy*B.width+x)*4;if(Math.abs(A.data[i]-B.data[j])+Math.abs(A.data[i+1]-B.data[j+1])+Math.abs(A.data[i+2]-B.data[j+2])>60)n++;}bands.push([y,n]);}
console.log(bands.filter(x=>x[1]>w*0.02).map(x=>x[0]+':'+x[1]).join('  '));
