import { drawCabinExterior } from './cabinExterior.js'
import { paintAncientTree } from './ancientTrees.js'

// Original canvas scenery, inspired by the supplied woodland/cottage references.
// Seeded detail keeps the landscape still between frames.
const TAU = Math.PI * 2
const noise = (seed) => { const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n) }
function polygon(ctx, points, fill, stroke) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath()
  ctx.fillStyle = fill; ctx.fill()
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke() }
}
function oval(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill()
}
function line(ctx, points, color, width = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath()
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke()
}

const treeCache = new Map()
export function woodlandTree(ctx, x, y, radius, seed) {
  const variant = seed % 12; const key = `${radius}-${variant}`
  if (!treeCache.has(key)) {
    const size = Math.ceil(radius * 6 + 100)
    const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size
    paintAncientTree(canvas.getContext('2d'), size / 2, size / 2, radius, variant)
    treeCache.set(key, canvas)
  }
  const cached = treeCache.get(key)
  ctx.drawImage(cached, x - cached.width / 2, y - cached.height / 2)
}

export function stone(ctx, x, y, size = 16) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 20, size / 20); ctx.lineWidth = 1.5
  oval(ctx, 4, 12, 25, 10, '#1b332c55')
  polygon(ctx, [[-22, 5], [-16, -12], [2, -19], [19, -8], [24, 9], [8, 18], [-14, 15]], '#686c59', '#394a3b')
  polygon(ctx, [[-22, 5], [-16, -12], [2, -19], [9, -6], [-1, 6]], '#d7d0a1')
  polygon(ctx, [[2, -19], [19, -8], [24, 9], [8, 18], [9, -6]], '#92957a')
  line(ctx, [[-14, -9], [-2, -14], [4, -8]], '#f4e8b9', 2)
  oval(ctx, -11, 12, 8, 3, '#758c46'); ctx.restore()
}

function fern(ctx, x, y, seed, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale)
  for (let leaf = -2; leaf <= 2; leaf += 1) {
    const tipX = leaf * 5; const tipY = -12 - (2 - Math.abs(leaf)) * 5
    line(ctx, [[0, 0], [tipX, tipY]], '#304d32', 2)
    for (let n = 1; n < 5; n += 1) {
      const px = tipX * n / 5; const py = tipY * n / 5
      line(ctx, [[px - 4, py - 4], [px, py], [px + 4, py - 5]], seed % 2 ? '#8eaf51' : '#adc56c', 2)
    }
  }
  ctx.restore()
}

function log(ctx, x, y) {
  ctx.save(); ctx.translate(x, y)
  oval(ctx, 2, 12, 40, 13, '#26392b55')
  ctx.fillStyle = '#664629'; ctx.fillRect(-32, -10, 65, 23)
  line(ctx, [[-31, -7], [30, -7]], '#c29d56', 5)
  line(ctx, [[-30, 2], [28, 2]], '#a17b3e', 3)
  line(ctx, [[-20, 8], [26, 8]], '#3e3221', 2)
  oval(ctx, 33, 1, 8, 12, '#d8b971'); oval(ctx, 33, 1, 5, 8, '#8e693d'); oval(ctx, 33, 1, 3, 5, '#cba05c')
  line(ctx, [[-18, -11], [-19, 14]], '#393b29', 3); ctx.restore()
}

