// Original pixel-style civilians and a dark subway set, drawn in world coordinates.
const TAU = Math.PI * 2
const box = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h) }
const line = (c, x1, y1, x2, y2, color, width = 1) => { c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke() }
function oval(c, x, y, rx, ry, color) { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill() }
const PEOPLE = [
  { coat: '#48515b', pants: '#252e40', skin: '#dca779', hair: '#452d24', tie: true, route: [[143, 340], [143, 470], [160, 570], [160, 740], [143, 780]] },
  { coat: '#a44842', pants: '#303c50', skin: '#efb889', hair: '#3d2727', route: [[490, 335], [490, 478], [440, 540], [240, 540]] },
  { coat: '#4c9295', pants: '#38535c', skin: '#b87d55', hair: '#292b30', route: [[190, 770], [410, 770], [490, 770], [490, 650]] },
  { coat: '#55749d', pants: '#32465c', skin: '#eeb998', hair: '#d4af5f', longHair: true, route: [[145, 150], [145, 230], [158, 320], [158, 445]] },
  { coat: '#9b783e', pants: '#334a48', skin: '#8d5c45', hair: '#24252c', bag: true, route: [[480, 650], [550, 650], [550, 770], [480, 770]] },
  { coat: '#596862', pants: '#303849', skin: '#e6ae86', hair: '#ae9561', longHair: true, route: [[750, 1280], [950, 1280], [1070, 1280], [1250, 1280]] },
  { coat: '#393e52', pants: '#212f3e', skin: '#c18a69', hair: '#29232a', tie: true, route: [[310, 1070], [310, 1145], [400, 1145], [500, 1145]] },
]

export function createCivilians() {
  return PEOPLE.map((person, index) => ({ ...person, x: person.route[0][0], y: person.route[0][1], target: 1, step: 1, speed: 32 + index % 3 * 7, direction: 'down', gait: index, wait: index * .35, moving: false }))
}

export function updateCivilians(people, delta, player, valid) {
  for (const person of people) {
    person.moving = false
    if (person.wait > 0) { person.wait -= delta; continue }
    const [tx, ty] = person.route[person.target]
    const dx = tx - person.x; const dy = ty - person.y; const distance = Math.hypot(dx, dy)
    if (distance < 2) {
      if (person.target === person.route.length - 1) person.step = -1
      else if (person.target === 0) person.step = 1
      person.target += person.step; person.wait = .65; continue
    }
    person.direction = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'up' : 'down'
    const travel = Math.min(distance, person.speed * delta)
    const next = { x: person.x + dx / distance * travel, y: person.y + dy / distance * travel }
    if (Math.hypot(next.x - player.x, next.y - player.y) < 29 || !valid(next)) continue
    person.x = next.x; person.y = next.y; person.gait += delta * 8; person.moving = true
  }
}

export function drawCivilian(c, person) {
  c.save(); c.translate(Math.round(person.x), Math.round(person.y))
  oval(c, 0, 1, 14, 5, '#06121d66')
  c.scale(2, 2)
  const stride = person.moving ? Math.round(Math.sin(person.gait) * 2) : 0
  const bob = person.moving ? Math.abs(stride) * .4 : 0
  const side = person.direction === 'left' || person.direction === 'right'
  if (person.direction === 'left') c.scale(-1, 1)
  c.translate(0, -bob)
  // Arms and legs alternate; back and profile views change face/hair visibility.
  box(c, -5, -15, 4, 13 + stride, person.pants); box(c, 1, -15, 4, 13 - stride, person.pants)
  box(c, -6, -3 + stride, 6, 3, '#18222e'); box(c, 1, -3 - stride, 6, 3, '#18222e')
  box(c, -5, -29, 11, 16, person.coat); box(c, -4, -27, 2, 12, '#ffffff16')
  box(c, -8, -27 + stride, 3, 12, person.coat); box(c, -8, -16 + stride, 3, 4, person.skin)
  box(c, 6, -27 - stride, 3, 12, person.coat); box(c, 6, -16 - stride, 3, 4, person.skin)
  box(c, -2, -32, 5, 5, person.skin)
  box(c, -5, -41, 11, 10, person.skin); box(c, -6, -38, 13, 5, person.skin)
  box(c, -5, -43, 11, 5, person.hair); box(c, -3, -45, 7, 3, person.hair)
  if (person.direction === 'up') {
    box(c, -5, -40, 11, person.longHair ? 15 : 8, person.hair)
    box(c, -3, -24, 7, 9, '#111e2c55')
  } else {
    if (side) { box(c, -5, -40, 6, 9, person.hair); box(c, 6, -36, 2, 3, person.skin); box(c, 4, -38, 1, 1, '#292834') }
    else { box(c, -5, -40, 2, 5, person.hair); box(c, -2, -37, 1, 1, '#45302e'); box(c, 3, -37, 1, 1, '#45302e') }
    if (person.longHair) { box(c, -6, -39, 3, 13, person.hair); if (!side) box(c, 4, -39, 3, 13, person.hair) }
    if (person.tie) { box(c, -2, -28, 5, 3, '#ccd0c6'); box(c, 0, -27, 2, 7, '#ad5847') }
    else box(c, -1, -28, 4, 3, '#b5c1b166')
  }
  if (person.bag) { box(c, 7, -16, 5, 9, '#735338'); box(c, 8, -18, 3, 3, '#b1955e') }
  c.restore()
}

