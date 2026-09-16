import { ANIMAL_PENS, VILLAGER_ROUTES, GARDEN } from './villageLayout.js'

export function createVillagePopulation() {
  return {
    people: VILLAGER_ROUTES.map((p, i) => ({ ...p, x: p.route[0][0], y: p.route[0][1], waypoint: 1, wait: i * .4, phase: i, moving: false, facing: 1 })),
    animals: ['horse','cow','pig','hen','hen'].map((kind, i) => {
      const pen = ANIMAL_PENS[i < 3 ? 0 : 1]
      return { kind, pen, x: pen.x + 30 + (i % 3) * (pen.w - 60) / 2, y: pen.y + Math.min(pen.h - 25, 55 + (i % 2) * 65), phase: i, waypoint: i, moving: false }
    }),
    garden: { stage: 'empty', elapsed: 0, harvests: 0 },
  }
}
export function tendGarden(state) {
  const g = state.garden
  if (g.stage === 'empty') { g.stage = 'growing'; g.elapsed = 0; return 'Você semeia e rega o canteiro. As mudas precisam de 25 segundos de tranquilidade para crescer.' }
  if (g.stage === 'growing') return 'As folhas estão crescendo. Nina pede paciência: volte em alguns instantes para colher.'
  g.stage = 'empty'; g.harvests++
  return `Você colhe uma cesta de verduras para a cozinha comunitária. Colheitas entregues: ${g.harvests}. O canteiro está pronto para novas sementes.`
}
export function villageInteraction(state, player) {
  if (Math.hypot(player.x - GARDEN.x, player.y - GARDEN.y) < 38) return { speaker: 'Horta comunitária', text: tendGarden(state) }
  const npc = state.people.find(p => Math.hypot(p.x - player.x, p.y - player.y) < 45)
  return npc ? { speaker: npc.name, text: npc.text } : null
}
export function updateVillagePopulation(state, delta, player, walkable) {
  const dt = Math.min(delta, .05)
  if (state.garden.stage === 'growing') { state.garden.elapsed += dt; if (state.garden.elapsed >= 25) state.garden.stage = 'ready' }
  for (const p of state.people) {
    p.phase += dt * 7; p.moving = false
    if (Math.hypot(p.x - player.x, p.y - player.y) < 48) continue
    if (p.wait > 0) { p.wait -= dt; continue }
    const [tx, ty] = p.route[p.waypoint]; const dx = tx - p.x; const dy = ty - p.y; const distance = Math.hypot(dx, dy)
    if (distance < 2) { p.waypoint = (p.waypoint + 1) % p.route.length; p.wait = p.role === 'farmer' ? 3.5 : 1.4; continue }
    const step = Math.min(distance, (p.role === 'farmer' ? 28 : 36) * dt)
    const next = { x: p.x + dx / distance * step, y: p.y + dy / distance * step }
    if (walkable(next)) { p.x = next.x; p.y = next.y; p.moving = true; if (Math.abs(dx) > .1) p.facing = Math.sign(dx) }
  }
  for (const a of state.animals) {
    a.phase += dt; const { x, y, w, h } = a.pen
    const corners = [[x+32,y+52],[x+w-32,y+52],[x+w-32,y+h-25],[x+32,y+h-25]]
    const [tx, ty] = corners[a.waypoint % 4]; const d = Math.hypot(tx-a.x,ty-a.y)
    a.moving = Math.sin(a.phase * .7) > -.3
    if (d < 2) a.waypoint++
    else if (a.moving) { const step = Math.min(d, dt * 15); a.facing = Math.sign(tx-a.x) || 1; a.x += (tx-a.x)/d*step; a.y += (ty-a.y)/d*step }
  }
}

const rect = (c,x,y,w,h,color) => { c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),w,h) }
export function drawVillagePerson(c,p) {
  c.save(); c.translate(Math.round(p.x),Math.round(p.y))
  c.fillStyle='#1b2b2855'; c.beginPath(); c.ellipse(0,2,15,5,0,0,Math.PI*2); c.fill()
  const stride=p.moving ? Math.sin(p.phase)*4 : 0
  rect(c,-9,-17,7,18+stride,'#394342'); rect(c,3,-17,7,18-stride,'#394342')
  rect(c,-12,stride,10,4,'#332b23'); rect(c,3,-stride,11,4,'#332b23')
  rect(c,-13,-39,26,24,p.color); rect(c,-5,-38,10,22,'#dcc9a0')
  rect(c,-10,-37,4,23,'#514331'); rect(c,7,-37,4,23,'#514331')
  rect(c,-18,-35,6,19,'#c68d62'); rect(c,13,-35,6,19,'#c68d62')
  rect(c,-10,-58,21,21,'#d6a477'); rect(c,-11,-61,23,7,'#4e3828')
  rect(c,-5,-49,3,3,'#27302b'); rect(c,5,-49,3,3,'#27302b'); rect(c,-4,-41,10,3,'#855539')
  if(p.role==='farmer') {
    rect(c,-22,-61,44,5,'#b99450'); rect(c,-12,-72,25,11,'#d1b267'); rect(c,-12,-64,25,3,'#795837')
    const work=!p.moving&&p.wait>0 ? Math.sin(p.phase)*9 : 0
    c.save(); c.translate(18,-17); c.rotate(work*.035); rect(c,0,-18,3,36,'#8d673a'); rect(c,-6,15,16,5,'#97a5a1'); c.restore()
    if(work>3) for(let i=0;i<3;i++) rect(c,18+i*5,5-i*3,3,3,'#b59d64')
  } else { rect(c,-12,-62,24,5,'#46564f'); rect(c,-8,-68,17,7,p.color) }
  c.restore()
}
export function drawVillageAnimal(c,a) {
  c.save(); c.translate(Math.round(a.x),Math.round(a.y)); c.scale(a.facing||1,1)
  const hen=a.kind==='hen'; const pig=a.kind==='pig'; const cow=a.kind==='cow'
  const color=hen?'#eadfc0':pig?'#d49a89':cow?'#e0d6b6':'#95603e'
  const w=hen?15:pig?32:40; const h=hen?15:pig?20:26
  rect(c,-w/2,-h,w,h,color); rect(c,w/2-5,-h-9,hen?11:16,hen?13:20,color)
  const step=a.moving?Math.sin(a.phase*9)*3:0
  for(const x of [-w/2+3,w/2-7]) rect(c,x,-2,hen?2:5,8+(x<0?step:-step),hen?'#bb8f42':'#4c3c32')
  rect(c,w/2+3,-h-4,3,3,'#242a25')
  if(hen) { rect(c,w/2,-h-13,6,5,'#b9553e'); rect(c,w/2+6,-h+1,6,3,'#d8a452') }
  else { rect(c,w/2-3,-h-15,5,8,color); rect(c,-w/2-7,-h+3,8,3,color) }
  if(cow) { rect(c,-12,-h+2,13,13,'#63574a'); rect(c,5,-h+8,9,10,'#63574a'); rect(c,w/2+5,-h+4,8,6,'#d2a894') }
  if(pig) rect(c,w/2+6,-h+2,9,7,'#b87670')
  if(a.kind==='horse') { rect(c,w/2-7,-h-10,5,18,'#44362b'); rect(c,-w/2-6,-h+1,5,19,'#44362b') }
  c.restore()
}
