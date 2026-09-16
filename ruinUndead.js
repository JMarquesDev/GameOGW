import { moveRuinActor, separateRuinActors } from './ruinMovement.js'
import { preloadZombieWalks, updateZombieWalk, drawZombieWalk } from './zombieWalk.js'

export const ZOMBIE_TYPES = [
  { id:'crawler', path:'/assets/zombie-crawler.png', speed:27, hp:2, width:66, height:46, mouth:[.285,.40,.21,.20] },
  { id:'shambler', path:'/assets/zombie-shambler.png', speed:36, hp:3, width:48, height:61, mouth:[.28,.36,.27,.09] },
  { id:'withered', path:'/assets/zombie-withered.png', speed:31, hp:2, width:45, height:64, mouth:[.095,.34,.36,.14] },
]
export const EMERGE_SECONDS=1.6
export const SECOND_WAVE_DELAY=6
const images={}
export function preloadUndeadSprites() {
  preloadZombieWalks()
  for(const type of ZOMBIE_TYPES) {
    const image=new Image(); image.onload=()=>{images[type.id]=image}; image.src=type.path
  }
}
export function beginUndeadPrelude(s) {
  s.phase='tremor'; s.tremorTime=2.4; s.zombies=[]; s.wave=0; s.waveTime=0
  s.bolts=[]; s.event='tremor'
}
export function spawnUndeadWave(s,p,valid) {
  const points=[[1288,335],[1518,335],[1395,565],[1288,530],[1535,510],[1395,300]]
  const offset=s.wave===0?0:3
  for(let i=0;i<3;i++) {
    const type=ZOMBIE_TYPES[i]
    const options=points.map((_,j)=>points[(j+i+offset)%points.length])
    const spot=options.find(([x,y])=>valid({x,y}) && Math.hypot(x-p.x,y-p.y)>75 && s.zombies.every(z=>z.hp<=0 || Math.hypot(x-z.x,y-z.y)>45))
      || options.find(([x,y])=>valid({x,y}) && s.zombies.every(z=>z.hp<=0 || Math.hypot(x-z.x,y-z.y)>35))
    if(!spot) continue
    s.zombies.push({x:spot[0],y:spot[1],type:i,hp:type.hp,emerge:EMERGE_SECONDS,clock:i*.7,cooldown:.6,windup:0,origin:{x:spot[0],y:spot[1]}})
  }
  s.wave++; s.waveTime=0
}
export function updateUndead(s,p,dt,valid) {
  if(s.phase==='tremor') {
    s.tremorTime=Math.max(0,s.tremorTime-dt)
    if(!s.tremorTime) { s.phase='undead'; spawnUndeadWave(s,p,valid) }
    return
  }
  s.waveTime+=dt
  // Reinforcements do not wait for a cleared wave: first kill OR six seconds.
  if(s.wave===1 && (s.waveTime>=SECOND_WAVE_DELAY || s.zombies.some(z=>z.hp<=0))) spawnUndeadWave(s,p,valid)
  for(const z of s.zombies.filter(z=>z.hp>0)) {
    const before={x:z.x,y:z.y}
    z.walking=false
    z.clock+=dt; z.cooldown=Math.max(0,z.cooldown-dt)
    if(z.emerge>0) { z.emerge=Math.max(0,z.emerge-dt); continue }
    const dx=p.x-z.x,dy=p.y-z.y,d=Math.max(1,Math.hypot(dx,dy))
    if(z.windup>0) {
      z.windup=Math.max(0,z.windup-dt)
      if(!z.windup) {
        z.cooldown=1.3
        if(d<36 && !s.invulnerable) { s.hp--; s.invulnerable=1.1 }
      }
    } else if(d<32 && !z.cooldown) z.windup=.45
    else if(d>25) {
      const speed=ZOMBIE_TYPES[z.type].speed*(.5+.5*Math.max(0,Math.sin(z.clock*4)))
      moveRuinActor(z,dx/d*speed*dt,dy/d*speed*dt,valid,s.zombies,34)
    }
    updateZombieWalk(z,before,dt)
  }
  separateRuinActors(s.zombies,34,valid)
  if(s.wave===2 && s.zombies.length===6 && s.zombies.every(z=>z.hp<=0)) {
    s.active=false; s.won=true; s.bolts=[]; s.event='won'
  }
}
// Ground marks are scenery, independent of whether the encounter is active.
export function drawUndeadHoles(c,s) {
  c.save()
  for(const z of s.zombies || []) {
    c.fillStyle='#302a22'; c.beginPath(); c.ellipse(z.origin.x,z.origin.y,23,9,0,0,Math.PI*2); c.fill()
    c.strokeStyle='#877c60'; c.lineWidth=2; c.stroke()
  }
  c.restore()
}
export function drawUndead(c,s) {
  if(s.phase!=='undead') return
  c.save(); c.imageSmoothingEnabled=false
  for(const z of [...s.zombies].sort((a,b)=>a.y-b.y)) {
    const type=ZOMBIE_TYPES[z.type],image=images[type.id]
    if(z.hp<=0 || !image) continue
    const rise=1-z.emerge/EMERGE_SECONDS, bob=Math.sin(z.clock*4)*1.8
    const x=z.x-type.width/2, y=z.y-type.height*rise+bob
    c.save(); c.beginPath(); c.rect(z.x-50,z.y-type.height-6,100,type.height+6); c.clip()
    const animated=drawZombieWalk(c,z,type)
    if(!animated) {
    c.drawImage(image,x,y,type.width,type.height)
    // Replace only the mouth interior; oscillating jaws leave head and body intact.
    const [mx,my,mw,mh]=type.mouth, open=.22+.78*(.5+.5*Math.sin(z.clock*5))
    c.fillStyle=['#258858','#8b85b1','#b74979'][z.type]; c.fillRect(x+mx*type.width,y+my*type.height,mw*type.width,mh*type.height)
    const jawH=mh*type.height*open, mouthY=y+my*type.height
    c.fillStyle='#291d30'; c.fillRect(x+mx*type.width,mouthY,mw*type.width,jawH)
    c.fillStyle='#ddd5ab'
    for(let t=0;t<3;t++) { c.fillRect(x+(mx+mw*(t+.2)/3)*type.width,mouthY,2,2); c.fillRect(x+(mx+mw*(t+.3)/3)*type.width,mouthY+jawH-2,2,2) }
    }
    c.restore()
    if(z.emerge>0) {
      c.fillStyle='#8c7857'
      for(let i=0;i<8;i++) c.fillRect(z.x+Math.cos(i*3)*rise*28,z.y-Math.sin(rise*Math.PI)*10+i%3,4,3)
    } else {
      c.fillStyle='#24312b'; c.fillRect(z.x-17,z.y-type.height-9,34,4)
      c.fillStyle='#a7b775'; c.fillRect(z.x-16,z.y-type.height-8,32*z.hp/type.hp,2)
      if(z.windup) { c.fillStyle='#f0c98a'; c.font='bold 12px monospace'; c.fillText('!',z.x,z.y-type.height-13) }
    }
  }
  c.restore()
}