const STATION_BLOCKS = [
  [620, 0, 1120, 460], // Wall, train and track bed.
  [650, 495, 701, 575], [760, 515, 790, 555], [808, 515, 838, 555],
  [708, 646, 780, 682], [948, 646, 1020, 682], [1046, 477, 1080, 512],
]
export function validSubwayPosition(p) {
  return !STATION_BLOCKS.some(([left, top, right, bottom]) => p.x > left - 10 && p.x < right + 10 && p.y > top - 5 && p.y < bottom + 10)
}

let stationCache
function seats(c, x, y) {
  box(c, x, y + 25, 72, 7, '#101b26')
  for (let i = 0; i < 3; i += 1) {
    const sx = x + i * 24
    box(c, sx, y, 21, 19, '#29444b'); box(c, sx + 2, y + 2, 17, 2, '#4b686a')
    box(c, sx, y + 20, 22, 9, '#375258'); line(c, sx, y + 30, sx, y + 35, '#8b9390', 2)
  }
}
function paintStation(c) {
  box(c, 0, 0, 500, 1040, '#18222d')
  // Glazed wall tiles, staining and a faded route stripe.
  for (let y = 0; y < 220; y += 22) for (let x = 0; x < 500; x += 32) {
    box(c, x + 1, y + 1, 30, 20, (x + y) % 3 ? '#303c46' : '#39464d')
    if ((x * 3 + y) % 7 === 0) box(c, x + 4, y + 4, 3, 14, '#15293255')
  }
  box(c, 0, 124, 500, 9, '#294b50'); box(c, 0, 136, 500, 2, '#697979')
  box(c, 149, 140, 204, 35, '#0c1924'); c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.fillStyle = '#d1d8ce'; c.fillText('RAIZ / 07-B', 251, 162)
  box(c, 16, 157, 76, 20, '#234d4b'); c.font = 'bold 9px monospace'; c.fillStyle = '#cadad1'; c.fillText('← EXIT / NY', 54, 171)
  // Track pit and sleepers behind a substantial platform edge.
  box(c, 0, 222, 500, 237, '#090f19')
  for (let x = 8; x < 500; x += 25) box(c, x, 365, 9, 72, '#2b3038')
  line(c, 0, 378, 500, 378, '#737d84', 3); line(c, 0, 431, 500, 431, '#737d84', 3)
  // Platform uses a restrained blue-grey palette; yellow tactile paving stays readable.
  const floor = c.createLinearGradient(0, 460, 0, 1040); floor.addColorStop(0, '#46535a'); floor.addColorStop(1, '#222d39')
  c.fillStyle = floor; c.fillRect(0, 460, 500, 580)
  for (let y = 478; y < 1040; y += 32) for (let x = 0; x < 500; x += 40) {
    line(c, x, y, x + 39, y, '#87929418'); line(c, x, y, x, y + 31, '#111b2938')
    if ((x + y) % 9 === 0) line(c, x + 5, y + 2, x + 26, y + 6, '#78838722')
  }
  box(c, 0, 459, 500, 6, '#141d27'); box(c, 0, 473, 500, 10, '#a88a47')
  for (let x = 4; x < 500; x += 8) box(c, x, 476, 2, 2, '#dfbd6c')
  // Stairwell, handrails, ticket machines, gates and seating.
  box(c, 30, 495, 51, 80, '#0e1825')
  for (let y = 500; y < 572; y += 8) { box(c, 36, y, 39, 4, '#56646b'); line(c, 36, y + 4, 75, y + 4, '#1d2d39') }
  line(c, 29, 490, 29, 574, '#859c9c', 3); line(c, 82, 490, 82, 574, '#859c9c', 3)
  ;[140, 188].forEach((x) => {
    box(c, x, 515, 30, 40, '#526069'); box(c, x + 2, 517, 26, 8, '#8f9c9c')
    box(c, x + 8, 529, 13, 5, '#183a38'); box(c, x + 17, 530, 3, 3, '#86c2a4')
    line(c, x + 28, 534, x + 39, 542, '#a1aca7', 2)
  })
  box(c, 426, 477, 34, 35, '#3e525c'); box(c, 432, 481, 20, 15, '#101f2c'); box(c, 434, 484, 16, 5, '#7baba9'); box(c, 434, 501, 13, 2, '#e1ad65')
  seats(c, 88, 646); seats(c, 328, 646)
  // Route diagram mounted below the old station clock.
  box(c, 360, 178, 106, 39, '#74847f'); box(c, 364, 182, 98, 31, '#142830')
  line(c, 375, 197, 449, 197, '#b58b59', 2)
  for (let i = 0; i < 5; i += 1) oval(c, 376 + i * 18, 197, 2, 2, '#e1d6ad')
  for (let x = 110; x < 480; x += 150) {
    box(c, x, 0, 14, 207, '#1c2b37'); box(c, x + 2, 0, 2, 206, '#5e707a')
    box(c, x - 10, 208, 34, 7, '#111d29')
  }
  c.font = '10px monospace'; c.fillStyle = '#b4b6a377'; c.fillText('MIND THE GAP', 250, 503)
  c.fillStyle = '#81918d'; c.fillText('PLATAFORMA 02 • DISTRITO 07-B →', 266, 881)
}

