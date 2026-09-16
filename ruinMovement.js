// Ground-plane spacing is shared by the golems and the undead.
export function moveRuinActor(actor, dx, dy, valid, others = [], spacing = 0) {
  const clear = p => valid(p) && others.every(other => other === actor || other.hp <= 0 ||
    Math.hypot(p.x-other.x,p.y-other.y) >= Math.min(spacing,Math.hypot(actor.x-other.x,actor.y-other.y)-.001))
  const x={x:actor.x+dx,y:actor.y}
  if(clear(x)) actor.x=x.x
  const y={x:actor.x,y:actor.y+dy}
  if(clear(y)) actor.y=y.y
}
export function separateRuinActors(actors, spacing, valid) {
  for(let pass=0;pass<3;pass++) for(let i=0;i<actors.length;i++) for(let j=i+1;j<actors.length;j++) {
    const a=actors[i],b=actors[j]
    if(a.hp<=0 || b.hp<=0) continue
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)
    if(d>=spacing) continue
    const nx=d?dx/d:1,ny=d?dy/d:0,push=(spacing-d)/2+.05
    moveRuinActor(a,-nx*push,-ny*push,valid)
    moveRuinActor(b,nx*push,ny*push,valid)
  }
}
