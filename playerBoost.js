export const BOOST_COOLDOWN = 2
export const BOOST_DURATION = .22
const DIRECTIONS = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] }
export function createBoost() { return { cooldown: 0, remaining: 0, direction: 'down' } }
export function startBoost(s, player, paused = false) {
  if (paused || s.cooldown > 0) return false
  s.direction = player.direction; s.remaining = BOOST_DURATION; s.cooldown = BOOST_COOLDOWN
  return true
}
export function updateBoost(s, player, dt, valid, paused = false) {
  if (paused) { s.remaining = 0; return }
  s.cooldown = Math.max(0, s.cooldown - dt)
  const duration = Math.min(dt, s.remaining)
  s.remaining = Math.max(0, s.remaining - dt)
  if (!duration) return
  const [dx,dy] = DIRECTIONS[s.direction] || DIRECTIONS.down
  player.direction = s.direction
  // Sweep in small increments so the impulse cannot tunnel through thin walls.
  const distance = 420 * duration, steps = Math.ceil(distance / 3)
  for (let i=0; i<steps; i++) {
    const next = { ...player, x: player.x + dx * distance / steps, y: player.y + dy * distance / steps }
    if (!valid(next)) break
    player.x=next.x; player.y=next.y
  }
}
export function drawBoostWind(c, s, x, y) {
  if (!s.remaining) return
  const [dx,dy] = DIRECTIONS[s.direction] || DIRECTIONS.down
  const age = 1-s.remaining/BOOST_DURATION
  c.save(); c.translate(x,y); c.rotate(Math.atan2(dy,dx))
  c.strokeStyle = `rgba(220,244,235,${.8*(1-age*.6)})`; c.lineWidth=2
  for(let i=0;i<5;i++) {
    const lane=(i-2)*8, tail=18+age*32+i%2*8
    c.beginPath(); c.moveTo(-tail,lane); c.quadraticCurveTo(-tail+12,lane-3,-5,lane); c.stroke()
  }
  c.restore()
}
