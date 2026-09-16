import { moveRuinActor } from './ruinMovement.js'
export const ROCK_WINDUP = .9
export const GIANT_PUNCH_WINDUP = .45
export function createGiantAttack() {
  return { attackMode:'ranged', throwsRemaining:2, meleeSwings:0, chaseTime:0,
    meleeWindup:0, punch:0, punchSide:1, punchAim:{x:0,y:1} }
}
export function updateGiantAttack(s,p,dt,valid) {
  s.punch=Math.max(0,s.punch-dt)
  const dx=p.x-s.boss.x,dy=p.y-s.boss.y,d=Math.max(1,Math.hypot(dx,dy))
  if(s.windup>0) {
    s.windup=Math.max(0,s.windup-dt)
    if(!s.windup) {
      s.impact=.35
      if(Math.hypot(p.x-s.target.x,p.y-s.target.y)<77 && !s.invulnerable) {s.hp--;s.invulnerable=1.1}
      s.throwsRemaining--
      if(s.throwsRemaining>0) s.recovery=.28
      else {s.attackMode='approach';s.recovery=1.2;s.chaseTime=0;s.meleeSwings=0}
    }
    return
  }
  if(s.meleeWindup>0) {
    s.meleeWindup=Math.max(0,s.meleeWindup-dt)
    if(!s.meleeWindup) {
      s.punch=.25;s.meleeSwings++;s.recovery=.65
      if(d<68 && (d<=1 || (dx*s.punchAim.x+dy*s.punchAim.y)/d>.35) && !s.invulnerable) {s.hp--;s.invulnerable=1.1}
      if(s.meleeSwings>=2) {s.attackMode='ranged';s.throwsRemaining=2;s.recovery=1.1}
    }
    return
  }
  s.recovery=Math.max(0,s.recovery-dt)
  if(s.recovery>0) return
  if(s.attackMode==='ranged') {
    s.windup=ROCK_WINDUP;s.target={x:p.x,y:p.y}
  } else {
    s.chaseTime+=dt
    if(d<61) {
      s.meleeWindup=GIANT_PUNCH_WINDUP;s.punchAim={x:dx/d,y:dy/d};s.punchSide=s.meleeSwings%2?-1:1
    } else moveRuinActor(s.boss,dx/d*98*dt,dy/d*98*dt,valid)
    if(s.chaseTime>5) {s.attackMode='ranged';s.throwsRemaining=2;s.recovery=.7}
  }
}
