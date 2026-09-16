import { createBoost, drawBoostWind } from './playerBoost.js'
export const RUN_FRAME_MS = 170
const RUN_ROOT = '/assets/RatRun/'
export const RUN_SPRITES = { ...Object.fromEntries(
  [['right', 'corridaDir'], ['left', 'corridaEs']].flatMap(([direction, name]) =>
    [0, 1].map(frame => [`${direction}-${frame}`, `${RUN_ROOT}${name}${frame ? '2' : ''}.png`]))
),
  'down-0': `${RUN_ROOT}correFren.png`,
  'down-1': `${RUN_ROOT}correFren2-solid.png`,
  'up-0': `${RUN_ROOT}correTras.png`,
  'up-1': '/assets/ratoCostas.png',
}
export function createPlayerAnimation() { return { direction: 'down', elapsed: 0, moving: false, frame: 0, boost: createBoost() } }
export function updatePlayerAnimation(animation, before, player, dt, paused = false) {
  const dx = player.x - before.x, dy = player.y - before.y
  // Use actual displacement: holding a key against a wall is still idle.
  const moving = !paused && Math.hypot(dx, dy) > .001 && Math.hypot(dx, dy) < 30
  const direction = moving && Math.abs(dx) > .001 ? (dx > 0 ? 'right' : 'left') : player.direction
  if (!moving || direction !== animation.direction || !animation.moving) animation.elapsed = 0
  else animation.elapsed = (animation.elapsed + dt * 1000) % (RUN_FRAME_MS * 2)
  animation.direction = direction; animation.moving = moving
  animation.frame = Math.floor(animation.elapsed / RUN_FRAME_MS)
  return animation
}
const runImages = {}
// Match the generated front step to the subdued lighting of the original frame.
// A color filter preserves alpha; reducing globalAlpha would make the mouse translucent.
export const RUN_FRAME_FILTERS = { 'down-1': 'brightness(0.88) saturate(0.78)' }
// Disconnected edge remnants in corridaDir.png and corridaEs2.png, in source pixels.
// Mask only these fragments; preserve the staff, silhouette, scale and collision box.
export const RUN_FRAME_CUTOUTS = {
  'right-0': [[190, 140, 40, 30], [222, 106, 8, 30]],
  'left-1': [[0, 175, 47, 37], [0, 137, 7, 31]],
}
let loading = false
export function preloadPlayerRunSprites() {
  if (loading) return
  loading = true
  for (const [key, path] of Object.entries(RUN_SPRITES)) {
    const image = new Image()
    image.onload = () => { runImages[key] = image }
    image.onerror = () => { console.warn(`Sprite de corrida indisponível: ${path}. Usando sprite base.`) }
    image.src = path
  }
}
export function drawAnimatedPlayer(c, images, animation, x, y, width, height, prefix = '') {
  const frameKey = `${animation.direction}-${animation.frame}`
  const run = animation.moving && runImages[frameKey]
  const sprite = run || images[`${prefix}${animation.direction}`]
  if (!sprite) return
  // Run assets have different aspect ratios. Align feet and preserve their proportions.
  const drawnWidth = run ? height * sprite.naturalWidth / sprite.naturalHeight : width
  c.save(); c.imageSmoothingEnabled = false
  drawBoostWind(c, animation.boost, x + width / 2, y + height * .65)
  if (run && RUN_FRAME_FILTERS[frameKey]) {
    const inheritedFilter = c.filter && c.filter !== 'none' ? `${c.filter} ` : ''
    c.filter = inheritedFilter + RUN_FRAME_FILTERS[frameKey]
  }
  if (run && RUN_FRAME_CUTOUTS[frameKey]) {
    const left = x + (width - drawnWidth) / 2
    const scale = height / sprite.naturalHeight
    c.beginPath(); c.rect(left, y, drawnWidth, height)
    for (const [cx, cy, cw, ch] of RUN_FRAME_CUTOUTS[frameKey]) c.rect(left + cx * scale, y + cy * scale, cw * scale, ch * scale)
    c.clip('evenodd')
  }
  c.drawImage(sprite, x + (width - drawnWidth) / 2, y, drawnWidth, height)
  c.restore()
}
