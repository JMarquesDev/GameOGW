import { drawGolem } from './golemAnimation.js'
import { createGiantAttack, updateGiantAttack } from './giantCombat.js'
import { miniDeathsComplete } from './miniGolemDeath.js'
import { beginSplit, updateFragments, drawFragments } from './ruinFragments.js'
import { beginUndeadPrelude, updateUndead, drawUndead } from './ruinUndead.js'
import { BARRIER_RISE_SECONDS, drawRuinBarrier } from './ruinBarrier.js'
import { drawRuinsWaterfall, drawRuneStone, FALLS_BOUNDS } from './ruinsBackdrop.js'
export const RUIN_ALTAR = { x: 1395, y: 345 }
export const RUIN_START = { x: 1395, y: 535 }
export const inRuinArena = p => p.x >= 1255 && p.x <= 1585 && p.y >= 285 && p.y <= 595
const WALLS = [[1210, 165, 1630, 265], [1210, 260, 1250, 445], [1590, 260, 1630, 445]]
export const ruinsWalkable = p => !(p.x > FALLS_BOUNDS.left - 12 && p.x < FALLS_BOUNDS.right + 12 && p.y < FALLS_BOUNDS.bottom + 12)
  && !WALLS.some(([l, t, r, b]) => p.x > l - 12 && p.x < r + 12 && p.y > t - 8 && p.y < b + 12)