function carriage(c, x, doorsOpen, front) {
  // Dark brushed steel, cool roof, separate doors and deeply recessed glazing.
  box(c, x + 5, 275, 208, 148, '#030b1499')
  const steel = c.createLinearGradient(0, 268, 0, 410); steel.addColorStop(0, '#81919a'); steel.addColorStop(.18, '#3c5362'); steel.addColorStop(.6, '#253a4b'); steel.addColorStop(1, '#48535e')
  c.fillStyle = steel; c.beginPath(); c.roundRect(x, 264, 210, 145, [14, 14, 4, 4]); c.fill()
  box(c, x + 8, 273, 192, 3, '#bdc6bd66'); box(c, x + 4, 369, 202, 3, '#af924f'); box(c, x + 4, 376, 202, 2, '#193443')
  for (let y = 385; y < 404; y += 5) line(c, x + 8, y, x + 201, y, '#9ba5a222')
  ;[14, 133].forEach((offset) => {
    box(c, x + offset, 293, 60, 53, '#0a1725'); box(c, x + offset + 3, 296, 54, 46, '#16333f')
    box(c, x + offset + 4, 297, 51, 2, '#74999088')
    line(c, x + offset + 8, 299, x + offset + 30, 340, '#b0d9d018', 3)
    // A pair of dim, anonymous seated silhouettes behind glass.
    oval(c, x + offset + 17, 316, 5, 6, '#0c1e2a'); box(c, x + offset + 10, 321, 15, 16, '#0c1e2a')
  })
  box(c, x + 81, 290, 43, 107, '#07121e')
  for (let side = 0; side < 2; side += 1) {
    const dx = x + 83 + side * 20 + (side ? 1 : -1) * doorsOpen * 19
    box(c, dx, 293, 18, 99, '#4a606c'); box(c, dx + 3, 301, 12, 48, '#102431'); box(c, dx + 6, 356, 3, 15, '#8b9899')
  }
  box(c, x + 5, 409, 200, 8, '#101c27'); oval(c, x + 36, 416, 13, 7, '#060e18'); oval(c, x + 176, 416, 13, 7, '#060e18')
  if (front) { box(c, x + 17, 280, 52, 10, '#0a1922'); c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.fillStyle = '#c9b17a'; c.fillText('07-B • RAIZ', x + 43, 288); oval(c, x + 8, 391, 3, 4, '#f5d897') }
}

