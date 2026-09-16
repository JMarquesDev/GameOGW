// Code-native artwork: the existing footprint and the south approach stay unchanged.
const rect = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h) }
function shape(c, points, color, border) {
  c.beginPath(); points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath()
  c.fillStyle=color; c.fill(); if(border) { c.strokeStyle=border; c.lineWidth=2; c.stroke() }
}
function line(c, points, color, width=1) {
  c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke()
}
function oval(c,x,y,rx,ry,color) { c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill() }
function foliage(c,x,y,seed=0) {
  for(let i=0;i<12;i++) {
    const px=x+Math.sin(i*4.7+seed)*13,py=y-Math.abs(Math.cos(i*2.3))*17
    rect(c,px,py,6,5,i%3===0?'#b0bf60':i%3===1?'#6e9143':'#3e6638')
    if(i%5===0)rect(c,px+2,py-2,3,3,seed%2?'#d8bd78':'#cab3ca')
  }
}
function pot(c,x,y,seed) {
  oval(c,x+4,y+3,13,4,'#20352655')
  shape(c,[[x-10,y-16],[x+10,y-16],[x+7,y],[x-7,y]],'#9f6041','#513d2a')
  rect(c,x-11,y-18,22,5,'#c88b58');rect(c,x-5,y-10,3,7,'#d09a6655');foliage(c,x,y-16,seed)
}
function tiledRoof(c,points,bounds) {
  shape(c,points,'#4c3228','#2c2e25')
  c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip()
  const [left,top,right,bottom]=bounds
  const palette=['#ae5b29','#c77531','#d88d3d','#b6692d']
  for(let row=0,y=top;y<bottom;y+=10,row++)for(let col=0,x=left-(row%2)*10;x<right;x+=20,col++) {
    rect(c,x,y,19,9,palette[(row+col)%4]);rect(c,x+1,y+1,17,2,'#efb15a');rect(c,x+2,y+8,17,2,'#69432a');rect(c,x+17,y+3,2,4,'#8f4f28')
  }
  c.restore()
}
function windowFrame(c,x) {
  rect(c,x-14,143,28,34,'#3e3528');rect(c,x-10,147,20,26,'#e9ac4d')
  rect(c,x-8,148,7,11,'#ffe0a0');rect(c,x+2,161,6,10,'#f6cc75')
  rect(c,x-1,146,3,28,'#77512e');rect(c,x-10,159,20,3,'#77512e')
  for(const dx of [-23,16]) { rect(c,x+dx,143,8,33,'#634b2c');for(let y=146;y<174;y+=6)rect(c,x+dx+1,y,6,2,'#a67b40') }
  rect(c,x-17,177,34,4,'#d2aa62');rect(c,x-14,187,29,10,'#765332');rect(c,x-14,188,29,2,'#b99452')
  foliage(c,x,188,x)
}
function paintExterior(c) {
  c.save();c.translate(120,100)
  oval(c,194,220,123,32,'#24342455')
  // An irregular stone apron joins the existing dirt path without narrowing it.
  for(let row=0;row<4;row++)for(let col=0;col<3;col++) {
    const x=162+col*18+(row%2)*2,y=243+row*12
    shape(c,[[x,y],[x+16,y-1],[x+15,y+9],[x-1,y+10]],(row+col)%2?'#a3a58a':'#c4bfa0','#73765e')
    rect(c,x+2,y+1,10,2,'#e0d3ab')
  }
  // Raised masonry base and shadowed side, inside the original house footprint.
  shape(c,[[87,116],[116,104],[276,119],[276,232],[102,232],[87,214]],'#454737','#2d3027')
  for(let row=0;row<2;row++)for(let col=0;col<10;col++) {
    const x=105+col*17,y=212+row*9;rect(c,x,y,16,8,(row+col)%3?'#8e9074':'#aeb094');rect(c,x+1,y+1,13,1,'#d0c6a0')
  }
  rect(c,91,118,27,91,'#795232');rect(c,118,118,152,94,'#a87942')
  for(let row=0;row<8;row++) {
    const y=122+row*11;rect(c,120,y,148,9,row%2?'#b68b4e':'#c39a5c')
    line(c,[[122,y+2],[266,y+2]],'#e0ba77');line(c,[[92,y],[115,y-3]],'#3f3326',2)
    for(let i=0;i<5;i++) { const x=122+(i*31+row*13)%137;line(c,[[x,y+5],[x+7,y+5]],'#7c573344');rect(c,x,y+7,2,1,'#795a39') }
  }
  tiledRoof(c,[[69,124],[152,19],[288,117],[268,132],[109,139]],[64,20,292,142])
  line(c,[[70,124],[109,139]],'#4c3528',7);line(c,[[72,122],[109,135]],'#bd8743',2)
  // Front gable, with layered edging, carved braces and a round attic vent.
  shape(c,[[136,121],[198,53],[273,123]],'#c7a067','#593d28')
  for(let y=80;y<120;y+=8)line(c,[[179-(y-80)*.8,y],[224+(y-80)*1.1,y]],'#8c683e',2)
  tiledRoof(c,[[129,122],[196,46],[206,47],[282,123],[273,130],[198,61],[138,130]],[125,45,285,132])
  line(c,[[134,128],[198,56],[277,128]],'#4b3526',5)
  line(c,[[138,124],[198,59],[274,125]],'#e7b364',2)
  oval(c,198,96,12,13,'#75512d');oval(c,198,96,8,9,'#2f3f35')
  for(let x=194;x<=202;x+=4)rect(c,x,89,2,14,'#be9656')
  for(const x of [118,266]) {rect(c,x-3,129,7,85,'#513b28');rect(c,x-1,130,2,80,'#b68d50');rect(c,x-4,203,9,10,'#414431')}
  line(c,[[123,133],[140,145]],'#715030',5);line(c,[[262,133],[248,145]],'#715030',5)
  // Stone chimney and inset cap.
  rect(c,111,16,31,65,'#42493e')
  for(let row=0;row<7;row++)for(let col=0;col<2;col++){const x=113+col*14,y=18+row*9;rect(c,x,y,12,7,(row+col)%3?'#a3a389':'#798572');rect(c,x+1,y+1,9,1,'#d2c6a0')}
  shape(c,[[107,13],[138,9],[147,17],[116,22]],'#c6bb97','#4f5645');shape(c,[[114,14],[136,12],[140,16],[119,18]],'#2b3028')
  windowFrame(c,143);windowFrame(c,241)
  // Heavy plank door keeps the Curandeiro's lily insignia.
  rect(c,175,136,45,79,'#3c3026');rect(c,180,141,35,70,'#825b32')
  for(let x=182;x<214;x+=7){rect(c,x,143,5,66,'#a1733e');rect(c,x+1,144,1,62,'#c69551')}
  rect(c,178,135,43,5,'#d2a365');rect(c,179,151,13,4,'#3d4234');rect(c,179,194,13,4,'#3d4234')
  for(const y of [152,195])rect(c,182,y,2,2,'#aaa37a')
  oval(c,207,182,3,4,'#e7c66d');oval(c,198,164,10,12,'#3d5b44')
  line(c,[[191,165],[198,155],[205,165],[198,172],[191,165]],'#d5bc72',2)
  // Small covered stoop: a clear central stair, balustrades only at the sides.
  rect(c,153,215,82,22,'#644c31');for(let x=155;x<235;x+=10){rect(c,x,215,8,19,'#bd955b');rect(c,x+1,216,6,1,'#ebc780')}
  for(let i=0;i<3;i++){rect(c,169-i*3,236+i*6,49+i*6,6,'#6d5e40');rect(c,169-i*3,236+i*6,49+i*6,3,'#c0ab7a')}
  for(const x of [153,232]) {
    rect(c,x,193,5,47,'#604832');rect(c,x+1,194,2,42,'#c29a5c');rect(c,x-2,190,9,5,'#d0aa65')
    line(c,[[x,212],[x,231]],'#ddbb77',3)
  }
  // Climbing herbs follow the posts, not the door or walking lane.
  line(c,[[117,202],[112,169],[115,137],[131,125]],'#46673b',2)
  for(let i=0;i<10;i++){const x=113+Math.sin(i*2)*6,y=200-i*7;rect(c,x,y,7,4,i%2?'#729348':'#96ac54')}
  pot(c,137,237,1);pot(c,252,233,2)
  // Stacked split logs and a weathered chopping block in the side garden.
  for(let row=0;row<3;row++)for(let col=0;col<3-row;col++) {
    const x=273+col*13+row*6,y=243-row*10;rect(c,x-4,y-8,13,12,'#76502c');oval(c,x+8,y-2,6,6,'#d1b071');oval(c,x+8,y-2,3,3,'#886338');line(c,[[x+5,y-5],[x+10,y+1]],'#765631')
  }
  rect(c,304,242,20,17,'#745631');oval(c,314,242,11,5,'#c2a571');oval(c,314,242,6,2,'#8e713f');line(c,[[314,241],[321,227]],'#ac8a53',3)
  shape(c,[[317,227],[318,220],[329,224],[326,230]],'#8a9990','#465247')
  // Rain barrel with hoops and a little herb drying rack against the side wall.
  rect(c,74,184,25,33,'#8b663b');oval(c,86,184,13,5,'#bc9a61');oval(c,86,184,9,3,'#45736a')
  for(const y of [191,207])rect(c,73,y,27,3,'#515e51')
  for(const x of [55,102])rect(c,x,225,4,38,'#7d5c33')
  line(c,[[54,228],[107,228]],'#c0a676',2)
  for(let i=0;i<4;i++){const x=62+i*12;line(c,[[x,228],[x,236]],'#a99059');foliage(c,x,249,i)}
  // Low boundary fence, flowers and a bed of rounded stepping stones.
  for(let x=49;x<144;x+=29){rect(c,x,269,6,36,'#705332');rect(c,x,269,3,34,'#bc9955')}
  line(c,[[48,278],[140,278]],'#b78e4f',5);line(c,[[48,293],[140,293]],'#715130',5)
  for(const [x,y] of [[50,266],[100,264],[271,265],[326,267]])foliage(c,x,y,x)
  c.restore()
}
let cached
export function drawCabinExterior(c,time=0) {
  if(!cached){cached=document.createElement('canvas');cached.width=560;cached.height=430;paintExterior(cached.getContext('2d'))}
  c.drawImage(cached,0,0)
  c.save()
  // Restrict animation to smoke and warm light; architectural detail is cached.
  for(let i=0;i<5;i++){const p=(time/2800+i/5)%1;oval(c,246+Math.sin(p*4+i)*5+p*15,111-p*50,5+p*11,4+p*7,`rgba(209,215,189,${(1-p)*.15})`)}
  for(const x of [263,361]) {
    const light=c.createRadialGradient(x,260,2,x,260,31);light.addColorStop(0,'#ffd07022');light.addColorStop(1,'#ffd07000');c.fillStyle=light;c.fillRect(x-31,229,62,62)
  }
  // Hanging brass lantern next to the entrance.
  line(c,[[346,242],[350,238],[355,242],[355,248]],'#414636',2)
  rect(c,350,248,10,15,'#4d4a33');rect(c,352,251,6,9,'#f5cf75');rect(c,354,250,1,11,'#9c783d')
  const glow=c.createRadialGradient(355,255,1,355,255,25+Math.sin(time/800)*2);glow.addColorStop(0,'#f9cb6833');glow.addColorStop(1,'#f9cb6800');c.fillStyle=glow;c.fillRect(325,225,60,60)
  c.restore()
}
