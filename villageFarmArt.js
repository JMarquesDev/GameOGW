import { FARM_BUILDINGS, ANIMAL_PENS, TORO_LIGHTS, GARDEN } from './villageLayout.js'
const box=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)}
function roof(c,x,y,w,color) {
  c.fillStyle='#45392c'; c.beginPath(); c.moveTo(x-12,y+30); c.lineTo(x+w/2,y-40); c.lineTo(x+w+12,y+30); c.closePath(); c.fill()
  for(let row=0;row<9;row++) { const inset=(8-row)*w/19; box(c,x+inset,y-32+row*7,w-inset*2,6,color); for(let col=x+inset+10;col<x+w-inset;col+=17) box(c,col,y-32+row*7,2,6,'#513a2c88') }
}
function fence(c,p) {
  for(const y of [p.y,p.y+p.h]) {
    box(c,p.x,y-16,p.w,5,'#997543'); box(c,p.x,y-6,p.w,4,'#755534')
    for(let x=p.x;x<=p.x+p.w;x+=19) { box(c,x,y-25,7,28,'#5b432d'); box(c,x+1,y-24,3,23,'#b28c51') }
  }
  for(const x of [p.x,p.x+p.w]) { box(c,x,p.y,6,p.h,'#705132'); for(let y=p.y;y<p.y+p.h;y+=22) box(c,x-1,y-16,9,20,'#a5824a') }
}
export function drawFarmGround(c) {
  c.strokeStyle='#c1ad76'; c.lineWidth=65; c.lineCap='round'; c.beginPath(); c.moveTo(1480,1790); c.lineTo(1740,1800); c.lineTo(2045,1760); c.lineTo(2050,1810); c.stroke()
  c.strokeStyle='#dcc38a'; c.lineWidth=47; c.stroke()
  // A real bridge crosses the existing river; the northern hedge prevents bypassing the story gate.
  box(c,1730,1740,180,80,'#544633')
  for(let x=1732;x<1910;x+=12) { box(c,x,1745,10,68,'#b29461');box(c,x+2,1747,2,62,'#d1b97e') }
  for(const y of [1735,1815]) { box(c,1725,y,190,6,'#7b6543');for(let x=1730;x<1910;x+=30)box(c,x,y-8,7,18,'#5d4d36') }
  box(c,1895,1525,305,25,'#59664b')
  for(let x=1895;x<2200;x+=16) { box(c,x,1518,14,29,'#77815b');box(c,x+3,1514,10,8,'#93a06d') }
  for(const p of ANIMAL_PENS) {
    box(c,p.x,p.y,p.w,p.h,p.id==='hens'?'#a58e58':'#85875a')
    for(let i=0;i<55;i++) box(c,p.x+8+i*37%(p.w-18),p.y+8+i*23%(p.h-16),4,2,i%2?'#b6aa69':'#646e43')
    fence(c,p)
    box(c,p.x+15,p.y+25,35,16,'#765737'); box(c,p.x+18,p.y+27,29,8,'#699e9b')
  }
  for(const b of FARM_BUILDINGS) {
    const {x,y,w,h}=b; box(c,x+8,y+20,w,h-20,'#40382b'); box(c,x,y+15,w,h-15,b.kind==='barn'?'#98533d':'#b38a50')
    for(let xx=x+5;xx<x+w;xx+=13) { box(c,xx,y+20,2,h-22,'#493c2d88'); box(c,xx+3,y+22,1,h-27,'#efd39444') }
    box(c,x,y+h-9,w,9,'#797568'); roof(c,x,y,w,b.kind==='barn'?'#9a593c':'#917647')
    const door=w*.36; box(c,x+w/2-door/2,y+h-70,door,61,'#41382c')
    for(const xx of [x+w/2-door/2,x+w/2]) { box(c,xx+2,y+h-68,door/2-4,57,'#805337'); c.strokeStyle='#cead76';c.lineWidth=4;c.beginPath();c.moveTo(xx+3,y+h-66);c.lineTo(xx+door/2-3,y+h-14);c.stroke() }
    box(c,x+w/2-14,y+24,28,22,'#372e26');box(c,x+w/2-11,y+27,22,16,'#d5a453');box(c,x+w/2-2,y+25,4,19,'#715034')
    if(b.kind==='coop') { box(c,x+15,y+h-32,20,23,'#302e26');for(let i=0;i<4;i++) box(c,x+15,y+h-9+i*6,22,4,'#b2915c') }
  }
  for(let i=0;i<4;i++) { const x=1910+i*30; box(c,x,1740,26,23,'#c5a351');box(c,x+3,1743,20,2,'#e4c578');box(c,x+10,1740,3,23,'#806039') }
  // Farm tools, cart and feed sacks.
  box(c,2100,1790,56,29,'#9c733d');for(let x=2104;x<2155;x+=11) box(c,x,1793,2,23,'#5a442c')
  for(const x of [2105,2145]) { box(c,x,1816,8,12,'#3d392d');box(c,x+2,1818,4,8,'#907649') }
  box(c,2155,1798,24,4,'#bc9555')
  for(const [x,y] of TORO_LIGHTS) {
    box(c,x-13,y-5,26,7,'#606b5b');box(c,x-7,y-44,14,39,'#89937b');box(c,x-13,y-62,26,20,'#56614f');box(c,x-8,y-58,16,12,'#f3d28a');box(c,x-2,y-60,4,17,'#687057')
    box(c,x-18,y-66,36,5,'#626f5d');box(c,x-13,y-71,26,5,'#909a7d');box(c,x-7,y-76,14,5,'#b0b598')
  }
}
export function drawFarmActivity(c,state,time) {
  for(const [x,y] of TORO_LIGHTS) {
    const glow=c.createRadialGradient(x,y-50,2,x,y-50,50);glow.addColorStop(0,'#ffcf6844');glow.addColorStop(1,'#ffc86400');c.fillStyle=glow;c.fillRect(x-50,y-100,100,100)
  }
  const g=state.garden
  for(let i=0;i<4;i++) { const x=908+i*12;box(c,x,1983,9,27,'#594b32');if(g.stage!=='empty') { const h=g.stage==='ready'?13:4+g.elapsed/3;box(c,x+3,1997-h,3,h,'#7aa052');box(c,x,1997-h,9,4,'#9aad60');if(g.stage==='ready')box(c,x+3,1998,4,6,'#d79449') } }
  c.textAlign='center';c.font='10px Georgia';c.fillStyle='#f0dfac';c.fillText(g.stage==='ready'?'E · COLHER':g.stage==='growing'?'HORTA · CRESCENDO':'E · CULTIVAR',GARDEN.x,GARDEN.y-20)
  if(g.stage==='ready')box(c,GARDEN.x+Math.sin(time/300)*10,1970,3,3,'#ffe7a2')
}