export function createRuinDuel() { return { ...createGiantAttack(), active: false, won: false, hp: 6, bossHp: 12, boss: { x: 1395, y: 385 }, walking: false, walkPhase: 0, cooldown: 0, invulnerable: 0, windup: 0, recovery: 1, target: null, bolts: [], impact: 0, event: null } }
export function awakenRuin(s, p) {
  if (s.active || s.won || Math.hypot(p.x - RUIN_ALTAR.x, p.y - RUIN_ALTAR.y) > 60) return false
  Object.assign(s, createRuinDuel(), { active: true, phase: null, fragments: [], zombies: [], wave: 0, waveTime: 0, tremorTime: 0, quake: 0, debris: [], splitTime: 0, barrierIntro: BARRIER_RISE_SECONDS }); Object.assign(p, RUIN_START, { direction: 'up' }); return true
}
export function castRuinLight(s, p) {
  if (!s.active || s.cooldown > 0 || s.phase === 'splitting' || s.phase === 'tremor') return false
  const candidates = s.phase === 'fragments' ? s.fragments : s.phase === 'undead' ? s.zombies.filter(z=>!z.emerge) : null
  const target = candidates ? candidates.filter(f=>f.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0] : s.boss
  if (!target) return false
  const dx = target.x - p.x; const dy = target.y - p.y; const d = Math.max(1, Math.hypot(dx, dy))
  s.bolts.push({ x: p.x, y: p.y, dx: dx / d, dy: dy / d, life: .85 }); s.cooldown = .46; return true
}
export function updateRuinDuel(s, p, dt, valid) {
  if (!s.active) return
  s.barrierIntro = Math.max(0, (s.barrierIntro || 0) - dt)
  s.quake = Math.max(0, (s.quake || 0) - dt)
  const before = { ...s.boss }
  s.walking = false
  s.cooldown = Math.max(0, s.cooldown - dt); s.invulnerable = Math.max(0, s.invulnerable - dt); s.impact = Math.max(0, s.impact - dt)
  for (const b of s.bolts) {
    for (let i = 0; i < 3 && b.life > 0; i++) {
      b.x += b.dx * 440 * dt / 3; b.y += b.dy * 440 * dt / 3; b.life -= dt / 3
      if (!valid(b)) { b.life = 0; break }
      if(s.phase === 'fragments' || s.phase === 'undead') {
        const targets=s.phase==='fragments'?s.fragments:s.zombies.filter(z=>!z.emerge)
        const hit=targets.find(f=>f.hp>0 && Math.hypot(b.x-f.x,b.y-f.y)<25)
        if(hit) { hit.hp--; b.life=0 }
      } else if (!s.phase && Math.hypot(b.x - s.boss.x, b.y - s.boss.y) < 36) { s.bossHp--; b.life = 0 }
    }
  }
  s.bolts = s.bolts.filter(b => b.life > 0)
  if (s.bossHp <= 0 && !s.phase) beginSplit(s, point=>inRuinArena(point) && valid(point))
  if (s.phase === 'tremor' || s.phase === 'undead') {
    updateUndead(s,p,dt,point=>inRuinArena(point) && valid(point))
  } else if (s.phase) {
    updateFragments(s,p,dt,point=>inRuinArena(point) && valid(point))
    if (s.phase === 'fragments' && miniDeathsComplete(s.fragments)) beginUndeadPrelude(s)
  } else updateGiantAttack(s,p,dt,point=>inRuinArena(point) && valid(point))
  const distance = Math.hypot(s.boss.x - before.x, s.boss.y - before.y)
  s.walking = distance > .001
  s.walkPhase = s.walking ? (s.walkPhase + distance * .16) % (Math.PI * 2) : 0
  if (s.hp <= 0) { s.active = false; s.bolts = []; s.event = 'lost'; Object.assign(p, { x: 1395, y: 590, direction: 'up' }) }
}
const box = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h) }
function masonry(c, x, y, w, h) {
  box(c, x, y, w, h, '#343e37')
  for (let yy = 0; yy < h; yy += 22) for (let xx = 0; xx < w; xx += 34) {
    const bw = Math.min(32, w - xx - 2); const bh = Math.min(20, h - yy - 2)
    box(c, x + xx + 1, y + yy + 1, bw, bh, (xx + yy) % 3 ? '#808875' : '#697768'); box(c, x + xx + 3, y + yy + 2, Math.max(1, bw - 4), 2, '#b3b499')
    if ((xx + yy) % 4 === 0) { box(c, x + xx + 5, y + yy + 14, 13, 4, '#587544'); box(c, x + xx + 12, y + yy + 5, 2, 10, '#465847') }
  }
}
let cache
function paintRuins(c) {
  // Courtyard remains unobstructed for dodging; major stone footprints match WALLS.
  masonry(c, 1210, 265, 420, 320)
  for (let i = 0; i < 80; i++) {
    const x = 1220 + i * 73 % 400; const y = 280 + i * 47 % 295
    if (i % 3 === 0) { box(c, x, y, 9, 2, '#3f5843'); box(c, x + 8, y - 6, 2, 8, '#435845') }
    else box(c, x, y, 4, 2, '#c3be983b')
  }
  masonry(c, 1210, 165, 420, 100); masonry(c, 1210, 260, 40, 185); masonry(c, 1590, 260, 40, 185)
  drawRuneStone(c)
  for (const x of [1285, 1478]) { masonry(c, x, 145, 30, 128); box(c, x - 7, 143, 44, 9, '#9aa18a'); box(c, x - 9, 266, 48, 12, '#939c85') }
  // Broken crenellations, exposed foundations and roots through the mortar.
  for (let i = 0; i < 9; i++) masonry(c, 1210 + i * 47, 143 - i % 3 * 9, 35, 24 + i % 3 * 9)
  for (const x of [1225, 1300, 1500, 1610]) {
    c.strokeStyle = '#45673d'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 157); c.bezierCurveTo(x + 25, 200, x - 15, 225, x + 7, 289); c.stroke()
    for (let j = 0; j < 11; j++) { box(c, x + Math.sin(j) * 12, 161 + j * 11, 9, 4, j % 2 ? '#73984d' : '#a2b96b') }
  }
  for (const [x, y] of [[1203, 473], [1608, 494], [1265, 549], [1540, 562]]) { masonry(c, x, y, 26, 17); box(c, x + 3, y - 4, 15, 4, '#a7ac89') }
  // Loose altar stones are the interaction target, deliberately on the courtyard floor.
  masonry(c, 1358, 315, 73, 32); box(c, 1365, 309, 55, 6, '#b8b593'); box(c, 1388, 317, 10, 13, '#8dccb0')
}
export function drawRuins(c, time = 0) {
  if (!cache) { cache = document.createElement('canvas'); cache.width = 1750; cache.height = 660; paintRuins(cache.getContext('2d')) }
  drawRuinsWaterfall(c, time)
  c.drawImage(cache, 0, 0)
}
export function drawRuinDuel(c, s, p, sprite) {
  if (!s.active) return
  c.save()
  c.strokeStyle = '#b9cba766'; c.lineWidth = 2; c.strokeRect(1255, 285, 330, 310)
  if (s.target && (s.windup || s.impact)) {
    c.fillStyle = s.impact ? '#f8d39455' : '#d7a45233'; c.strokeStyle = '#efc785'; c.lineWidth = 2
    c.beginPath(); c.ellipse(s.target.x, s.target.y, 77, 77, 0, 0, Math.PI * 2); c.fill(); c.stroke()
  }
  if(!s.phase || s.phase==='splitting') {
    c.fillStyle = '#15282366'; c.beginPath(); c.ellipse(s.boss.x, s.boss.y + 5, 43, 13, 0, 0, Math.PI * 2); c.fill()
  }
  if (s.phase === 'undead') drawUndead(c,s)
  else if (s.phase === 'splitting' || s.phase === 'fragments') drawFragments(c,s,sprite)
  else if (!s.phase && sprite) drawGolem(c, s, sprite)
  if (!s.phase) {
  box(c, s.boss.x - 48, s.boss.y - 140, 96, 7, '#172523'); box(c, s.boss.x - 47, s.boss.y - 139, 94 * s.bossHp / 12, 5, '#d8b16a')
  c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.fillStyle = '#f7e7b1'; c.fillText(s.windup ? 'AFASTE-SE!' : s.meleeWindup ? 'GOLPE!' : 'VIGIA DE PEDRA', s.boss.x, s.boss.y - 148)
  }
  box(c, p.x - 25, p.y - 78, 50, 7, '#172523'); box(c, p.x - 24, p.y - 77, 48 * s.hp / 6, 5, '#b6d19c')
  for (const b of s.bolts) { c.strokeStyle = '#bef7e5'; c.lineWidth = 4; c.beginPath(); c.moveTo(b.x - b.dx * 20, b.y - 25 - b.dy * 20); c.lineTo(b.x, b.y - 25); c.stroke() }
  drawRuinBarrier(c, s)
  c.restore()
}
