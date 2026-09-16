import { drawNewYorkStreet, validNewYorkPosition } from './newYork.js'
import { drawDarkSubway, drawReturnSubway, validSubwayPosition } from './cityLife.js'

export const ACT_WORLD = { width: 1900, height: 1320 }
export const ACT_START = { x: 190, y: 560, direction: 'right' }
export const CORE = { x: 1695, y: 390 }
export const MEMORIES = [
  { id: 'street', x: 460, y: 330, title: 'Carga viva', text: 'Uma etiqueta 07-B está presa a uma gaiola vazia: “Transferir os demais sujeitos pelo metrô”. Você reconhece o número do laboratório de onde fugiu. Não era o único animal naquele experimento.' },
  { id: 'station', x: 1200, y: 880, title: 'Os outros sujeitos', text: 'O gravador de uma pesquisadora ainda funciona: “A mesma substância despertou a consciência de R-07, mas nos demais provocou crescimento descontrolado e uma resposta de medo permanente”. As criaturas não nasceram monstros. Também tentaram escapar.' },
  { id: 'district', x: 1630, y: 630, title: 'A frequência do cajado', text: 'O último registro explica por que seu cajado as enfraquece: sua luz interrompe o sinal de contenção 07-B. A Interferência manteve os outros sujeitos presos ao pânico. Desligar o núcleo pode finalmente silenciá-la.' },
]
const BLOCKS = [
  [60, 1060, 170, 1125], [450, 1060, 585, 1125],
  [620, 1150, 1400, 1320],
  [1120, 0, 1400, 460],
  [1400, 0, 1900, 300], [1810, 480, 1860, 580],
  [1510, 780, 1580, 820], [1770, 780, 1840, 820],
  [1160, 665, 1190, 710], [1310, 665, 1340, 710],
]
export const inStation = (p) => p.x > 620 && p.x < 1400 && p.y > 465 && p.y < 1040
export function validActPosition(p, cleared = false) {
  if (p.x < 28 || p.y < 28 || p.x > ACT_WORLD.width - 28 || p.y > ACT_WORLD.height - 28) return false
  if (!cleared && p.x > 1380) return false
  return validNewYorkPosition(p) && validSubwayPosition(p)
    && !BLOCKS.some(([l, t, r, b]) => p.x > l - 12 && p.x < r + 12 && p.y > t - 8 && p.y < b + 12)
}
export function clearLine(a, b, cleared) {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 10)
  for (let i = 1; i <= steps; i++) if (!validActPosition({ x: a.x + (b.x - a.x) * i / steps, y: a.y + (b.y - a.y) * i / steps }, cleared)) return false
  return true
}
const box = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h) }
const label = (c, text, x, y, color = '#d7d8bc', size = 11) => { c.fillStyle = color; c.font = `bold ${size}px monospace`; c.textAlign = 'center'; c.fillText(text, x, y) }
let cache
function paintExpansion(c) {
  box(c, 0, 0, 1900, 1320, '#202f40')
  // Two connected cross streets and short blocks extend the route, not the objective list.
  box(c, 0, 1040, 1400, 96, '#5c6870'); box(c, 0, 1250, 1900, 70, '#56616b')
  for (let x = 10; x < 1900; x += 40) {
    box(c, x, 1046, 1, 87, '#25364366'); box(c, x, 1254, 1, 66, '#26344466')
    box(c, x, 1190, 24, 3, '#c7b97877')
  }
  for (const x of [215, 1000, 1350]) for (let y = 1145; y < 1250; y += 20) box(c, x, y, 35, 10, '#d0cdbba0')
  box(c, 195, 1020, 225, 116, '#26374a')
  // Eastern station concourse replaces the old arena; no circular floor overlay.
  box(c, 1120, 0, 280, 460, '#141e2b')
  for (let y = 18; y < 440; y += 26) for (let x = 1124; x < 1400; x += 35) box(c, x, y, 33, 24, '#303c48')
  box(c, 1138, 250, 244, 174, '#0b121d')
  box(c, 1120, 460, 280, 580, '#303e4b')
  for (let y = 470; y < 1040; y += 32) for (let x = 1120; x < 1400; x += 40) {
    box(c, x, y, 39, 1, '#81929533'); box(c, x, y, 1, 31, '#0e1f2d55')
  }
  box(c, 1120, 474, 280, 9, '#bd9e4f')
  for (let x = 1125; x < 1400; x += 8) box(c, x, 477, 2, 2, '#efd485')
  for (const x of [1160, 1310]) {
    box(c, x, 665, 30, 45, '#1b2937'); box(c, x + 3, 665, 4, 45, '#63727b')
    box(c, x - 6, 709, 42, 5, '#111f2c')
  }
  // The 07-B annex remains underground: continuous platform tiles, rails and service equipment.
  box(c, 1400, 0, 500, 1320, '#303e4b')
  for (let y = 310; y < 1320; y += 32) for (let x = 1400; x < 1900; x += 40) {
    box(c, x, y, 39, 1, '#81929533'); box(c, x, y, 1, 31, '#0e1f2d55')
  }
  box(c, 1400, 0, 500, 180, '#25313d')
  for (let y = 4; y < 180; y += 24) for (let x = 1404; x < 1900; x += 36) box(c, x, y, 34, 22, '#394852')
  box(c, 1400, 180, 500, 120, '#0a121c')
  for (let x = 1410; x < 1900; x += 28) box(c, x, 209, 10, 70, '#3a3c3f')
  box(c, 1400, 222, 500, 4, '#819295'); box(c, 1400, 270, 500, 4, '#819295')
  box(c, 1400, 304, 500, 10, '#baa15c')
  for (let x = 1404; x < 1900; x += 8) box(c, x, 307, 2, 2, '#ead28a')
  for (const x of [1500, 1740]) {
    box(c, x, 151, 108, 8, '#111d28'); box(c, x + 5, 154, 98, 3, '#b6d8d3')
    box(c, x, 925, 13, 99, '#182936'); box(c, x + 3, 928, 3, 91, '#75868b')
    box(c, x - 7, 1024, 27, 7, '#14212d')
  }
  for (const x of [1510, 1770]) {
    for (let i = 0; i < 3; i++) { box(c, x + i * 24, 780, 21, 23, '#49646a'); box(c, x + i * 24, 805, 21, 9, '#607b7b'); box(c, x + i * 24 + 3, 814, 3, 7, '#a6b5af') }
  }
  box(c, 1810, 480, 50, 100, '#192a35'); box(c, 1814, 484, 42, 92, '#596b73')
  for (let y = 490; y < 556; y += 8) box(c, 1820, y, 28, 3, '#253d48')
  box(c, 1820, 562, 6, 5, '#9bd2ae')
  for (const [i, [l, t, r, b]] of BLOCKS.entries()) {
    if (i >= 2) continue
    box(c, l + 7, t + 8, r - l, b - t, '#09131c77')
    box(c, l, t, r - l, b - t, i < 4 ? '#634c48' : '#394450')
    for (let y = t + 8; y < b; y += 12) box(c, l, y, r - l, 1, '#a08a7544')
    for (let x = l + 16; x < r - 16; x += 32) for (let y = t + 15; y < b - 20; y += 44) {
      box(c, x - 3, y - 3, 21, 27, '#162330'); box(c, x, y, 15, 20, i % 2 ? '#b59666' : '#486574')
      box(c, x + 7, y, 2, 20, '#2b3540')
    }
  }
  box(c, CORE.x - 35, CORE.y - 65, 70, 72, '#101d2a'); box(c, CORE.x - 28, CORE.y - 58, 56, 39, '#305158')
  label(c, '07-B', CORE.x, CORE.y - 34, '#baf0d6', 15)
  box(c, CORE.x - 22, CORE.y - 9, 44, 4, '#829a95')
  for (let i = 0; i < 16; i++) { box(c, 660 + i * 43, 931 + i % 3 * 15, 11, 4, '#a8b7a02b') }
}
export function drawActMap(c, time, state) {
  if (!cache) { cache = document.createElement('canvas'); cache.width = 1900; cache.height = 1320; paintExpansion(cache.getContext('2d')) }
  c.drawImage(cache, 0, 0); drawNewYorkStreet(c, time); drawDarkSubway(c, time, state.hunt); drawReturnSubway(c, state.hunt)
  // Containment shutters form a legible boundary to the district until the station is clear.
  if (state.hunt?.phase !== 'departed') {
    box(c, 1390, 0, 18, 1320, '#101c29')
    for (let y = 5; y < 1320; y += 16) box(c, 1391, y, 16, 4, '#918357')
    box(c, 1320, 545, 75, 40, '#14232c'); label(c, '07-B', 1357, 561, '#d5c184'); label(c, 'BLOQUEADO', 1357, 577, '#d4a584', 9)
  } else { label(c, 'CONTENÇÃO DESATIVADA →', 1310, 562, '#98d9c2') }
  for (const m of MEMORIES) if (!state.fragments.includes(m.id)) {
    const bob = Math.sin(time / 420) * 3
    c.shadowColor = '#b0efe5'; c.shadowBlur = 15
    box(c, m.x - 7, m.y - 21 + bob, 14, 20, '#b8d5bd'); c.shadowBlur = 0
    box(c, m.x - 4, m.y - 17 + bob, 8, 2, '#38606a'); box(c, m.x - 4, m.y - 12 + bob, 8, 2, '#38606a')
  }
}
