import { woodlandTree } from './scenery.js'
import { treeClearOfWater } from './waterClearance.js'
import { FARM_OBSTACLES } from './villageLayout.js'
import { drawFarmGround } from './villageFarmArt.js'

export const VILLAGE_START = { x: 1000, y: 1850 }
export const VILLAGE_OBJECTS = [
  { x: 910, y: 1790, speaker: 'Lia, a guardiã do poço', text: 'Bem-vindo à Vila das Lanternas. Quem chega perdido recebe água e um lugar perto do fogo. O Curandeiro cuida de nós há muitas estações. A trilha ao norte leva de volta à cabana; a ponte do leste continua sendo o caminho para o portão.' },
  { x: 1355, y: 1760, speaker: 'Téo, o carpinteiro', text: 'Reparamos esta ponte para que ninguém precise atravessar a correnteza. As lanternas marcam a trilha mesmo quando a névoa cobre o bosque. A ponte do Guardião, lá a leste, é outra história: aquela só responde ao selo.' },
  { x: 750, y: 1920, speaker: 'Nina, a horticultora', text: 'Plantamos cenouras, couves e flores para as abelhas. As ervas que o Curandeiro procura são silvestres: crescem no bosque, não nestes canteiros. Pode descansar aqui antes de continuar sua busca.' },
  { x: 1150, y: 1955, speaker: 'Mural da vila', text: '“Acender as lanternas ao anoitecer. Devolver os baldes ao poço. Deixar uma tigela de sopa para os viajantes.” Um desenho recente mostra um ratinho com um cajado. Sob ele: “Nenhum fugitivo precisa caminhar sozinho”.' },
  { x: 1030, y: 1830, speaker: 'Poço das Lanternas', text: 'A água devolve seu reflexo, sem prédios nem luzes estranhas. Pela primeira vez desde o laboratório, você ouve apenas o vento, o riacho e as conversas de uma vila que parece ter esperado por você.' },
]
const HOUSES = [[540, 1570, '#9d623b'], [1280, 1570, '#815642'], [1380, 1850, '#a48249']]
const OBSTACLES = [
  ...FARM_OBSTACLES,
  ...HOUSES.map(([x, y]) => [x - 15, y - 5, x + 180, y + 142]),
  [980, 1740, 1080, 1800], [1110, 1860, 1190, 1925],
  [590, 1770, 730, 1850], [790, 1980, 1230, 2020],
  [1220, 1720, 1260, 1770],
  [805, 1680, 870, 1721], [1230, 1810, 1294, 1851],
]
export const VILLAGE_TREES = []
for (let y = 1450; y < 2070; y += 110) for (const x of [110, 290, 410, 1680]) {
  if (x === 1680 && y > 1540) continue
  const tree = [x + y % 47, y, 29 + y % 7]
  if (treeClearOfWater(...tree)) VILLAGE_TREES.push(tree)
}
export function villageWalkable(p) {
  if (p.x > 430 && p.x < 1740 && p.y > 1430 && p.y < 1530 && !(p.x >= 920 && p.x <= 1080)) return false
  if (OBSTACLES.some(([l, t, r, b]) => p.x > l - 12 && p.x < r + 12 && p.y > t - 8 && p.y < b + 12)) return false
  return !VILLAGE_TREES.some(([x, y, r]) => Math.hypot(p.x - x, p.y - y - 12) < r + 12)
}
const box = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h) }
const oval = (c, x, y, rx, ry, color) => { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill() }
const line = (c, points, color, w = 1) => { c.strokeStyle = color; c.lineWidth = w; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke() }
const poly = (c, points, color) => { c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill() }
function barrel(c, x, y) {
  oval(c, x + 3, y + 4, 21, 7, '#172e2855'); box(c, x - 17, y - 32, 34, 32, '#8f612d'); oval(c, x, y - 32, 17, 7, '#d0a35c')
  oval(c, x, y - 32, 12, 4, '#68502b'); for (let i = -12; i < 16; i += 7) line(c, [[x + i, y - 27], [x + i, y - 2]], '#4c381f')
  box(c, x - 18, y - 22, 36, 4, '#788278'); box(c, x - 18, y - 6, 36, 4, '#788278')
}
function crate(c, x, y) {
  box(c, x, y - 34, 38, 34, '#926331'); box(c, x + 3, y - 31, 32, 28, '#b08343')
  for (let i = 7; i < 32; i += 8) box(c, x + i, y - 31, 2, 28, '#624422')
  line(c, [[x + 3, y - 31], [x + 35, y - 3]], '#d0a260', 5); box(c, x, y - 7, 38, 4, '#634929')
}
function house(c, x, y, roof) {
  oval(c, x + 99, y + 136, 115, 26, '#1b312a55')
  box(c, x, y + 25, 170, 115, '#6f4c31')
  for (let yy = y + 28; yy < y + 140; yy += 13) { box(c, x + 3, yy, 164, 10, '#b18c56'); box(c, x + 8, yy + 2, 153, 1, '#d3b37b44') }
  for (const xx of [x + 6, x + 155]) box(c, xx, y + 23, 9, 119, '#443922')
  box(c, x + 69, y + 77, 38, 63, '#3f3425'); box(c, x + 74, y + 82, 28, 55, '#745431'); oval(c, x + 98, y + 113, 2, 2, '#e6c76e')
  for (const xx of [x + 20, x + 120]) {
    box(c, xx, y + 68, 31, 34, '#3c3526'); box(c, xx + 4, y + 72, 23, 25, '#f4c977'); box(c, xx + 14, y + 71, 3, 28, '#785134'); box(c, xx, y + 82, 31, 3, '#785134')
    box(c, xx - 2, y + 106, 36, 10, '#624b2b'); for (let i = 0; i < 5; i++) { oval(c, xx + 3 + i * 6, y + 105, 4, 5, '#73824c'); oval(c, xx + 3 + i * 6, y + 101, 2, 2, i % 2 ? '#e5b3a0' : '#dab860') }
  }
  poly(c, [[x - 17, y + 50], [x + 30, y - 24], [x + 139, y - 24], [x + 187, y + 50]], '#3d3328')
  for (let row = 0; row < 6; row++) {
    const left = x + 26 - row * 8; const top = y - 20 + row * 12; const width = 117 + row * 16
    box(c, left, top, width, 11, roof); line(c, [[left, top], [left + width, top]], '#d9ad6855', 2)
    for (let col = 16; col < width; col += 23) line(c, [[left + col, top + 1], [left + col - 2, top + 10]], '#402d2855', 2)
  }
  box(c, x + 134, y - 48, 22, 43, '#858673'); for (let i = 0; i < 4; i++) box(c, x + 135, y - 44 + i * 10, 21, 2, '#434c42')
  box(c, x + 129, y - 50, 32, 7, '#4e594b')
  for (let i = 0; i < 3; i++) box(c, x + 64 - i * 4, y + 142 + i * 5, 48 + i * 8, 4, '#a7a184')
}
let cached
function paint(c) {
  // Broad trail from the original forest and a compact village square.
  // The approach is painted by woodlandGround with the same continuous trail as the forest.
  oval(c, 1010, 1800, 450, 200, '#798154'); oval(c, 1010, 1800, 365, 158, '#bea970')
  line(c, [[630, 1740], [1000, 1730], [1455, 1790], [1500, 1990], [900, 1950], [650, 1900]], '#c7b47b', 60)
  for (let i = 0; i < 420; i++) { const x = 560 + (i * 71 % 1000); const y = 1580 + (i * 43 % 430); box(c, x, y, 5 + i % 8, 2, i % 3 ? '#77734122' : '#e9d49444') }
  // Turquoise tributary, stone banks and stepping waterfalls.
  box(c, 430, 1420, 1310, 118, '#414e40'); box(c, 430, 1430, 1310, 100, '#167885')
  for (let x = 430; x < 1740; x += 30) for (const y of [1420, 1522]) { oval(c, x, y, 20, 12, '#515847'); oval(c, x - 3, y - 3, 15, 8, '#8b8c69') }
  // Stone bridge with masonry and three arches, kept aligned with the collision opening.
  box(c, 910, 1360, 180, 250, '#343f3d'); box(c, 920, 1350, 160, 253, '#959b87')
  for (let y = 1350; y < 1603; y += 23) for (let x = 920; x < 1080; x += 32) { box(c, x + 1, y + 1, 30, 21, '#788578'); box(c, x + 3, y + 3, 26, 2, '#b6bba0') }
  for (const x of [916, 1080]) for (let y = 1340; y < 1605; y += 28) { box(c, x, y, 9, 25, '#48584e'); box(c, x, y, 9, 4, '#b2b397') }
  for (const x of [946, 986, 1026]) { oval(c, x + 12, 1607, 15, 13, '#263c37'); box(c, x - 3, 1607, 30, 11, '#263c37') }
  drawFarmGround(c)
  HOUSES.forEach(([x, y, roof]) => house(c, x, y, roof))
  // Covered well with rope, bucket and stone courses.
  oval(c, 1030, 1783, 53, 25, '#6b6953'); oval(c, 1030, 1770, 50, 22, '#b3a47a'); oval(c, 1030, 1770, 36, 15, '#223f39')
  for (const x of [985, 1070]) box(c, x, 1703, 8, 72, '#674b28')
  poly(c, [[966, 1710], [985, 1680], [1071, 1680], [1093, 1710]], '#9b7439'); for (let x = 984; x < 1080; x += 13) line(c, [[x, 1685], [x - 9, 1708]], '#d0a65e', 2)
  line(c, [[1030, 1710], [1030, 1760]], '#c9b788', 2); barrel(c, 1100, 1810)
  // Produce stall, crates, sacks, training dummy and flower beds.
  box(c, 590, 1790, 140, 60, '#73512c'); for (let i = 0; i < 8; i++) box(c, 595 + i * 16, 1796, 12, 40, '#a77e41')
  for (let i = 0; i < 7; i++) { box(c, 587 + i * 21, 1750, 22, 30, i % 2 ? '#d1bb85' : '#7b8552'); oval(c, 600 + i * 18, 1790, 7, 5, i % 2 ? '#cba056' : '#8c9a59') }
  for (const [x, y] of [[760, 1810], [1280, 1745], [1320, 1720], [1535, 2030]]) { barrel(c, x, y); crate(c, x + 23, y + 15) }
  box(c, 1110, 1855, 80, 66, '#4e3e27'); box(c, 1116, 1860, 68, 50, '#ad8648')
  for (let i = 0; i < 6; i++) box(c, 1121 + i % 3 * 20, 1865 + Math.floor(i / 3) * 22, 15, 16, '#d5c399')
  for (const x of [1110, 1180]) box(c, x, 1910, 7, 26, '#68532e')
  for (let x = 800; x < 1230; x += 29) { box(c, x, 1980, 24, 40, '#655739'); for (let y = 1986; y < 2016; y += 12) { oval(c, x + 12, y, 9, 5, '#6b8846'); box(c, x + 11, y, 3, 7, '#bc8644') } }
  box(c, 1235, 1710, 5, 60, '#745834'); line(c, [[1216, 1722], [1257, 1722]], '#907546', 6); oval(c, 1237, 1707, 10, 11, '#d2b574'); oval(c, 1237, 1699, 19, 4, '#856b37')
  for (const [x, y] of [[770, 1640], [1200, 1630], [830, 1880], [1300, 1940]]) {
    box(c, x, y - 80, 6, 80, '#735832'); line(c, [[x - 22, y - 72], [x + 22, y - 72]], '#95713d', 5)
    for (const dx of [-18, 18]) { box(c, x + dx - 5, y - 61, 11, 16, '#574630'); box(c, x + dx - 3, y - 58, 7, 10, '#f4cc74') }
  }
  // Resting benches, tied hay and the gardener's wheelbarrow beside the crop rows.
  for (const [x, y] of [[805, 1700], [1230, 1830]]) {
    for (let i = 0; i < 3; i++) box(c, x, y - 22 + i * 7, 64, 5, '#b38c49')
    box(c, x, y + 2, 64, 10, '#826031'); box(c, x + 4, y + 12, 5, 9, '#4c4228'); box(c, x + 55, y + 12, 5, 9, '#4c4228')
  }
  for (let i = 0; i < 3; i++) {
    const x = 590 + i * 34; oval(c, x, 1960, 25, 14, '#9c843e'); oval(c, x - 2, 1956, 23, 12, '#c1a35b')
    line(c, [[x - 6, 1944], [x - 7, 1968]], '#75613a', 3)
  }
  poly(c, [[1290, 1988], [1340, 1988], [1327, 2012], [1298, 2012]], '#a27b40'); oval(c, 1329, 2019, 10, 10, '#504630')
  line(c, [[1284, 2007], [1350, 2007]], '#c4a261', 4)
  for (const [x, y, r] of VILLAGE_TREES) woodlandTree(c, x, y, r, x % 12)
}
export function drawVillage(c, time) {
  if (!cached) { cached = document.createElement('canvas'); cached.width = 2200; cached.height = 2100; paint(cached.getContext('2d')) }
  c.drawImage(cached, 0, 0)
  for (let i = 0; i < 90; i++) {
    const x = 440 + (i * 47 + time / 75) % 1290; const y = 1440 + i * 23 % 78
    if (x > 905 && x < 1100) continue
    box(c, x, y, 5 + i % 11, 2, i % 3 ? '#62c6c688' : '#c4ede0aa')
  }
  for (const x of [485, 1550]) {
    box(c, x, 1412, 36, 27, '#379fab')
    for (let i = 0; i < 5; i++) box(c, x + i * 7, 1412 + (time / 38 + i * 3) % 18, 3, 13, '#a6e5dbb0')
    oval(c, x + 18, 1440, 24, 5 + Math.sin(time / 230), '#afe4d69a')
  }
}
