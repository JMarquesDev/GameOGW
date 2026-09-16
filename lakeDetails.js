import { drawPixelCampfire } from './campfire.js'
import { drawLakeBank, drawWoodlandRock, FIRE_ROCKS } from './woodlandRocks.js'

export function lakeWalkable(p) {
  const dx = p.x - 1410; const dy = p.y - 1110
  const x = dx * Math.cos(.08) - dy * Math.sin(.08)
  const y = dx * Math.sin(.08) + dy * Math.cos(.08)
  return (x / 193) ** 2 + (y / 117) ** 2 >= 1
}
const oval = (c, x, y, rx, ry, color) => { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill() }
export function drawDetailedLake(c, time) {
  c.save(); c.translate(1410, 1110); c.rotate(-.08)
  oval(c, 0, 0, 191, 114, '#56694a'); oval(c, 0, 0, 183, 107, '#8b9170')
  const water = c.createRadialGradient(-55, -40, 3, 25, 15, 190)
  water.addColorStop(0, '#438d87'); water.addColorStop(.45, '#256b70'); water.addColorStop(1, '#143a4b')
  c.fillStyle = water; c.beginPath(); c.ellipse(0, 0, 178, 102, 0, 0, Math.PI * 2); c.fill()
  c.save(); c.clip()
  for (let i = 0; i < 65; i++) {
    const x = (i * 71 % 340) - 170; const y = (i * 37 % 190) - 95
    c.strokeStyle = `rgba(138,218,198,${.08 + .07 * Math.sin(time / 900 + i)})`; c.lineWidth = 1
    c.beginPath(); c.ellipse(x, y, 5 + i % 14, 2 + i % 3, 0, .15, Math.PI * 1.2); c.stroke()
  }
  for (const [x, y] of [[-100, -30], [80, 35], [-35, 60]]) {
    const phase = (time / 2200 + x / 200 + 1) % 1
    c.strokeStyle = `rgba(180,229,214,${(1 - phase) * .35})`; c.beginPath(); c.ellipse(x, y, 4 + phase * 23, 2 + phase * 9, 0, 0, Math.PI * 2); c.stroke()
  }
  for (const [x, y] of [[-125, -28], [-107, -40], [112, 31], [126, 20], [89, 57]]) {
    oval(c, x + 2, y + 2, 12, 6, '#183f3c'); oval(c, x, y, 12, 6, '#83a95b'); c.fillStyle = '#285b50'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 12, y); c.lineTo(x + 8, y + 5); c.fill()
    if (x < -110 || x === 89) { for (let i = 0; i < 5; i++) oval(c, x + Math.cos(i * 1.26) * 4, y - 4 + Math.sin(i * 1.26) * 3, 3, 2, '#ecd1bc'); oval(c, x, y - 4, 2, 2, '#edca72') }
  }
  c.restore()
  drawLakeBank(c)
  c.restore()
}
export function drawStoneFire(c, time) {
  c.save(); c.translate(650, 850)
  oval(c,0,0,122,87,'#627b45')
  oval(c,0,8,49,28,'#514d37')
  oval(c,0,9,36,20,'#39372d')
  for(const rock of FIRE_ROCKS.filter(r=>r.y<0)) drawWoodlandRock(c,rock,true)
  for(let i=0;i<17;i++) {
    const a=i*2.4, r=33+i%4*7
    drawWoodlandRock(c,{x:Math.cos(a)*r,y:Math.sin(a)*r*.6+8,size:2+i%3,seed:i},true)
  }
  drawPixelCampfire(c, time)
  for(const rock of FIRE_ROCKS.filter(r=>r.y>=0)) drawWoodlandRock(c,rock,true)
  c.restore()
}
