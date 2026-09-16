import { ROCK_WINDUP, GIANT_PUNCH_WINDUP } from './giantCombat.js'
const smooth = t => { const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v) }
export function giantStep(phase) {
  const index=Math.floor((((phase%(Math.PI*2))+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*8)
  return [0,1,1,0,0,-1,-1,0][index]
}
// Windup and release use the same clock as collision/damage.
export function golemPose(s) {
  const attack = s.windup > 0 ? 1 - s.windup / ROCK_WINDUP : 0
  const lift = s.windup > 0 ? smooth(attack / .6) : 0
  const flight = s.windup > 0 ? Math.max(0, (attack - .6) / .4) : 0
  const meleeProgress=s.meleeWindup>0?1-s.meleeWindup/GIANT_PUNCH_WINDUP:0
  const extension=smooth((meleeProgress-.65)/.35)
  const punchPrep=s.meleeWindup>0?smooth(meleeProgress/.65)*(1-extension):0
  const punch=s.meleeWindup>0?extension:s.punch>0?1-smooth(1-s.punch/.25):0
  return { step: s.walking ? giantStep(s.walkPhase) : 0, lift, flight, punchPrep, punch }
}

function rock(c, x, y, radius, rotation = 0) {
  c.save(); c.translate(x, y); c.rotate(rotation)
  c.fillStyle = '#787567'; c.strokeStyle = '#242923'; c.lineWidth = 3
  c.beginPath(); c.moveTo(-radius, -radius * .4); c.lineTo(-radius * .4, -radius)
  c.lineTo(radius * .6, -radius * .8); c.lineTo(radius, radius * .3)
  c.lineTo(radius * .3, radius); c.lineTo(-radius * .8, radius * .6); c.closePath(); c.fill(); c.stroke()
  c.fillStyle = '#b4af91'; c.fillRect(-radius * .5, -radius * .55, radius * .7, radius * .3)
  c.restore()
}

export function drawGolem(c, s, sprite) {
  const { step, lift, flight, punchPrep, punch } = golemPose(s)
  const x = Math.round(s.boss.x) - 65, y = Math.round(s.boss.y) - 121
  const w = 130, h = 132
  // Non-overlapping regions preserve the source artwork without duplicate limbs.
  const part = (points, px, py, angle = 0, dy = 0, dx = 0) => {
    c.save(); c.translate(x + px * w + dx, y + py * h + dy); c.rotate(angle)
    c.translate(-px * w, -py * h); c.beginPath()
    points.forEach(([u, v], i) => i ? c.lineTo(u * w, v * h) : c.moveTo(u * w, v * h))
    c.closePath(); c.clip(); c.drawImage(sprite, 0, 0, w, h); c.restore()
  }
  c.save(); c.imageSmoothingEnabled = false
  part([[.28,.6],[.5,.6],[.5,1],[.20,1],[.20,.76],[.28,.68]], .4,.62, 0, -Math.max(0,step) * 7,step*2)
  part([[.5,.6],[.74,.6],[.74,.76],[.8,.76],[.8,1],[.5,1]], .62,.62, 0, -Math.max(0,-step) * 7,-step*2)
  part([[.28,0],[.74,0],[.74,.6],[.28,.6]], .5,.5, 0, s.walking?(step? -2:2):0,step*2)
  const load = flight > 0 ? 1-smooth(flight) : lift
  const arm=(side)=>{
    const left=side<0, shoulderX=left?.26:.75, elbowX=left?.18:.82
    const active=s.punchSide===side
    const shoulder=side*(load*.22+(active?punchPrep*.24-punch*.18:0))+step*.07*side
    const elbow=side*(load*1.3+(active?punchPrep*.75-punch*.2:0))
    const upper=left?[[0,0],[.28,0],[.28,.43],[0,.43]]:[[.74,0],[1,0],[1,.43],[.74,.43]]
    const lower=left?[[0,.43],[.28,.43],[.28,.68],[.20,.76],[.20,1],[0,1]]:[[.74,.43],[1,.43],[1,1],[.8,1],[.8,.76],[.74,.76]]
    c.save(); c.translate(x+shoulderX*w,y+.27*h);c.rotate(shoulder);c.translate(-x-shoulderX*w,-y-.27*h)
    part(upper,shoulderX,.27)
    // Elbow cap bridges the two rigid stone sections while the forearm bends.
    c.fillStyle='#56564b';c.beginPath();c.ellipse(x+elbowX*w,y+.43*h,6,7,0,0,Math.PI*2);c.fill()
    const reach=active?punch*46:0
    const reachX=(s.punchAim?.x||0)*reach,reachY=(s.punchAim?.y||0)*reach
    if(reach>0) {
      // The forearm travels toward the locked aim, joined by overlapping stone plates.
      c.strokeStyle='#383a32';c.lineWidth=13;c.beginPath();c.moveTo(x+elbowX*w,y+.43*h)
      c.lineTo(x+elbowX*w+reachX,y+.43*h+reachY);c.stroke()
      c.strokeStyle='#8b8875';c.lineWidth=8;c.stroke()
    }
    part(lower,elbowX,.43,elbow,reachY,reachX)
    c.restore()
  }
  arm(-1);arm(1)
  if (s.windup > 0) {
    const start = { x: s.boss.x, y: s.boss.y - 82 }
    if (flight > 0 && s.target) {
      rock(c, start.x + (s.target.x - start.x) * flight,
        start.y + (s.target.y - start.y) * flight - Math.sin(flight * Math.PI) * 55, 15, flight * 4)
    } else rock(c, s.boss.x, s.boss.y - 35 - lift * 47, 15)
  }
  if(s.meleeWindup || s.punch) {
    c.strokeStyle=s.punch?'#f0d5a0':'#cbb37c88'; c.lineWidth=s.punch?3:2
    c.beginPath();c.moveTo(s.boss.x+s.punchAim.x*28,s.boss.y-18+s.punchAim.y*28)
    c.lineTo(s.boss.x+s.punchAim.x*(44+punch*22),s.boss.y-18+s.punchAim.y*(44+punch*22));c.stroke()
  }
  if (s.impact > 0 && s.target) {
    const age = 1 - s.impact / .35
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3
      rock(c, s.target.x + Math.cos(a) * age * 55, s.target.y + Math.sin(a) * age * 35 - Math.sin(age * Math.PI) * 18, 4)
    }
  }
  c.restore()
}
