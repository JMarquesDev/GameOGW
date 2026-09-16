import { validActPosition, inStation } from './beyondWorld.js'
import { TRAIN_ENTRY, SECOND_DOOR, RETURN_ENTRY, TICKETS, BOSS_MAX_HP, BOSS_BAR_HP, HUNTER_LINES } from './metroRoute.js'

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const clamp = (n, low, high) => Math.max(low, Math.min(high, n))
export const huntLocked = s => ['cinematic', 'dialogue', 'dying', 'departing'].includes(s.hunt.phase)
export const ticketsAvailable = s => ['tickets', 'ready', 'departing', 'departed'].includes(s.hunt.phase)
export const lowerPlatformOpen = s => ['ready', 'departing', 'departed'].includes(s.hunt.phase)
export const districtOpen = s => s.hunt.phase === 'departed'
export function createHunt() {
  return { phase: 'locked', time: 0, line: 0, boss: null, tickets: [], zoom: 1, darkness: 0 }
}
export function validCombatPosition(p, s) {
  if (!validActPosition(p, districtOpen(s))) return false
  if (p.x > 610 && p.x < 1400 && p.y > 990 && !lowerPlatformOpen(s)) return false
  if (s.hunt.phase === 'fight' && (!inStation(p) || p.x < 710 || p.y > 970)) return false
  return true
}
export function beginBoarding(s) {
  if (!s.cleared || s.hunt.phase !== 'boarding' || distance(s.player, TRAIN_ENTRY) > 65) return false
  Object.assign(s.hunt, { phase: 'cinematic', time: 0, line: 0, boss: null })
  Object.assign(s.player, TRAIN_ENTRY, { direction: 'up' }); s.bolts = []; s.cast = 0
  return true
}
export function advanceHunterDialogue(s) {
  if (s.hunt.phase !== 'dialogue') return false
  s.hunt.line++
  if (s.hunt.line >= HUNTER_LINES.length) startHunterFight(s)
  return true
}
export function startHunterFight(s) {
  Object.assign(s.hunt, { phase: 'fight', time: 0 })
  s.hunt.boss = { x: 1010, y: 580, hp: BOSS_MAX_HP, mode: 'chase', timer: 1.2, phase: 1, hitFlash: 0, moving: false, attackCount: 0, dx: -1, dy: 0 }
  Object.assign(s.player, { x: 880, y: 580, direction: 'right' })
  s.health = 6; s.invulnerable = 1.2; s.cooldown = 0; s.bolts = []; s.event = null
}
export function collectTicket(s) {
  if (s.hunt.phase !== 'tickets') return null
  const ticket = TICKETS.find(t => !s.hunt.tickets.includes(t.id) && distance(t, s.player) < 60)
  if (!ticket) return null
  s.hunt.tickets.push(ticket.id)
  if (s.hunt.tickets.length === TICKETS.length) { s.hunt.phase = 'ready'; s.event = 'ticketsReady' }
  return ticket
}
export function boardReturnTrain(s) {
  if (s.hunt.phase !== 'ready' || distance(s.player, RETURN_ENTRY) > 65) return false
  s.hunt.phase = 'departing'; s.hunt.time = 0; s.bolts = []
  Object.assign(s.player, RETURN_ENTRY, { direction: 'down' })
  return true
}
export function hitPredator(s) {
  const boss = s.hunt.boss
  if (s.hunt.phase !== 'fight' || !boss || boss.hp <= 0) return
  boss.hp--; boss.hitFlash = .16
  boss.phase = Math.min(3, 1 + Math.floor((BOSS_MAX_HP - boss.hp) / BOSS_BAR_HP))
  if (boss.hp === 0) { s.hunt.phase = 'dying'; s.hunt.time = 0; s.bolts.forEach(b => { b.life = 0 }); s.health = 6 }
}
export function retryHunter(s) {
  startHunterFight(s); s.event = 'hunterRetry'
}
function moveBoss(s, dx, dy) {
  const b = s.hunt.boss
  const valid = p => inStation(p) && p.x >= 710 && p.y <= 970 && validActPosition(p, false)
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 5))
  for (let i = 0; i < steps; i++) {
    if (valid({ x: b.x + dx / steps, y: b.y })) b.x += dx / steps
    if (valid({ x: b.x, y: b.y + dy / steps })) b.y += dy / steps
  }
}
function hurtPlayer(s, radius, damage) {
  if (distance(s.player, s.hunt.boss) < radius && s.invulnerable <= 0) {
    s.health = Math.max(0, s.health - damage); s.invulnerable = 1.1
  }
}
function updateBoss(s, dt) {
  const b = s.hunt.boss; const p = s.player
  b.timer = Math.max(0, b.timer - dt); b.hitFlash = Math.max(0, b.hitFlash - dt); b.moving = false
  if (b.mode === 'windup') {
    if (!b.timer) {
      b.mode = b.attack === 'lunge' ? 'lunge' : 'slash'; b.timer = b.attack === 'lunge' ? .42 : .18
      if (b.mode === 'slash') hurtPlayer(s, 86, b.phase === 3 ? 3 : 2)
    }
    return
  }
  if (b.mode === 'lunge') { moveBoss(s, b.dx * 510 * dt, b.dy * 510 * dt); b.moving = true; hurtPlayer(s, 57, 3) }
  if (b.mode === 'lunge' || b.mode === 'slash') {
    if (!b.timer) { b.mode = 'recover'; b.timer = 1.05 - b.phase * .12 }
    return
  }
  if (b.mode === 'recover') { if (!b.timer) { b.mode = 'chase'; b.timer = .85 - b.phase * .12 } return }
  const d = distance(p, b)
  if (!b.timer && d < 320) {
    b.attack = d < 78 ? 'slash' : 'lunge'; b.mode = 'windup'; b.timer = .9 - b.phase * .1
    b.dx = (p.x - b.x) / Math.max(1, d); b.dy = (p.y - b.y) / Math.max(1, d); b.attackCount++
    return
  }
  let target = p
  // Reuse the combat navigation field to pursue around benches and pillars.
  const gx = Math.round(b.x / 20), gy = Math.round(b.y / 20)
  const candidates = [[gx + 1, gy], [gx - 1, gy], [gx, gy + 1], [gx, gy - 1]]
    .filter(([x, y]) => s.flow.has(`${x},${y}`)).sort((a, z) => s.flow.get(`${a[0]},${a[1]}`) - s.flow.get(`${z[0]},${z[1]}`))
  if (candidates.length && d > 100) target = { x: candidates[0][0] * 20, y: candidates[0][1] * 20 }
  const dx = target.x - b.x, dy = target.y - b.y, length = Math.max(1, Math.hypot(dx, dy))
  if (d > 55) { moveBoss(s, dx / length * (108 + b.phase * 12) * dt, dy / length * (108 + b.phase * 12) * dt); b.moving = true }
}
export function updateHunt(s, dt) {
  const h = s.hunt; h.time += dt
  if (h.phase === 'cinematic') {
    const entry = clamp(h.time / 1.1, 0, 1)
    s.player.x = TRAIN_ENTRY.x; s.player.y = TRAIN_ENTRY.y - entry * 90
    if (h.time > 1.2) {
      h.boss ||= { ...SECOND_DOOR, hp: BOSS_MAX_HP, moving: true }
      h.boss.y = SECOND_DOOR.y + clamp((h.time - 1.2) / 1.8, 0, 1) * 95
    }
    if (h.time >= 3.7) { h.phase = 'dialogue'; h.line = 0 }
  } else if (h.phase === 'fight') updateBoss(s, dt)
  else if (h.phase === 'dying' && h.time >= 1.8) { h.phase = 'tickets'; h.time = 0; s.event = 'hunterDefeated' }
  else if (h.phase === 'departing') {
    s.player.y = RETURN_ENTRY.y + clamp(h.time / 1.1, 0, 1) * 110
    if (h.time >= 3.2) {
      h.phase = 'departed'; s.player = { x: 1500, y: 580, direction: 'right' }; s.event = 'arrival'
    }
  }
  const cinema = h.phase === 'cinematic' || h.phase === 'dialogue'
  const ease = 1 - Math.exp(-3 * dt)
  h.zoom += ((cinema ? 1.65 : 1) - h.zoom) * ease
  h.darkness += ((cinema ? .3 : h.phase === 'fight' ? .07 : 0) - h.darkness) * ease
}
export function huntObjective(s) {
  const h = s.hunt
  if (h.phase === 'boarding') return 'Entre no vagão pela primeira porta ao norte. E: embarcar.'
  if (h.phase === 'cinematic' || h.phase === 'dialogue') return 'Alguém estava esperando por você…'
  if (h.phase === 'fight') return 'Derrote o Predador. Desvie das garras e das faixas vermelhas com Q.'
  if (h.phase === 'dying') return 'O contrato chegou ao fim.'
  if (h.phase === 'tickets') return `Recolha os três tickets na plataforma (${h.tickets.length}/3). E: coletar.`
  if (h.phase === 'ready') return 'Siga para baixo e embarque no vagão da direção oposta. E: embarcar.'
  if (h.phase === 'departing') return 'Próxima parada: Anexo 07-B.'
  return null
}
