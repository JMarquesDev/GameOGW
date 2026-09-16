// Small, peaceful shoreline frogs: olive backs, pale bellies and raised eyes.
const ROUTES = [[[1280, 970], [1500, 970]], [[1280, 1265], [1530, 1265]], [[1190, 1050], [1190, 1160]]]
export function createLakeFrogs() {
  return ROUTES.map((route, i) => ({ route, color: i === 1 ? 'brown' : 'olive', x: route[0][0], y: route[0][1], target: 1, phase: i, wait: i * .4, moving: false, facing: 1 }))
}
export function updateLakeFrogs(frogs, dt, player, valid) {
  for (const f of frogs) {
    f.moving = false
    if (f.wait > 0) { f.wait -= dt; continue }
    const [x, y] = f.route[f.target]; const dx = x - f.x; const dy = y - f.y; const d = Math.hypot(dx, dy)
    if (d < 3) { f.target = 1 - f.target; f.wait = 1.2; continue }
    const next = { x: f.x + dx / d * Math.min(d, dt * 23), y: f.y + dy / d * Math.min(d, dt * 23) }
    if (Math.hypot(next.x - player.x, next.y - player.y) < 31) continue
    if (!valid(next)) { f.target = 1 - f.target; f.wait = .6; continue }
    f.x = next.x; f.y = next.y; f.phase += dt * 7; f.moving = true; f.facing = dx < 0 ? -1 : 1
  }
}
export function drawLakeFrog(c, f) {
  const brown = f.color === 'brown'
  const box = (x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h) }
  c.save(); c.translate(Math.round(f.x), Math.round(f.y)); c.scale(f.facing, 1)
  c.fillStyle = '#19382b55'; c.beginPath(); c.ellipse(0, 2, 17, 5, 0, 0, Math.PI * 2); c.fill()
  const step = f.moving ? Math.round(Math.sin(f.phase) * 2) : 0
  c.translate(0, -Math.abs(step))
  box(-18, -13 + step, 10, 15, '#4c472a'); box(8, -13 - step, 10, 15, '#4c472a')
  box(-15, -13 + step, 7, 12, brown ? '#8c5939' : '#96934a'); box(8, -13 - step, 7, 12, brown ? '#8c5939' : '#96934a')
  box(-13, -22, 26, 24, '#423d29'); box(-15, -15, 30, 14, '#423d29')
  box(-11, -21, 22, 21, brown ? '#a16b45' : '#a6a65b'); box(-9, -16, 18, 16, brown ? '#d5b28c' : '#dfcba0'); box(-12, -9, 24, 8, brown ? '#d5b28c' : '#dfcba0')
  for (const x of [-11, 5]) { box(x, -27, 8, 9, '#423d29'); box(x + 1, -26, 6, 6, brown ? '#bd9066' : '#bdba73'); box(x + 2, -24, 4, 3, '#282c24'); box(x + 3, -24, 2, 1, '#eee0b2') }
  box(-5, -18, 10, 2, '#625738'); c.restore()
}
