import { TRAIN_ENTRY, RETURN_ENTRY, TICKETS, BOSS_MAX_HP } from './metroRoute.js'

function marker(c, point, text, time, color = '#e6d399') {
  const bob = Math.sin(time / 320) * 3
  c.save(); c.translate(point.x, point.y + bob)
  c.strokeStyle = color; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 23, 8, 0, 0, Math.PI * 2); c.stroke()
  c.fillStyle = '#08121de6'; c.fillRect(-78, -37, 156, 22)
  c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.fillStyle = color; c.fillText(text, 0, -22); c.restore()
}
export function drawMetroMarkers(c, s, time) {
  const h = s.hunt
  if (h.phase === 'boarding') marker(c, TRAIN_ENTRY, 'E · ENTRAR NO VAGÃO', time)
  if (h.phase === 'tickets') for (const ticket of TICKETS) if (!h.tickets.includes(ticket.id)) {
    marker(c, ticket, 'E · TICKET', time, '#b7e2c1')
    c.save(); c.translate(ticket.x, ticket.y - 12); c.rotate(-.22)
    c.fillStyle = '#e8d8a0'; c.fillRect(-10, -6, 20, 12); c.fillStyle = '#2b5149'
    for (let i = -6; i < 7; i += 3) c.fillRect(i, -3, 1, 6)
    c.restore()
  }
  if (h.phase === 'ready') marker(c, RETURN_ENTRY, 'E · EMBARCAR / SUL', time, '#a5e8cd')
}
export function drawPredatorTelegraph(c, s) {
  const b = s.hunt.boss
  if (s.hunt.phase !== 'fight' || !['windup', 'lunge', 'slash'].includes(b.mode)) return
  c.save(); c.translate(b.x, b.y); c.rotate(Math.atan2(b.dy, b.dx))
  c.fillStyle = b.mode === 'windup' ? '#d95b543d' : '#efb68170'; c.strokeStyle = '#f7a17d'; c.lineWidth = 2
  if (b.attack === 'lunge') { c.fillRect(0, -34, 250, 68); c.strokeRect(0, -34, 250, 68) }
  else { c.beginPath(); c.arc(0, 0, 86, 0, Math.PI * 2); c.fill(); c.stroke() }
  c.restore()
}
export function drawPredator(c, s, image, time) {
  const h = s.hunt, b = h.boss
  if (!b || !image || ['tickets', 'ready', 'departing', 'departed'].includes(h.phase)) return
  c.save(); c.translate(b.x, b.y)
  if (h.phase === 'dying') { c.globalAlpha = Math.max(0, 1 - h.time / 1.8); c.rotate(Math.min(Math.PI / 2, h.time * 1.8)); c.scale(1, 1 - Math.min(.25, h.time * .2)) }
  c.fillStyle = '#03091199'; c.beginPath(); c.ellipse(0, 2, 31, 10, 0, 0, Math.PI * 2); c.fill()
  const moving = b.moving || b.mode === 'lunge' || b.mode === 'slash'
  const frame = b.mode === 'lunge' || b.mode === 'slash' ? 1 : moving ? Math.floor(time / 170) % 2 : 0
  const bob = moving ? Math.sin(time / 85) * 2 : Math.sin(time / 520) * .6
  c.imageSmoothingEnabled = false
  if (b.hitFlash > 0) { c.shadowColor = '#d4edff'; c.shadowBlur = 10 }
  c.drawImage(image, frame * image.width / 2, 0, image.width / 2, image.height, -50, -176 + bob, 100, 196)
  c.shadowBlur = 0
  if (b.mode === 'windup') { c.fillStyle = '#ffd7ad'; c.font = 'bold 19px monospace'; c.textAlign = 'center'; c.fillText('!', 0, -165) }
  if (b.mode === 'slash' || b.mode === 'lunge') {
    c.strokeStyle = '#e9eff0'; c.lineWidth = 3
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-35 + i * 14, -87); c.lineTo(7 + i * 14, -30); c.stroke() }
  }
  c.restore()
}
export function drawSuspense(c, s) {
  const h = s.hunt
  if (h.darkness > .005) {
    const vignette = c.createRadialGradient(576, 315, 90, 576, 315, 630)
    vignette.addColorStop(0, `rgba(3,7,16,${h.darkness * .25})`); vignette.addColorStop(1, `rgba(3,7,16,${h.darkness * 1.8})`)
    c.fillStyle = vignette; c.fillRect(0, 0, 1152, 648)
  }
  if (h.phase === 'cinematic' || h.phase === 'dialogue') {
    c.fillStyle = '#030710'; c.fillRect(0, 0, 1152, 38); c.fillRect(0, 610, 1152, 38)
    c.fillStyle = '#c4c7cc'; c.textAlign = 'center'; c.font = '12px monospace'; c.fillText('UMA ÚLTIMA PASSAGEM', 576, 25)
    if (h.phase === 'cinematic' && h.time > 1.3) { c.font = '13px monospace'; c.fillText('O metal arranha o silêncio.', 576, 633) }
  }
  if (h.phase === 'departing') { c.fillStyle = `rgba(3,7,16,${Math.min(1, Math.max(0, h.time - 1.4) / 1.6)})`; c.fillRect(0, 0, 1152, 648) }
}
export function metroHud(s) {
  return { health: s.health, fragments: [...s.fragments], started: s.started, cleared: s.cleared, wave: s.wave, kills: s.kills,
    huntPhase: s.hunt.phase, bossHp: s.hunt.boss?.hp ?? BOSS_MAX_HP, bossPhase: s.hunt.boss?.phase ?? 1, tickets: s.hunt.tickets.length, line: s.hunt.line }
}
