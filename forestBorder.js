import { woodlandTree } from './scenery.js'
import { treeClearOfWater } from './waterClearance.js'
import { ancientTreeBounds } from './ancientTrees.js'

export const BORDER_WORLD={width:2200,height:2100}
export function borderTreeAllowed(x,y,radius) {
  if(!treeClearOfWater(x,y,radius)) return false
  // Keep the eastern gate and farm buildings/pens visually unobstructed.
  if(x>1990 && y>580 && y<880) return false
  const bounds = ancientTreeBounds(x, y, radius)
  if(bounds.right>1870 && bounds.bottom>1470 && bounds.left<2182 && bounds.top<2048) return false
  return true
}
export function buildForestBorder() {
  const trees=[]
  const add=(x,y,row,index)=>{
    const radius=26+(index%3)*3
    if(borderTreeAllowed(x,y,radius)) trees.push({x,y,radius,seed:index*7+row*3})
  }
  for(let row=0;row<3;row++) {
    for(let i=0;i<51;i++) {
      const x=-25+i*45+(row%2)*22
      add(x,-30+row*37,row,i)
      add(x,2180-row*38,row,i+59)
    }
    for(let i=0;i<47;i++) {
      const y=65+i*44+(row%2)*22
      add(-35+row*34,y,row,i+113)
      add(2265-row*34,y,row,i+173)
    }
  }
  return trees.sort((a,b)=>a.y-b.y || a.x-b.x)
}
export const BORDER_TREES=buildForestBorder()
export function forestBorderWalkable(p) {
  return !BORDER_TREES.some(t=>Math.hypot(p.x-t.x,p.y-(t.y+12))<t.radius+12)
}
let borderCache
export function drawForestBorder(c) {
  if(!borderCache) {
    borderCache=document.createElement('canvas');borderCache.width=BORDER_WORLD.width;borderCache.height=BORDER_WORLD.height
    const ctx=borderCache.getContext('2d')
    for(const tree of BORDER_TREES) {
      // Undergrowth ties the layered canopies into a continuous forest edge.
      ctx.fillStyle='#244d35'
      ctx.beginPath();ctx.ellipse(tree.x,tree.y+24,tree.radius*1.2,10,0,0,Math.PI*2);ctx.fill()
      woodlandTree(ctx,tree.x,tree.y,tree.radius,tree.seed)
    }
  }
  c.drawImage(borderCache,0,0)
}
