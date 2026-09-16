import { moveRuinActor, separateRuinActors } from './ruinMovement.js'
import { GOLEM_DEATH_DURATION, preloadGolemDeath, drawGolemDeath } from './golemDeath.js'
import { preloadMiniDeath, updateMiniDeaths, drawMiniDeath } from './miniGolemDeath.js'
export const SPLIT_DURATION = GOLEM_DEATH_DURATION
export const FRAGMENT_SPACING = 80
let fragmentSprite
export function preloadFragmentSprite() {
  preloadGolemDeath()
  preloadMiniDeath()
  const image=new Image(); image.onload=()=>{fragmentSprite=image}; image.src='/assets/golem-musgo.png'
}
export function beginSplit(s, valid) {
  s.phase='splitting'; s.splitTime=SPLIT_DURATION; s.bossHp=0; s.windup=0; s.impact=0; s.target=null; s.bolts=[]
  s.debris=Array.from({length:36},(_,i)=>{
    const order=(i*13)%36, angle=i*2.399
    return { col:i%6,row:Math.floor(i/6),release:order<26 ? .35+2.75*Math.sqrt(order/26) : 3.15,
      x:s.boss.x+Math.cos(angle)*(22+i%7*7),y:s.boss.y+Math.sin(angle)*(12+i%5*5),rotation:Math.sin(i)*1.4 }
  })
  s.fragments=[-1,1].map((side)=>{
    let position={...s.boss}
    for(let i=1;i<=48;i++) {
      const next={x:s.boss.x+side*i,y:s.boss.y}
      if(!valid(next)) break
      position=next
    }
    return {...position,hp:4,windup:0,cooldown:.65,step:0,punch:0,attackCount:0,attackKind:'punch',aim:{x:0,y:1},slam:0,moving:false}
  })
}
export function updateFragments(s,p,dt,valid) {
  if(s.phase==='splitting') {
    s.splitTime=Math.max(0,s.splitTime-dt)
    if(!s.splitTime) s.phase='fragments'
    return
  }
  updateMiniDeaths(s.fragments,dt)
  for(const f of s.fragments.filter(f=>f.hp>0)) {
    f.cooldown=Math.max(0,f.cooldown-dt); f.punch=Math.max(0,f.punch-dt); f.slam=Math.max(0,f.slam-dt); f.moving=false
    const dx=p.x-f.x,dy=p.y-f.y,d=Math.max(1,Math.hypot(dx,dy))
    if(f.windup>0) {
      f.windup=Math.max(0,f.windup-dt)
      if(!f.windup) {
        f.punch=.22; f.cooldown=1.2
        if(f.attackKind==='slam') { f.slam=.4; s.quake=.35 }
        const reach=f.attackKind==='slam'?72:48
        const facing=d<=1 || f.attackKind==='slam' || (dx*f.aim.x+dy*f.aim.y)/d>.3
        if(d<reach && facing && !s.invulnerable) { s.hp--; s.invulnerable=1.1 }
      }
    } else if(d<66 && !f.cooldown) {
      f.attackKind=f.attackCount++%2?'slam':'punch'
      f.windup=f.attackKind==='slam'?.7:.32
      f.aim={x:dx/d,y:dy/d}
    }
    else if(d>34) {
      const before={x:f.x,y:f.y}
      moveRuinActor(f,dx/d*82*dt,dy/d*82*dt,valid,s.fragments,FRAGMENT_SPACING)
      f.moving=Math.hypot(f.x-before.x,f.y-before.y)>.001
      if(f.moving) f.step+=dt*10
    }
  }
  separateRuinActors(s.fragments,FRAGMENT_SPACING,valid)
}
export function drawGiantDebris(c,s,sprite) {
  if(!sprite || !s.debris || s.phase==='splitting') return
  c.save(); c.imageSmoothingEnabled=false
  for(const stone of s.debris) {
    c.save(); c.translate(stone.x,stone.y); c.rotate(stone.rotation)
    c.drawImage(sprite,stone.col*sprite.width/6,stone.row*sprite.height/6,sprite.width/6,sprite.height/6,-10,-4,20,10)
    c.restore()
  }
  c.restore()
}
export function drawFragments(c,s,sprite) {
  if(!sprite) return
  c.save(); c.imageSmoothingEnabled=false
  if(s.phase==='splitting') {
    if(drawGolemDeath(c,s)) { c.restore(); return }
    const age=SPLIT_DURATION-s.splitTime
    for(const stone of s.debris) {
      const t=Math.min(1,Math.max(0,(age-stone.release)/.8))
      const startX=s.boss.x-65+(stone.col+.5)*130/6, startY=s.boss.y-121+(stone.row+.5)*22
      c.save(); c.translate(startX+(stone.x-startX)*t,startY+(stone.y-startY)*t-Math.sin(t*Math.PI)*35)
      c.rotate(stone.rotation*t)
      const shardWidth=130/6+(20-130/6)*t
      c.drawImage(sprite,stone.col*sprite.width/6,stone.row*sprite.height/6,sprite.width/6,sprite.height/6,-shardWidth/2,-11+7*t,shardWidth,22-12*t)
      if(age<stone.release && age>stone.release-.5 && stone.col>1 && stone.col<4) {
        c.strokeStyle=`rgba(229,214,163,${1-(stone.release-age)/.5})`; c.lineWidth=1
        c.beginPath(); c.moveTo(-4,-8); c.lineTo(2,-2); c.lineTo(-2,6); c.stroke()
      }
      c.restore()
      if(t>0 && t<1) {
        c.globalAlpha=(1-t)*.5; c.fillStyle='#c0b39a'
        c.beginPath(); c.ellipse(startX+(stone.x-startX)*t,stone.y,4+t*13,2+t*5,0,0,Math.PI*2); c.fill(); c.globalAlpha=1
      }
    }
    if(age>3.15) {
      const burst=(age-3.15)/.85
      c.globalAlpha=(1-burst)*.65; c.strokeStyle='#e4d3aa'; c.lineWidth=5
      c.beginPath(); c.ellipse(s.boss.x,s.boss.y-25,20+burst*92,12+burst*44,0,0,Math.PI*2); c.stroke(); c.globalAlpha=1
      for(let i=0;i<32;i++) {
        const angle=i*2.399,r=burst*(35+i%7*12)
        const x=s.boss.x+Math.cos(angle)*r,y=s.boss.y-35+Math.sin(angle)*r*.55-Math.sin(burst*Math.PI)*30
        c.globalAlpha=1-burst; c.fillStyle=i%3?'#878872':'#d8c9a0'
        c.save(); c.translate(x,y); c.rotate(angle+burst*4)
        c.fillRect(-2,-2,3+i%4,3+i%3); c.restore()
      }
      c.globalAlpha=(1-burst)*.25; c.fillStyle='#d3c4a5'; c.beginPath(); c.ellipse(s.boss.x,s.boss.y-18,30+burst*88,12+burst*35,0,0,Math.PI*2); c.fill(); c.globalAlpha=1
    }
  } else for(const f of s.fragments) {
    if(f.hp<=0) { drawMiniDeath(c,f,fragmentSprite || sprite); continue }
    const bob=f.moving?Math.sin(f.step)*1.5:0
    const art=fragmentSprite || sprite
    if(f.attackKind==='slam' && (f.windup || f.slam)) {
      c.fillStyle=f.slam?'#ead6a444':'#daa75d22'; c.strokeStyle='#dab36e'; c.lineWidth=2
      c.beginPath(); c.ellipse(f.x,f.y,72,72,0,0,Math.PI*2); c.fill(); c.stroke()
    }
    // Articulate the original arm regions without duplicating the static arms.
    const part=(sx,sw,pivotX,angle)=>{
      c.save(); c.translate(f.x+pivotX,f.y-43+bob); c.rotate(angle)
      c.drawImage(art,sx*art.width,art.height*.25,sw*art.width,art.height*.5,-40+sx*80-pivotX,-25+73*.25,sw*80,73*.5); c.restore()
    }
    const prep=f.windup ? 1-f.windup/(f.attackKind==='slam'?.7:.32) : 0
    const swing=f.punch ? -Math.sin(f.punch/.22*Math.PI)*.85 : prep*1.8
    const walk=f.moving?Math.sin(f.step)*.12:0
    c.save(); c.beginPath(); c.rect(f.x-40,f.y-68+bob,80,73)
    c.rect(f.x-40,f.y-68+bob+73*.25,20,73*.5); c.rect(f.x+20,f.y-68+bob+73*.25,20,73*.5)
    c.clip('evenodd'); c.drawImage(art,f.x-40,f.y-68+bob,80,73); c.restore()
    part(0,.25,-22,f.attackKind==='slam'?swing:swing*(f.aim.x<0?1:.25)+walk)
    part(.75,.25,22,f.attackKind==='slam'?-swing:-swing*(f.aim.x>=0?1:.25)-walk)
    c.fillStyle='#222e29'; c.fillRect(f.x-23,f.y-78,46,5)
    c.fillStyle='#c9aa72'; c.fillRect(f.x-22,f.y-77,44*f.hp/4,3)
    if(f.windup || f.punch) {
      c.fillStyle='#e0c98d'
      if(f.windup) { c.font='bold 14px monospace'; c.fillText('!',f.x,f.y-84) }
      if(f.punch && f.attackKind==='punch') {
        c.strokeStyle='#e0c98d'; c.lineWidth=2; c.beginPath(); c.moveTo(f.x+f.aim.x*23,f.y-15+f.aim.y*23); c.lineTo(f.x+f.aim.x*43,f.y-15+f.aim.y*43); c.stroke()
      }
    }
  }
  c.restore()
}
