// Cabin art shares its furniture footprints with navigation.
export const CABIN_FURNITURE = [
  [92, 325, 355, 525], [88, 78, 330, 212], [420, 60, 600, 188],
  [595, 305, 835, 470], [830, 52, 1055, 210], [875, 438, 1035, 540],
  [395, 239, 538, 320], [950, 270, 1066, 410], [672, 56, 824, 170],
]
// Coordinates anchor the feet; keep the 63px-tall upper body below the wall
// and allow horizontal clearance for the widest running frame.
export const CABIN_PLAYER_LIMITS = { left: 88, right: 1064, top: 267, bottom: 583 }
export function cabinWalkable(p) {
  const { left, right, top, bottom } = CABIN_PLAYER_LIMITS
  return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom
    && !CABIN_FURNITURE.some(([l, t, r, b]) => p.x > l - 15 && p.x < r + 15 && p.y > t - 15 && p.y < b + 15)
}
const TAU = Math.PI * 2
const box = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h) }
function poly(c, points, color) { c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill() }
function oval(c, x, y, rx, ry, color) { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill() }
function line(c, points, color, width = 1) { c.strokeStyle = color; c.lineWidth = width; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke() }
function round(c, x, y, w, h, radius, color) { c.fillStyle = color; c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill() }
function glow(c, x, y, radius, color) { const g = c.createRadialGradient(x, y, 2, x, y, radius); g.addColorStop(0, color); g.addColorStop(1, '#ffc96b00'); c.fillStyle = g; c.fillRect(x - radius, y - radius, radius * 2, radius * 2) }
function bottle(c, x, y, color, size = 1) {
  c.save(); c.translate(x, y); c.scale(size, size)
  oval(c, 1, 0, 11, 4, '#140f1844'); round(c, -8, -19, 16, 19, 5, '#a6c2b359')
  round(c, -6, -11, 12, 9, 3, color); box(c, -3, -26, 6, 9, '#a5b7a3'); box(c, -4, -28, 8, 4, '#b39354')
  line(c, [[-5, -17], [-5, -7]], '#fff5ca99', 2); box(c, -4, -9, 8, 5, '#ead5a3aa'); c.restore()
}
function vine(c, x, y, length, flip = 1) {
  line(c, [[x, y], [x + 9 * flip, y + length * .3], [x - 6 * flip, y + length * .6], [x + 2, y + length]], '#35472e', 3)
  for (let i = 0; i < length / 10; i += 1) {
    const py = y + i * 10; const px = x + Math.sin(i * .8) * 7; const sign = i % 2 ? 1 : -1
    poly(c, [[px, py + 6], [px + sign * 12, py - 3], [px + sign * 14, py + 7], [px + sign * 5, py + 13]], i % 3 ? '#607d40' : '#8fa750')
    line(c, [[px, py + 6], [px + sign * 10, py + 4]], '#b9ba6444')
  }
}
function rug(c, x, y, w, h) {
  box(c, x + 4, y + 5, w, h, '#22191a55'); box(c, x, y, w, h, '#713f30'); box(c, x + 4, y + 4, w - 8, h - 8, '#d1ae64')
  box(c, x + 13, y + 12, w - 26, h - 24, '#a95735')
  for (let i = 0; i < w; i += 5) { line(c, [[x + i, y - 5], [x + i, y + 2]], '#d9c088'); line(c, [[x + i, y + h - 1], [x + i, y + h + 5]], '#d9c088') }
  for (let i = 18; i < w - 18; i += 27) {
    poly(c, [[x + i, y + 11], [x + i + 5, y + 5], [x + i + 10, y + 11], [x + i + 5, y + 16]], '#6a4937')
    poly(c, [[x + i, y + h - 11], [x + i + 5, y + h - 16], [x + i + 10, y + h - 11], [x + i + 5, y + h - 5]], '#6a4937')
  }
  const mid = y + h / 2
  for (let i = 35; i < w - 25; i += 48) {
    poly(c, [[x + i - 19, mid], [x + i, mid - 22], [x + i + 19, mid], [x + i, mid + 22]], '#334f45')
    poly(c, [[x + i - 9, mid], [x + i, mid - 11], [x + i + 9, mid], [x + i, mid + 11]], '#e0bb74')
  }
  for (let yy = y + 3; yy < y + h; yy += 3) line(c, [[x + 3, yy], [x + w - 3, yy]], '#f2d68c0c')
}
function paintRoom(c) {
  box(c, 0, 0, 1152, 648, '#1b1715')
  // Staggered planks with grain, nail heads and wear.
  for (let row = 0; row < 17; row += 1) for (let col = -1; col < 8; col += 1) {
    const x = 48 + col * 162 + row % 2 * 81; const y = 58 + row * 33
    const colors = ['#745333', '#805c36', '#88623c', '#765036']
    box(c, x, y, 160, 31, colors[(row + col + 8) % 4]); line(c, [[x + 3, y + 2], [x + 157, y + 2]], '#c18b4844')
    for (let n = 0; n < 3; n += 1) line(c, [[x + 7, y + 9 + n * 7], [x + 56, y + 8 + n * 7], [x + 117, y + 11 + n * 7], [x + 153, y + 9 + n * 7]], '#30231928')
    box(c, x + 5, y + 6, 2, 2, '#392a1c'); box(c, x + 153, y + 24, 2, 2, '#392a1c')
  }
  // Timber wall and rafters; kept behind the interactable furniture.
  box(c, 48, 48, 1056, 153, '#593f29')
  for (let x = 52; x < 1104; x += 26) { box(c, x, 51, 24, 142, x % 3 ? '#735034' : '#68452e'); line(c, [[x + 4, 54], [x + 6, 188]], '#bb84442b') }
  box(c, 48, 194, 1056, 10, '#34271c'); box(c, 48, 193, 1056, 2, '#b88947')
  box(c, 0, 0, 1152, 48, '#30251c'); box(c, 0, 0, 48, 648, '#38291d'); box(c, 1104, 0, 48, 648, '#30251c'); box(c, 0, 608, 1152, 40, '#30251c')
  for (const x of [52, 341, 613, 1084]) { box(c, x, 48, 16, 152, '#3c291d'); box(c, x + 3, 50, 3, 145, '#a0743c') }
  line(c, [[48, 57], [571, 13], [1104, 57]], '#aa743b', 10); line(c, [[48, 43], [571, 0], [1104, 43]], '#513923', 10)
  // Large woven hearth rug and bedside runner.
  rug(c, 395, 369, 184, 143); rug(c, 853, 215, 211, 47)
  // Herbal library.
  round(c, 92, 82, 236, 128, 4, '#35241c'); box(c, 102, 90, 215, 110, '#604329')
  for (let row = 0; row < 2; row += 1) {
    const y = 140 + row * 56
    box(c, 110, y - 43, 200, 42, '#2c261e'); box(c, 103, y, 214, 6, '#a67b40')
    for (let i = 0; i < 7; i += 1) {
      const x = 113 + i * 12
      box(c, x, y - 30 - i % 3 * 4, 9, 30 + i % 3 * 4, ['#73544e', '#4f6752', '#b3975b', '#4c596e'][i % 4]); box(c, x + 2, y - 8, 6, 2, '#d9b977')
    }
    for (let i = 0; i < 4; i += 1) bottle(c, 222 + i * 23, y - 1, ['#a85b80', '#70a857', '#dc9952', '#699ba4'][(i + row) % 4], .72)
  }
  // Framed, hand-drawn valley map with pinned notes.
  box(c, 425, 64, 171, 122, '#32271f'); box(c, 431, 70, 159, 110, '#a58045'); box(c, 438, 77, 145, 94, '#d7c18a')
  line(c, [[454, 145], [470, 107], [509, 93], [561, 109], [555, 152], [493, 156], [454, 145]], '#806d46', 2)
  line(c, [[474, 83], [493, 116], [479, 160]], '#5c9295', 3)
  for (let i = 0; i < 8; i += 1) poly(c, [[506 + i * 7, 143], [510 + i * 7, 130 - i % 2 * 7], [514 + i * 7, 143]], '#899565')
  oval(c, 463, 135, 3, 3, '#a45137'); oval(c, 552, 117, 3, 3, '#a45137')
  c.fillStyle = '#694d2b'; c.font = 'bold 8px Georgia'; c.textAlign = 'center'; c.fillText('CAMINHOS DO VALE', 510, 89)
  // Tall window: mountain silhouettes and autumn trees, tied linen curtains.
  box(c, 672, 56, 152, 114, '#33271f'); box(c, 680, 62, 136, 98, '#84a9ae')
  poly(c, [[680, 142], [715, 81], [739, 120], [770, 72], [816, 134], [816, 160], [680, 160]], '#547581')
  poly(c, [[697, 113], [715, 81], [731, 107], [719, 101], [712, 106], [708, 99]], '#e4e5ca')
  poly(c, [[751, 101], [770, 72], [790, 102], [776, 94], [769, 98], [765, 88]], '#f1ecd0')
  for (let i = 0; i < 10; i += 1) oval(c, 686 + i * 14, 149 + i % 3 * 3, 15, 13, ['#7f8b48', '#bd9c49', '#576944'][i % 3])
  box(c, 744, 61, 6, 100, '#80532f'); box(c, 681, 112, 134, 4, '#80532f'); box(c, 667, 163, 162, 8, '#b17e41')
  for (const x of [677, 794]) { poly(c, [[x, 62], [x + 22, 62], [x + 10, 119], [x + 22, 155], [x, 155]], '#d0b37d'); for (let i = 0; i < 3; i += 1) line(c, [[x + i * 6, 66], [x + 6, 121], [x + i * 6, 151]], '#9d794933'); box(c, x, 117, 14, 4, '#ab6439') }
  // Bed: green pillows, burnt-orange quilt and carved footboard.
  round(c, 97, 330, 247, 185, 7, '#3d291d'); box(c, 110, 336, 224, 156, '#b8874a')
  round(c, 122, 345, 200, 148, 7, '#d5c699')
  for (const x of [132, 229]) { round(c, x + 3, 350, 85, 44, 9, '#637653'); round(c, x, 348, 83, 39, 9, '#a7b781'); line(c, [[x + 8, 354], [x + 36, 350], [x + 68, 355]], '#cfd6a0', 2) }
  round(c, 121, 394, 202, 101, 5, '#8d402a'); round(c, 125, 394, 194, 87, 5, '#b95d32')
  for (let i = 0; i < 9; i += 1) line(c, [[136 + i * 20, 397], [130 + i * 20, 421], [137 + i * 20, 463], [131 + i * 20, 480]], i % 2 ? '#df8c4555' : '#70382755', 2)
  box(c, 112, 490, 224, 23, '#88552e'); box(c, 120, 495, 207, 3, '#dca455'); box(c, 112, 510, 13, 14, '#49301f'); box(c, 321, 510, 13, 14, '#49301f')
  // Bench with boots and a folded traveling cloak.
  c.save(); c.translate(30, 0)
  box(c, 377, 272, 12, 48, '#483120'); box(c, 485, 272, 12, 48, '#483120'); round(c, 366, 240, 141, 35, 4, '#9e703c')
  for (let y = 245; y < 273; y += 8) line(c, [[370, y], [502, y]], '#603e26')
  poly(c, [[396, 243], [455, 244], [466, 290], [412, 298]], '#c2a56f')
  for (let x = 413; x < 460; x += 5) line(c, [[x, 254], [x + 4, 292]], '#e2c69588')
  round(c, 382, 300, 17, 13, 3, '#4b3426'); round(c, 403, 303, 17, 13, 3, '#4b3426')
  c.restore()
  // Writing/alchemy table.
  box(c, 626, 352, 14, 117, '#443020'); box(c, 792, 352, 14, 117, '#443020'); oval(c, 719, 350, 113, 42, '#543721'); oval(c, 719, 340, 112, 40, '#ab7a42')
  for (let i = 0; i < 5; i += 1) line(c, [[638, 317 + i * 10], [794, 317 + i * 10]], '#62402033')
  poly(c, [[646, 314], [707, 307], [714, 343], [649, 349]], '#e8d29e')
  for (let i = 0; i < 4; i += 1) line(c, [[657, 321 + i * 5], [698 - i % 2 * 9, 315 + i * 5]], '#957b4c')
  bottle(c, 742, 331, '#a95c91'); bottle(c, 779, 350, '#5da287', .85)
  oval(c, 636, 344, 19, 11, '#57584b'); oval(c, 636, 339, 18, 6, '#9da083'); line(c, [[627, 329], [644, 343]], '#c9c39f', 5)
  box(c, 801, 305, 7, 29, '#ead39c'); oval(c, 804, 335, 11, 3, '#705130')
  // Stone hearth, mantle ceramics and iron firebox.
  round(c, 834, 53, 219, 151, 4, '#353b36')
  for (let row = 0; row < 6; row += 1) for (let col = 0; col < 7; col += 1) {
    const x = 840 + col * 30 + row % 2 * 3; const y = 57 + row * 23
    round(c, x, y, 27, 20, 4, ['#6d756a', '#858879', '#59645d'][(row + col) % 3]); line(c, [[x + 5, y + 2], [x + 22, y + 2]], '#bfc0a34d')
  }
  box(c, 836, 90, 216, 10, '#342f25'); box(c, 833, 87, 222, 6, '#baa073')
  round(c, 883, 109, 111, 91, 12, '#1a2427'); round(c, 894, 125, 88, 71, 5, '#0e171b'); box(c, 901, 144, 74, 47, '#3d2923')
  for (const x of [902, 928, 954]) oval(c, x + 4, 117, 7, 5, '#10191b')
  box(c, 875, 199, 132, 9, '#9a9b82')
  for (let i = 0; i < 5; i += 1) { oval(c, 849 + i % 2 * 14, 174 + Math.floor(i / 2) * 10, 8, 5, '#604328'); oval(c, 849 + i % 2 * 14, 172 + Math.floor(i / 2) * 10, 5, 3, '#c49d60') }
  bottle(c, 857, 85, '#b37443', .85); round(c, 999, 68, 31, 17, 7, '#647873'); oval(c, 1014, 69, 12, 3, '#a3b6a1')
  // Reading couch with a knitted throw, facing inward beside the hearth.
  round(c, 957, 278, 105, 127, 13, '#57332c'); round(c, 967, 284, 82, 103, 10, '#a26846')
  for (let y = 289; y < 382; y += 47) { round(c, 970, y, 68, 42, 5, '#b17a50'); oval(c, 1003, y + 21, 2, 2, '#70412d') }
  round(c, 953, 278, 19, 126, 8, '#804930'); round(c, 1046, 278, 18, 126, 8, '#804930')
  poly(c, [[1009, 289], [1049, 296], [1045, 354], [1006, 380], [987, 366]], '#c6b37d')
  for (let i = 0; i < 11; i += 1) { line(c, [[1012 + i * 3, 295], [1000 + i * 3, 365]], '#f0db9c77'); line(c, [[995 + i * 4, 368], [994 + i * 4, 380]], '#d9c68d') }
  // Brass-banded travel chest.
  round(c, 885, 452, 142, 80, 8, '#503522'); round(c, 894, 453, 123, 35, 12, '#bc8846'); box(c, 894, 480, 123, 45, '#916137')
  for (let y = 491; y < 525; y += 12) line(c, [[896, y], [1015, y]], '#5e3f25', 2)
  for (const x of [902, 998]) { box(c, x, 455, 8, 69, '#c7a95d'); for (let y = 463; y < 523; y += 15) oval(c, x + 4, y, 1.5, 1.5, '#5c4d2e') }
  box(c, 948, 481, 16, 19, '#d5b86c'); oval(c, 956, 489, 2, 3, '#3d3828')
  // Potted ferns and climbing ivy along the rafters.
  for (const [x, y, length] of [[76, 44, 37], [336, 48, 109], [620, 44, 91], [1079, 45, 149]]) vine(c, x, y, length)
  for (let x = 145; x < 1050; x += 117) vine(c, x, 34, 26)
  round(c, 68, 270, 21, 29, 6, '#8c5a38'); for (let i = 0; i < 7; i += 1) line(c, [[79, 275], [60 + i * 6, 247 - i % 3 * 10]], i % 2 ? '#8ba257' : '#567a45', 4)
  // Small sleeping cat on the central rug; purely decorative, no obstruction.
  oval(c, 492, 447, 20, 12, '#292c29'); oval(c, 481, 443, 10, 9, '#33352e')
  poly(c, [[472, 440], [474, 430], [480, 437]], '#33352e'); poly(c, [[481, 438], [488, 430], [489, 442]], '#33352e')
  line(c, [[507, 447], [515, 451], [509, 459], [494, 458]], '#414238', 5)
  // Exit stays in its original location.
  box(c, 518, 576, 116, 35, '#211e18'); for (let x = 525; x < 631; x += 18) box(c, x, 579, 16, 29, '#936738')
  box(c, 518, 574, 116, 4, '#d1a75d'); c.fillStyle = '#e5c284'; c.font = 'bold 10px Georgia'; c.textAlign = 'center'; c.fillText('↓ SAÍDA', 576, 562)
  c.fillStyle = '#ab9774'; c.font = '11px Georgia'; c.fillText('CABANA DO CURANDEIRO', 576, 635)
}
let roomCache
export function renderCabinInterior(c, time, narrative, inspected = []) {
  if (!roomCache) { roomCache = document.createElement('canvas'); roomCache.width = 1152; roomCache.height = 648; paintRoom(roomCache.getContext('2d')) }
  c.save(); c.drawImage(roomCache, 0, 0)
  const flicker = Math.sin(time / 160) * 3 + Math.sin(time / 73)
  for (let i = 0; i < 4; i += 1) poly(c, [[905 + i * 16, 188], [911 + i * 16, 154 + Math.sin(time / 210 + i) * 9], [921 + i * 16, 188]], i % 2 ? '#f4ba54' : '#d57632')
  glow(c, 939, 178, 152, '#f6a74924'); glow(c, 804, 301, 56, '#ffd27025')
  oval(c, 804, 300 + flicker * .2, 3, 6, '#fff0a1')
  // Cauldron rests on the hearth, within the same collision footprint.
  oval(c, 1020, 192, 23, 12, '#1b2929'); oval(c, 1020, 181, 23, 7, '#4f8272'); oval(c, 1020, 180, 18, 5, '#a2d776')
  for (let i = 0; i < 5; i += 1) { const phase = (time / 2400 + i / 5) % 1; oval(c, 1020 + Math.sin(i + phase * 3) * 10, 174 - phase * 44, 2 + phase * 5, 2 + phase * 3, `rgba(181, 223, 153, ${(1 - phase) * .27})`) }
  glow(c, 1020, 180, 50, '#93d0761f')
  // Cool window light crossing warm floorboards.
  c.save(); c.globalCompositeOperation = 'screen'; poly(c, [[688, 170], [805, 170], [744, 291], [592, 291]], '#d9d8a80b'); line(c, [[746, 171], [675, 291]], '#302d2422', 5); c.restore()
  for (let i = 0; i < 16; i += 1) oval(c, 641 + (i * 19 + time / 85) % 169, 182 + (i * 17 + time / 140) % 99, 1, 1, '#f6dfa938')
  if (narrative?.path === 'vale') { bottle(c, 615, 334, '#b4d67b'); glow(c, 615, 325, 28, '#c7d67222') }
  if (narrative?.path === 'home') { line(c, [[443, 245], [462, 259], [480, 245]], '#f3d09b', 2) }
  if (narrative?.path === 'truth') { c.strokeStyle = '#91d5d2'; c.lineWidth = 2; c.beginPath(); c.arc(552, 117, 8 + Math.sin(time / 700), 0, TAU); c.stroke() }
  if (inspected.includes('map')) { c.strokeStyle = '#dabc7977'; c.lineWidth = 1; c.strokeRect(431, 70, 159, 110) }
  if (inspected.includes('chest')) glow(c, 956, 489, 29, '#e3ba5522')
  c.restore()
}
