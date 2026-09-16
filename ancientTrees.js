// Original canvas artwork: gnarled trunks, exposed roots, ivy and angular leaves.
const poly=(c,p,color)=>{c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
const branch=(c,p,width,color)=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
const rand=n=>{const v=Math.sin(n*127.1+41)*43758.54;return v-Math.floor(v)}
export const ANCIENT_TREE_SCALE = 1.35
// Shared conservative artwork bounds for placement and water clearance.
export function ancientTreeBounds(x, y, radius) {
  const r = radius * ANCIENT_TREE_SCALE
  return { left: x - r * 1.65 - 8, right: x + r * 1.65 + 8,
    top: y - r * 2.1 - 8, bottom: y + r * 1.45 + 8 }
}
function leaves(c,x,y,size,seed) {
  poly(c,[[x-size,y],[x-size*.75,y-size*.7],[x-size*.2,y-size],[x+size*.65,y-size*.75],[x+size,y],[x+size*.6,y+size*.5],[x-size*.6,y+size*.6]],'#183f34')
  for(let i=0;i<32;i++) {
    const px=x+(rand(seed+i*3)-.5)*size*1.8,py=y+(rand(seed+i*7)-.5)*size*1.3
    const w=3+rand(seed+i)*5
    poly(c,[[px-w,py],[px-2,py-4],[px+3,py-2],[px+w,py+1],[px+1,py+5]],['#285741','#397845','#61964b','#98b859'][i%4])
  }
}
export function paintAncientTree(c,x,y,radius,seed) {
  c.save();c.translate(x,y);c.scale(radius*ANCIENT_TREE_SCALE/28,radius*ANCIENT_TREE_SCALE/28)
  const variant=seed%4
  c.fillStyle='#14332755';c.beginPath();c.ellipse(5,29,34,11,0,0,Math.PI*2);c.fill()
  // All variants stay within ancientTreeBounds, including the exposed roots.
  const trunk=variant===1?[[-24,35],[-9,15],[-5,-4],[-13,-19],[-3,-34],[5,-29],[2,-12],[10,0],[5,20],[24,37],[5,31],[-2,24],[-9,34]]:
    [[-24,36],[-10,14],[-7,-8],[0,-27],[10,-39],[14,-31],[8,-13],[7,6],[14,26],[27,36],[10,32],[1,20],[-3,30]]
  poly(c,trunk,'#352d23')
  branch(c,[[-14,29],[-3,12],[0,-5],[4,-21],[10,-33]],9,'#65452f')
  branch(c,[[-9,27],[2,10],[1,-5],[7,-22]],3,'#aa7445')
  branch(c,[[3,12],[9,27],[22,34]],5,'#795033')
  branch(c,[[-4,14],[-16,25],[-29,28]],4,'#4b3627')
  const branches=variant===2?[
    [[0,-12],[-17,-14],[-30,-24]],[[5,-20],[25,-19],[33,-30]]
  ]:[
    [[0,-5],[-17,-21],[-26,-23],[-29,-35]],[[4,-21],[20,-29],[27,-42]],[[5,-19],[30,-11],[34,-22]]
  ]
  for(const points of branches){branch(c,points,6,'#3b3025');branch(c,points,3,'#865735')}
  // Hollow and bark seams remain dark, not a face or a map marker.
  poly(c,[[-3,-1],[3,-8],[7,-2],[5,8],[0,11],[-4,5]],'#292b22')
  branch(c,[[8,13],[5,21],[12,30]],1.5,'#c48b4b')
  branch(c,[[-8,17],[-4,6],[-6,-8]],1,'#342b24')
  if(variant===2){
    leaves(c,-27,-27,9,seed);leaves(c,30,-30,10,seed+8);leaves(c,3,-24,7,seed+17)
  } else if(variant===1){
    leaves(c,-26,-33,11,seed);leaves(c,26,-40,11,seed+14);leaves(c,29,-17,8,seed+5)
  } else {
    for(const [i,[lx,ly,sz]] of [[-21,-29,16],[-7,-38,18],[13,-36,18],[27,-24,13]].entries()) leaves(c,lx,ly,sz,seed+i*17)
  }
  // Hanging vines in the openings between branches.
  for(const vx of [-19,24]) {
    const points=Array.from({length:9},(_,i)=>[vx+Math.sin(i*.9+seed)*3,-23+i*5])
    branch(c,points,1.5,'#59863f')
    for(let i=1;i<8;i+=2){const [px,py]=points[i];poly(c,[[px,py],[px+5,py-2],[px+3,py+4],[px-2,py+5]],'#83a94c')}
  }
  for(let i=0;i<7;i++) {const px=-19+i*6;poly(c,[[px,31],[px-4,23-i%3],[px+1,27],[px+5,21],[px+4,31]],i%2?'#426e3c':'#86a54e')}
  c.restore()
}
