// Grid-aligned artwork: crossed logs and stepped flames, inspired by the reference.
function pixels(c, points, color) {
  c.fillStyle = color; c.beginPath()
  points.forEach(([x, y], i) => i ? c.lineTo(x * 2, y * 2) : c.moveTo(x * 2, y * 2))
  c.closePath(); c.fill()
}
const box = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x * 2, y * 2, w * 2, h * 2) }

export function campfireEmber(time, index) {
  const life = 1400 + index % 4 * 290
  const progress = ((Math.max(0,time) + index * 347) % life) / life
  return {
    x: Math.round((index % 5 - 2) * 5 + Math.sin(progress * 5 + index) * (3 + progress * 9)),
    y: Math.round(-12 - progress * (62 + index % 3 * 17)),
    alpha: Math.sin(progress * Math.PI) * .9,
    size: index % 3 === 0 ? 3 : 2,
  }
}

export function drawPixelCampfire(c, time = 0) {
  const frame = Math.floor(time / 180) % 3
  const pulse = Math.sin(time / 230) * .035 + Math.sin(time / 97) * .015
  const glow = c.createRadialGradient(0, -10, 3, 0, -10, 65 + Math.sin(time/310)*4)
  glow.addColorStop(0, '#ef8c3838'); glow.addColorStop(1, '#ef8c3800')
  c.fillStyle = glow; c.fillRect(-62, -72, 124, 124)
  for(let i=0;i<11;i++) {
    const hot = Math.sin(time/190+i*2.1) > .15
    box(c,-12+i*2.3,3+(i*7%5),2,1,hot?'#ef9b3f':'#a2492c')
  }
  // Dark silhouettes are deliberately stepped, without smooth vector curves.
  const outline = '#241b2a'
  pixels(c, [[-17,-4],[-11,-4],[-11,-2],[-5,-2],[-5,0],[1,0],[1,2],[7,2],[7,4],[13,4],[13,6],[17,6],[17,11],[13,11],[13,10],[8,10],[8,8],[2,8],[2,6],[-4,6],[-4,4],[-10,4],[-10,2],[-17,2]], outline)
  pixels(c, [[12,-5],[16,-5],[16,-3],[19,-3],[19,1],[15,1],[15,3],[10,3],[10,5],[5,5],[5,7],[0,7],[0,9],[-5,9],[-5,12],[-10,12],[-10,14],[-16,14],[-16,12],[-18,12],[-18,7],[-15,7],[-15,5],[-10,5],[-10,3],[-5,3],[-5,1],[1,1],[1,-1],[7,-1],[7,-3],[12,-3]], outline)
  pixels(c, [[-15,-3],[-11,-3],[-11,-1],[-5,-1],[-5,1],[1,1],[1,3],[7,3],[7,5],[13,5],[13,7],[16,7],[16,10],[12,10],[12,8],[7,8],[7,6],[1,6],[1,4],[-5,4],[-5,2],[-11,2],[-11,0],[-15,0]], '#8e4830')
  pixels(c, [[12,-3],[16,-3],[16,-1],[13,-1],[13,1],[8,1],[8,3],[3,3],[3,5],[-2,5],[-2,7],[-7,7],[-7,10],[-12,10],[-12,12],[-16,12],[-16,8],[-13,8],[-13,6],[-8,6],[-8,4],[-3,4],[-3,2],[2,2],[2,0],[7,0],[7,-2],[12,-2]], '#a75a35')
  box(c,-16,8,4,4,'#c28a53'); box(c,-15,9,3,3,'#d4a26a');box(c,13,7,3,3,'#c59a63')
  box(c,-10,5,5,2,'#d27b3d');box(c,5,1,5,2,'#6c3429');box(c,-13,-2,5,2,'#bf7544')
  c.save()
  // Step the silhouette on the pixel grid; only the fire moves, never the logs.
  c.translate([0,2,0,-2][Math.floor(time/140)%4],0)
  c.scale(1,1+pulse)
  // Outer flame curls left before climbing to the narrow red tip.
  pixels(c, [[-8,2],[-8,0],[-11,0],[-11,-5],[-9,-5],[-9,-9],[-6,-9],[-6,-13],[-3,-13],[-3,-17],[-6,-17],[-6,-20],[-3,-20],[-3,-23],[0,-23],[0,-26],[3,-26],[3,-29],[0,-29],[0,-32],[-2,-32],[-2,-35],[0,-35],[0,-39],[3,-39],[3,-33],[5,-33],[5,-30],[8,-30],[8,-25],[5,-25],[5,-22],[2,-22],[2,-19],[5,-19],[5,-16],[8,-16],[8,-19],[10,-19],[10,-15],[12,-15],[12,-10],[13,-10],[13,-4],[11,-4],[11,0],[7,0],[7,2]], outline)
  pixels(c, [[-7,0],[-7,-2],[-9,-2],[-9,-5],[-7,-5],[-7,-9],[-4,-9],[-4,-13],[-1,-13],[-1,-18],[-4,-18],[-4,-20],[-1,-20],[-1,-23],[2,-23],[2,-26],[5,-26],[5,-29],[2,-29],[2,-33],[0,-33],[0,-35],[1,-35],[1,-38],[2,-38],[2,-32],[4,-32],[4,-29],[6,-29],[6,-26],[3,-26],[3,-22],[0,-22],[0,-18],[4,-18],[4,-15],[7,-15],[7,-12],[9,-12],[9,-16],[10,-16],[10,-11],[11,-11],[11,-5],[9,-5],[9,-1],[6,-1],[6,1],[-5,1],[-5,0]], '#e44332')
  pixels(c, [[-5,0],[-5,-2],[-7,-2],[-7,-6],[-5,-6],[-5,-10],[-2,-10],[-2,-14],[1,-14],[1,-18],[3,-18],[3,-13],[6,-13],[6,-9],[9,-9],[9,-5],[7,-5],[7,-1],[4,-1],[4,1],[-3,1],[-3,0]], '#f89028')
  pixels(c, [[-3,0],[-3,-2],[-5,-2],[-5,-6],[-2,-6],[-2,-9],[0,-9],[0,-12+frame],[2,-12+frame],[2,-7],[4,-7],[4,-9],[6,-9],[6,-3],[4,-3],[4,0]], '#ffcf3c')
  pixels(c, [[-1,0],[-1,-2],[-3,-2],[-3,-5],[-1,-5],[-1,-7],[1,-7],[1,-4],[3,-4],[3,-1],[1,-1],[1,0]], '#fff3bd')
  c.restore()
  c.save()
  const alpha = c.globalAlpha
  for(let i=0;i<12;i++) {
    const ember = campfireEmber(time,i)
    c.globalAlpha = alpha * ember.alpha
    c.fillStyle=i%3?'#ffb448':'#ffe6a1'
    c.fillRect(ember.x,ember.y,ember.size,ember.size)
  }
  c.restore()
}