// Offscreen caching keeps thousands of ground details out of the animation loop.
const terrainCache = new Map()
export function woodlandGround(ctx, width, height, beyond = false) {
  const key = `${width}-${height}-${beyond}`
  if (!terrainCache.has(key)) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    const c = canvas.getContext('2d')
    const ground = c.createLinearGradient(0, 0, width, height)
    ground.addColorStop(0, beyond ? '#405e47' : '#7d984d'); ground.addColorStop(1, beyond ? '#24463e' : '#425f3c')
    c.fillStyle = ground; c.fillRect(0, 0, width, height)
    for (let i = 0; i < width * height / 420; i += 1) {
      const x = noise(i + 7) * width; const y = noise(i + 800) * height
      c.fillStyle = ['#b4c76138', '#d4da7a25', '#2c4f3529', '#8baa573c'][i % 4]
      c.fillRect(x, y, 3 + noise(i + 50) * 17, 2 + noise(i + 30) * 4)
    }
    c.lineCap = 'round'
    const trail = () => {
      c.beginPath()
      if (beyond) { c.moveTo(180, 565); c.bezierCurveTo(270, 540, 310, 360, 460, 330); c.quadraticCurveTo(540, 350, 620, 480); c.moveTo(330, 460); c.quadraticCurveTo(400, 710, 630, 730) }
      else { c.moveTo(305, 315); c.bezierCurveTo(300, 440, 283, 489, 350, 516); c.bezierCurveTo(760, 565, 1040, 890, 1320, 720); c.bezierCurveTo(1480, 625, 1560, 735, 1715, 730); c.moveTo(780, 620); c.quadraticCurveTo(900, 820, 1025, 970); c.bezierCurveTo(1055, 1060, 1000, 1150, 1000, 1270); c.lineTo(1000, 1740); c.quadraticCurveTo(1000, 1840, 1010, 1940); c.moveTo(1160, 760); c.quadraticCurveTo(1320, 540, 1455, 405) }
    }
    ;[[84, '#435e3877'], [70, '#bca56a'], [57, '#ddc181'], [38, '#e9d193']].forEach(([w, color]) => { trail(); c.strokeStyle = color; c.lineWidth = w; c.stroke() })
    for (let i = 0; i < width * height / 1300; i += 1) {
      const x = noise(i + 30) * width; const y = noise(i + 1230) * height
      // Details outside the route, leaving the walking surface readable.
      trail(); c.lineWidth = 78; if (c.isPointInStroke(x, y)) {
        oval(c, x, y, 2 + noise(i) * 4, 1.5, '#b1996555'); continue
      }
      if (i % 9 === 0) fern(c, x, y, i, .55 + noise(i) * .5)
      else {
        line(c, [[x - 4, y - 7], [x - 1, y], [x + 1, y - 11], [x + 3, y], [x + 6, y - 6]], i % 3 ? '#9bb655' : '#3a6038', 1.5)
        if (i % 13 === 0) { oval(c, x, y - 10, 3, 2, '#f5dda0'); oval(c, x + 5, y - 6, 2, 2, '#e6b6ac') }
      }
    }
    terrainCache.set(key, canvas)
  }
  ctx.drawImage(terrainCache.get(key), 0, 0)
}

export function woodlandSigns(ctx) {
  const signs = [
    [1125, 915, [['← CABANA', -1], ['RUÍNAS ↗', 1], ['PONTE →', 1], ['VILA ↓', 1]]],
  ]
  ctx.save()
  for (const [x, y, boards] of signs) {
    oval(ctx, x + 9, y + 3, 18, 5, '#23352944')
    ctx.fillStyle = '#62472b'; ctx.fillRect(x - 4, y - 126, 8, 130)
    line(ctx, [[x - 1, y - 121], [x - 1, y]], '#bd9254', 2)
    boards.forEach(([text, direction], index) => {
      const yy = y - 124 + index * 27; const w = 116
      const points = direction === 1 ? [[x - 48, yy], [x + w - 60, yy], [x + w - 48, yy + 11], [x + w - 60, yy + 22], [x - 48, yy + 22]] : [[x - 60, yy + 11], [x - 48, yy], [x + 56, yy], [x + 56, yy + 22], [x - 48, yy + 22]]
      polygon(ctx, points, '#98703e', '#493a25')
      line(ctx, [[x - 42, yy + 3], [x + 47, yy + 3]], '#d4ae68', 1)
      ctx.font = 'bold 10px Georgia'; ctx.fillStyle = '#f2dfad'; ctx.textAlign = 'center'; ctx.fillText(text, x + 2, yy + 15)
      oval(ctx, x, yy + 4, 1.5, 1.5, '#3b362a')
    })
  }
  ctx.restore()
}

export function healerCottage(ctx, time = 0) {
  drawCabinExterior(ctx, time)
}

export function clearingDetails(ctx) {
  stone(ctx, 476, 332, 23); stone(ctx, 153, 462, 15)
  log(ctx, 468, 431); fern(ctx, 502, 440, 2, 1.1)
  fern(ctx, 415, 350, 4); fern(ctx, 179, 394, 5)
}
