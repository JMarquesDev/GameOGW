// Night-time Manhattan block. Coordinates and building footprints use world space.
const WIDTH = 620
const HEIGHT = 1040
const TAU = Math.PI * 2
const random = (seed) => { const n = Math.sin(seed * 87.13 + 5.7) * 43758.5453; return n - Math.floor(n) }
const BUILDINGS = [
  { x: 0, y: 0, w: 112, h: 230, color: '#59403c', sign: 'DELI • 24 H', seed: 1 },
  { x: 0, y: 250, w: 112, h: 220, color: '#70483b', sign: 'BOOKS', seed: 2 },
  { x: 510, y: 0, w: 110, h: 250, color: '#393d50', sign: 'LAUNDRY', seed: 3 },
  { x: 530, y: 365, w: 90, h: 110, color: '#65443d', sign: '07-B', seed: 4 },
  { x: 0, y: 840, w: 112, h: 200, color: '#493b42', sign: 'COFFEE', seed: 5 },
  { x: 512, y: 868, w: 108, h: 172, color: '#55463e', sign: 'SERVICE', seed: 6 },
]
const LAMPS = [{ x: 141, y: 278 }, { x: 488, y: 297 }, { x: 141, y: 487 }, { x: 488, y: 830 }]
let streetCanvas
function rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h) }
function stroke(ctx, points, color, width = 1) {
  ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke()
}
function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill()
}
function facade(ctx, building) {
  const { x, y, w, h, color, seed } = building
  rect(ctx, x + 9, y + 10, w, h, '#060e1b66')
  rect(ctx, x, y, w, h, '#1b2330')
  rect(ctx, x + 4, y + 20, w - 8, h - 24, color)
  // Brick courses, stone cornices and recessed window frames.
  for (let row = 25; row < h - 28; row += 8) {
    stroke(ctx, [[x + 4, y + row], [x + w - 4, y + row]], '#131c2944')
    for (let col = 7 + (row % 16 ? 9 : 0); col < w - 5; col += 18) stroke(ctx, [[x + col, y + row], [x + col, y + row + 7]], '#b1886333')
  }
  for (let row = 38; row < h - 60; row += 43) {
    for (let col = 16; col < w - 15; col += 30) {
      const lit = random(row + col + seed) > .37
      rect(ctx, x + col - 3, y + row - 3, 23, 30, '#161d2a')
      rect(ctx, x + col, y + row, 16, 22, lit ? ['#e8b56f', '#b47a4c', '#f8d795'][seed % 3] : '#293849')
      if (lit) rect(ctx, x + col + 1, y + row + 2, 5, 18, '#fff0b180')
      stroke(ctx, [[x + col + 8, y + row], [x + col + 8, y + row + 22]], '#41332b', 2)
      stroke(ctx, [[x + col, y + row + 12], [x + col + 16, y + row + 12]], '#41332b', 2)
      rect(ctx, x + col - 4, y + row + 25, 24, 3, '#a08b75')
    }
    rect(ctx, x + 3, y + row + 32, w - 6, 3, '#1d2535')
  }
  rect(ctx, x, y + 15, w, 6, '#938475'); rect(ctx, x + 3, y, w - 6, 13, '#293441')
  rect(ctx, x + 10, y + h - 43, w - 20, 36, '#111d2a')
  rect(ctx, x + 14, y + h - 37, 28, 25, '#b99157')
  rect(ctx, x + 49, y + h - 36, 24, 29, '#26333b')
  rect(ctx, x + 67, y + h - 24, 2, 3, '#d6bd84')
  rect(ctx, x + 7, y + h - 57, w - 14, 13, seed % 2 ? '#25443e' : '#762f36')
  ctx.font = '700 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#ead1a0'; ctx.fillText(building.sign, x + w / 2, y + h - 48)
  // Black iron fire escape and diagonal braces.
  if (h > 180) {
    const ex = x + w - 31
    for (let row = 76; row < h - 60; row += 43) {
      rect(ctx, ex - 7, y + row, 33, 4, '#121b27')
      stroke(ctx, [[ex - 7, y + row], [ex - 7, y + row - 12], [ex + 25, y + row - 12], [ex + 25, y + row]], '#121b27', 2)
      stroke(ctx, [[ex - 2, y + row + 4], [ex + 19, y + row + 37]], '#151c24', 3)
      for (let rung = 0; rung < 6; rung += 1) stroke(ctx, [[ex + rung * 3 - 4, y + row + rung * 5 + 7], [ex + rung * 3 + 4, y + row + rung * 5 + 7]], '#7d7770')
    }
  }
}
function lamp(ctx, { x, y }) {
  ellipse(ctx, x + 12, y + 4, 19, 5, '#08132299')
  rect(ctx, x - 4, y - 6, 8, 9, '#182635'); rect(ctx, x - 2, y - 69, 4, 64, '#172637')
  stroke(ctx, [[x + 1, y - 7], [x + 1, y - 65]], '#887a5c')
  rect(ctx, x - 7, y - 81, 14, 17, '#263242'); rect(ctx, x - 4, y - 79, 8, 12, '#ffe5a0')
  rect(ctx, x - 9, y - 83, 18, 3, '#273342')
  const glow = ctx.createRadialGradient(x, y - 74, 1, x, y - 74, 43)
  glow.addColorStop(0, '#ffd28d66'); glow.addColorStop(1, '#ffbf7000'); ctx.fillStyle = glow; ctx.fillRect(x - 43, y - 117, 86, 86)
}
function paintStreet(ctx) {
  const asphalt = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  asphalt.addColorStop(0, '#162939'); asphalt.addColorStop(.5, '#26374a'); asphalt.addColorStop(1, '#172232')
  ctx.fillStyle = asphalt; ctx.fillRect(0, 0, WIDTH, HEIGHT)
  // Connected sidewalks around blocks leave a broad eastbound crossing.
  rect(ctx, 0, 0, 170, 498, '#657075'); rect(ctx, 469, 0, 151, 500, '#525e68')
  rect(ctx, 0, 804, 170, 236, '#5e6870'); rect(ctx, 469, 804, 151, 236, '#58656d')
  for (let y = 0; y < HEIGHT; y += 33) {
    if (y > 496 && y < 804) continue
    stroke(ctx, [[114, y], [168, y]], '#27354388'); stroke(ctx, [[471, y], [620, y]], '#29374688')
  }
  stroke(ctx, [[171, 0], [171, 500], [0, 500]], '#b6b3a0', 3)
  stroke(ctx, [[468, 0], [468, 500], [620, 500]], '#969d9c', 3)
  stroke(ctx, [[0, 802], [171, 802], [171, HEIGHT]], '#929b9b', 3)
  stroke(ctx, [[468, HEIGHT], [468, 802], [620, 802]], '#a5aa9e', 3)
  // Worn lane markings and zebra crossing; all remain under the characters.
  for (let y = 20; y < HEIGHT; y += 68) if (y < 452 || y > 850) {
    rect(ctx, 315, y, 3, 31, '#c7ab6477'); rect(ctx, 324, y, 3, 31, '#c7ab6477')
  }
  for (let x = 188; x < 453; x += 32) { rect(ctx, x, 520, 18, 31, '#c9c9b897'); rect(ctx, x, 754, 18, 31, '#c9c9b87a') }
  // Fine grit, patched tarmac and cracks with deterministic placement.
  for (let i = 0; i < 2400; i += 1) {
    const x = random(i) * WIDTH; const y = random(i + 5000) * HEIGHT
    rect(ctx, x, y, 1 + random(i + 4) * 4, 1, i % 2 ? '#adc1c012' : '#06132322')
  }
  for (let i = 0; i < 28; i += 1) {
    const x = 185 + random(i + 71) * 260; const y = random(i + 41) * HEIGHT
    stroke(ctx, [[x, y], [x + 9, y + 7], [x + 4, y + 17], [x + 22, y + 22]], '#111e2e88')
  }
  ;[[256, 438], [386, 687], [222, 905]].forEach(([x, y]) => {
    ellipse(ctx, x, y, 17, 10, '#0f1c28'); ellipse(ctx, x, y - 1, 14, 8, '#465561')
    for (let n = -8; n <= 8; n += 4) stroke(ctx, [[x - 10, y + n * .5], [x + 10, y + n * .5]], '#1b2937')
  })
  // Reflections are broken streaks directly below actual street lamps, not skylines.
  for (const source of LAMPS) {
    const roadX = source.x < 300 ? 208 : 425
    ellipse(ctx, roadX, source.y + 22, 41, 55, '#142d3c66')
    const light = ctx.createRadialGradient(source.x, source.y, 0, roadX, source.y + 10, 115)
    light.addColorStop(0, '#efac5b32'); light.addColorStop(1, '#c9864000'); ctx.fillStyle = light; ctx.fillRect(source.x - 130, source.y - 90, 260, 230)
    for (let row = 0; row < 19; row += 1) {
      const w = (1 - row / 23) * 23 * random(row + source.y)
      rect(ctx, roadX - w / 2 + random(row) * 8, source.y - 10 + row * 4, w, 1.5, `rgba(238, 184, 105, ${.29 * (1 - row / 20)})`)
    }
  }
  BUILDINGS.forEach((building) => facade(ctx, building))
  LAMPS.forEach((source) => lamp(ctx, source))
  // Hydrant, bags, bins and a directional subway sign.
  rect(ctx, 135, 402, 11, 22, '#a44f39'); ellipse(ctx, 140, 400, 7, 3, '#bc7050'); rect(ctx, 131, 407, 19, 5, '#71382f')
  rect(ctx, 477, 393, 18, 29, '#273d40'); rect(ctx, 474, 391, 24, 5, '#64756b')
  for (let i = 0; i < 3; i += 1) ellipse(ctx, 120 + i * 10, 447 + i % 2 * 5, 8, 10, '#1b2831')
  rect(ctx, 569, 443, 3, 51, '#172736'); rect(ctx, 516, 439, 98, 18, '#193b39')
  ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace'; ctx.fillStyle = '#dee3cc'; ctx.fillText('SUBWAY • 07-B →', 565, 451)
  ctx.save(); ctx.translate(365, 621); ctx.rotate(-Math.PI / 2); ctx.font = 'bold 17px monospace'; ctx.fillStyle = '#c7c6ad44'; ctx.fillText('KEEP CLEAR', 0, 0); ctx.restore()
}

export function drawNewYorkStreet(ctx, time) {
  if (!streetCanvas) {
    streetCanvas = document.createElement('canvas'); streetCanvas.width = WIDTH; streetCanvas.height = HEIGHT
    paintStreet(streetCanvas.getContext('2d'))
  }
  ctx.save(); ctx.drawImage(streetCanvas, 0, 0)
  // Local steam from the manhole, with no vegetation or floating architecture.
  for (let i = 0; i < 5; i += 1) {
    const phase = (time / 3500 + i / 5) % 1
    ellipse(ctx, 386 + Math.sin(phase * 5) * 9, 685 - phase * 51, 6 + phase * 17, 3 + phase * 8, `rgba(157, 188, 195, ${(1 - phase) * .08})`)
  }
  ctx.restore()
}

export function validNewYorkPosition(position) {
  return !BUILDINGS.some(({ x, y, w, h }) => position.x > x - 12 && position.x < x + w + 12 && position.y > y - 6 && position.y < y + h + 12)
}
