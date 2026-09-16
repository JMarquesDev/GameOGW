const box = (c,x,y,w,h,color) => { c.fillStyle=color; c.fillRect(x,y,w,h) }
function polygon(c, points, color) {
  c.fillStyle=color; c.beginPath()
  points.forEach(([x,y],i)=>i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.fill()
}
export const FALLS_BOUNDS = { left: 1190, right: 1650, top: 0, bottom: 165 }
export function drawRuinsWaterfall(c,time=0) {
  c.save()
  // Wide, layered cliff behind the sanctuary, never across the combat floor.
  box(c,1190,0,460,165,'#293e3e')
  for(let i=0;i<75;i++) {
    const x=1190+(i*71)%450, y=(i*37)%158
    box(c,x,y,14+i%4*7,16+i%3*7,['#354a49','#455857','#526260','#243938'][i%4])
    if(i%3===0) box(c,x,y,16,4,'#63796a')
  }
  box(c,1270,0,295,159,'#438c95')
  box(c,1292,0,249,151,'#80cccb')
  for(let i=0;i<37;i++) {
    const x=1274+i*8, width=3+i%3
    box(c,x,0,width,151,['#b2e6dc','#65b6bf','#91d9d3','#d0eee1'][i%4])
    for(let j=0;j<4;j++) {
      const y=((time*.12+i*17+j*47)%190)-30
      if(y>=0 && y<142) box(c,x,y,width+2,Math.min(142-y,8+i%5*3),'#e0f7e8')
    }
  }
  for(let i=0;i<44;i++) {
    const x=1250+i*7, y=141+Math.sin(i*1.7+time/190)*5
    box(c,x,y,14,7+i%4*3,i%2?'#c6eee2':'#edf8e8')
    const spray=(time*.05+i*13)%30
    box(c,x+Math.sin(i)*8,143-spray,3,3,`rgba(220,248,235,${1-spray/30})`)
  }
  // Moss shelves and ferns frame the water rather than obstruct it.
  for(const x of [1194,1220,1580,1612]) for(let j=0;j<5;j++) {
    const y=j*31
    box(c,x,y,27,7,'#60794c'); box(c,x+4,y+5,6,14,'#405f43')
    box(c,x+16,y+3,4,10,'#91a26b')
  }
  c.restore()
}
export function drawRuneStone(c) {
  c.save(); c.translate(1339,164)
  polygon(c,[[0,98],[5,75],[11,70],[14,42],[20,22],[38,10],[48,0],[64,0],[74,10],[87,22],[93,52],[101,70],[105,98]],'#493d2e')
  polygon(c,[[5,94],[12,72],[19,44],[23,25],[43,12],[50,4],[62,4],[82,25],[87,53],[96,76],[99,94]],'#817969')
  polygon(c,[[23,25],[43,12],[50,4],[62,4],[82,25],[66,38],[47,29]],'#a29883')
  polygon(c,[[5,94],[16,75],[37,60],[46,72],[66,84],[99,79],[99,94]],'#5e574a')
  polygon(c,[[24,39],[39,28],[48,36],[38,52],[32,72],[20,80]],'#928977')
  // Squared cyan spiral mirrors the supplied runestone reference.
  c.strokeStyle='#31c5dc'; c.lineWidth=6; c.lineJoin='miter'
  c.beginPath(); c.moveTo(68,68); c.lineTo(52,70); c.lineTo(39,61); c.lineTo(37,44)
  c.lineTo(44,33); c.lineTo(61,30); c.lineTo(73,39); c.lineTo(74,52)
  c.lineTo(60,56); c.lineTo(54,50); c.lineTo(54,44); c.stroke()
  c.restore()
}
