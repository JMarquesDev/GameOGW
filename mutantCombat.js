import { ACT_START, inStation, clearLine } from './beyondWorld.js'
import { createHunt, updateHunt, huntLocked, validCombatPosition, districtOpen, hitPredator, retryHunter } from './metroHunt.js'

export const MAX_HEALTH = 6
const heading = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const mutant = (id, x, y, zone = 'station') => ({ id, x, y, homeX: x, homeY: y, zone, hp: 3, hitFlash: 0, windup: 0, cooldown: 0, facing: 1 })
export function createCombat() {
  return { player: { ...ACT_START }, health: MAX_HEALTH, invulnerable: 0, cooldown: 0, cast: 0, bolts: [], fragments: [], started: false, cleared: false, wave: 0, kills: 0, flowTime: 0, flow: new Map(),
    enemies: [], hunt: createHunt(), event: null }
}
function waveEnemies(wave) {
  return wave === 1 ? [mutant('m1', 875, 590), mutant('m2', 1190, 585), mutant('m3', 1270, 905)]
    : [mutant('m4', 900, 855), mutant('m5', 1255, 575)]
}
export function enterStation(s) {
  if (s.started || !inStation(s.player)) return false
  s.started = true; s.wave = 1; s.health = MAX_HEALTH; s.enemies.push(...waveEnemies(1))
  s.event = 'entry'; return true
}
export function castStaff(s) {
  if (s.cooldown > 0 || s.health <= 0 || huntLocked(s)) return false
  const p = s.player
  // Modest assisted aiming makes keyboard and touch equally viable.
  const targets = s.hunt.phase === 'fight' ? [s.hunt.boss] : s.enemies
  const target = targets.filter(e => e.hp > 0 && distance(p, e) < 340 && clearLine(p, e, districtOpen(s))).sort((a, b) => distance(p, a) - distance(p, b))[0]
  let [dx, dy] = heading[p.direction] || heading.right
  if (target) { const d = Math.max(1, distance(p, target)); dx = (target.x - p.x) / d; dy = (target.y - p.y) / d }
  s.cooldown = .48; s.cast = .22
  s.bolts.push({ x: p.x, y: p.y, dx, dy, life: .78 })
  return true
}
function move(entity, dx, dy, valid) {
  if (valid({ x: entity.x + dx, y: entity.y })) entity.x += dx
  if (valid({ x: entity.x, y: entity.y + dy })) entity.y += dy
}
// A small navigation field routes pursuers around benches and pillars.
function navigation(s) {
  const step = 20; const key = (x, y) => `${x},${y}`
  const px = Math.round(s.player.x / step); const py = Math.round(s.player.y / step)
  const map = new Map([[key(px, py), 0]]); const q = [[px, py]]
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i]; const depth = map.get(key(x, y))
    if (depth >= 36) continue
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx; const ny = y + dy; const k = key(nx, ny)
      if (!map.has(k) && validCombatPosition({ x: nx * step, y: ny * step }, s)) { map.set(k, depth + 1); q.push([nx, ny]) }
    }
  }
  s.flow = map
}
export function updateCombat(s, dt, input = { x: 0, y: 0 }) {
  if (huntLocked(s)) { updateHunt(s, dt); return }
  const p = s.player; const valid = point => validCombatPosition(point, s)
  s.invulnerable = Math.max(0, s.invulnerable - dt); s.cooldown = Math.max(0, s.cooldown - dt); s.cast = Math.max(0, s.cast - dt)
  const length = Math.hypot(input.x, input.y)
  if (length) {
    p.direction = Math.abs(input.x) > Math.abs(input.y) ? input.x < 0 ? 'left' : 'right' : input.y < 0 ? 'up' : 'down'
    move(p, input.x / length * 175 * dt, input.y / length * 175 * dt, valid)
  }
  if (enterStation(s)) return
  s.flowTime -= dt
  if (s.flowTime <= 0) { navigation(s); s.flowTime = .35 }
  for (const b of s.bolts) {
    // Substeps prevent a fast bolt tunnelling through furniture or creatures.
    const steps = Math.max(1, Math.ceil(dt * 470 / 8))
    for (let i = 0; i < steps && b.life > 0; i++) {
      b.x += b.dx * 470 * dt / steps; b.y += b.dy * 470 * dt / steps; b.life -= dt / steps
      if (!valid(b)) { b.life = 0; break }
      if (s.hunt.phase === 'fight' && distance(b, s.hunt.boss) < 34) { hitPredator(s); b.life = 0; break }
      const e = s.enemies.find(e => e.hp > 0 && distance(b, e) < 26)
      if (e) {
        e.hp--; e.hitFlash = .35; e.windup = 0; b.life = 0
        move(e, b.dx * 18, b.dy * 18, point => valid(point) && (e.zone !== 'station' || inStation(point)))
        if (e.hp === 0 && e.zone === 'station') s.kills++
      }
    }
  }
  s.bolts = s.bolts.filter(b => b.life > 0)
  for (const e of s.enemies) {
    if (e.hp <= 0) continue
    e.cooldown = Math.max(0, e.cooldown - dt); e.hitFlash = Math.max(0, e.hitFlash - dt)
    const d = distance(p, e)
    if (e.windup > 0) {
      e.windup = Math.max(0, e.windup - dt)
      if (!e.windup) {
        if (d < 60 && s.invulnerable <= 0) { s.health--; s.invulnerable = 1.1 }
        e.cooldown = 1.05
      }
      continue
    }
    if (d < 50 && !e.cooldown) { e.windup = .55; continue }
    const active = e.zone === 'station' ? inStation(p) : d < 245 && !inStation(p)
    if (!active || d < 36) continue
    let tx = p.x; let ty = p.y
    if (!clearLine(e, p, districtOpen(s))) {
      const gx = Math.round(e.x / 20); const gy = Math.round(e.y / 20)
      const candidates = [[gx + 1, gy], [gx - 1, gy], [gx, gy + 1], [gx, gy - 1]].filter(([x, y]) => s.flow.has(`${x},${y}`)).sort((a, b) => s.flow.get(`${a[0]},${a[1]}`) - s.flow.get(`${b[0]},${b[1]}`))
      if (!candidates.length) continue
      tx = candidates[0][0] * 20; ty = candidates[0][1] * 20
    }
    const dx = tx - e.x; const dy = ty - e.y; const len = Math.max(1, Math.hypot(dx, dy)); e.facing = dx < 0 ? -1 : 1
    const speed = e.zone === 'station' ? 82 : 66
    move(e, dx / len * speed * dt, dy / len * speed * dt, point => valid(point) && (e.zone !== 'station' || inStation(point)))
  }
  updateHunt(s, dt)
  if (s.health <= 0) {
    if (s.hunt.phase === 'fight') { retryHunter(s); return }
    s.player = { ...ACT_START }; s.health = MAX_HEALTH; s.invulnerable = 2; s.bolts = []; s.cooldown = 0; s.cast = 0
    if (!s.cleared) { s.started = false; s.wave = 0; s.kills = 0; s.enemies = [] }
    for (const e of s.enemies) { e.x = e.homeX; e.y = e.homeY; e.windup = 0; e.cooldown = 0 }
    s.event = 'retry'; return
  }
  if (s.started && !s.cleared && s.enemies.filter(e => e.zone === 'station').every(e => e.hp <= 0)) {
    if (s.wave === 1) { s.wave = 2; s.enemies.push(...waveEnemies(2)); s.health = Math.min(MAX_HEALTH, s.health + 2); s.event = 'wave' }
    else { s.cleared = true; s.hunt.phase = 'boarding'; s.health = MAX_HEALTH; s.event = 'clear' }
  }
}