export function drawDarkSubway(ctx, time, hunt) {
  if (!stationCache) {
    stationCache = document.createElement('canvas'); stationCache.width = 500; stationCache.height = 1040
    paintStation(stationCache.getContext('2d'))
  }
  ctx.save(); ctx.translate(620, 0); ctx.drawImage(stationCache, 0, 0)
  const boarding = ['boarding', 'cinematic', 'dialogue'].includes(hunt?.phase)
  const secondOpen = hunt?.phase === 'dialogue' || hunt?.phase === 'cinematic' && hunt.time > 1.2
  carriage(ctx, 26, boarding ? 1 : 0, true); box(ctx, 236, 299, 17, 91, '#111c29'); carriage(ctx, 253, secondOpen ? 1 : 0, false)
  if (boarding) { box(ctx, 108, 402, 39, 76, '#34444e'); line(ctx, 110, 407, 110, 476, '#879997', 2); line(ctx, 145, 407, 145, 476, '#879997', 2) }
  // Sparse fluorescent light pools and an isolated failing tube.
  ;[70, 250, 425].forEach((x, i) => {
    const brightness = i === 1 && Math.sin(time / 97) > .97 ? .2 : 1
    box(ctx, x - 45, 224, 90, 9, '#101b27'); box(ctx, x - 40, 227, 80, 3, `rgba(173, 213, 210, ${brightness})`)
    const glow = ctx.createRadialGradient(x, 500, 3, x, 500, 137)
    glow.addColorStop(0, `rgba(114, 179, 180, ${brightness * .12})`); glow.addColorStop(1, '#6aa6b000'); ctx.fillStyle = glow; ctx.fillRect(x - 137, 363, 274, 274)
  })
  ctx.restore()
}

export function drawReturnSubway(c, hunt) {
  box(c, 620, 1000, 780, 320, '#233441')
  for (let y = 1000; y < 1150; y += 30) for (let x = 620; x < 1400; x += 40) {
    box(c, x, y, 39, 1, '#708b9144'); box(c, x, y, 1, 29, '#0b1b2855')
  }
  box(c, 620, 1150, 780, 170, '#080f19')
  for (let x = 625; x < 1400; x += 25) box(c, x, 1250, 10, 60, '#303940')
  box(c, 620, 1260, 780, 3, '#819295'); box(c, 620, 1300, 780, 3, '#819295')
  box(c, 620, 1140, 780, 8, '#baa15c')
  const open = ['ready', 'departing', 'departed'].includes(hunt?.phase)
  c.save(); c.translate(1400 + (hunt?.phase === 'departing' ? Math.max(0, hunt.time - 1.2) ** 2 * 180 : 0), 890); c.scale(-1, 1)
  carriage(c, 26, open ? 1 : 0, true); box(c, 236, 299, 17, 91, '#111c29'); carriage(c, 253, open ? 1 : 0, false)
  c.restore()
  c.textAlign = 'center'; c.font = 'bold 13px monospace'; c.fillStyle = '#bcdbd5'; c.fillText('↓ PLATAFORMA 03 · SENTIDO SUL →', 1030, 1070)
  if (!open) {
    box(c, 620, 992, 780, 15, '#141e27'); box(c, 620, 994, 780, 3, '#ae8953')
    for (let x = 625; x < 1400; x += 24) box(c, x, 990, 6, 32, '#687578')
    // The route is visible, but the ticket objective only appears after the boss.
    c.font = '10px monospace'; c.fillStyle = '#cabda2'; c.fillText('ACESSO FECHADO', 1060, 1028)
  } else { c.fillStyle = '#94dec3'; c.fillText('↓ ACESSO LIBERADO', 1060, 1018) }
}
