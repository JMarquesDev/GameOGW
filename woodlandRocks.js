// Authored clusters keep clear stretches of bank instead of a necklace of stones.
export const LAKE_ROCKS = [
  [-153,-63,22,1],[-130,-82,10,4],[-166,-43,8,7],
  [-58,-110,13,3],[-36,-116,6,8],
  [62,-106,26,6],[87,-97,12,2],[49,-120,7,5],
  [177,-18,18,9],[189,4,9,1],
  [155,64,29,4],[175,77,11,8],[134,86,8,3],
  [34,111,11,7],[14,119,5,2],
  [-95,97,24,2],[-121,91,10,5],[-80,115,7,9],
].map(([x,y,size,seed]) => ({x,y,size,seed}))

export const FIRE_ROCKS = [
  [-89,-16,22,8],[-68,-49,26,1],[-20,-65,19,5],[32,-61,25,6],
  [77,-39,20,3],[99,5,26,2],[68,48,23,7],[13,64,29,4],[-45,55,21,9],[-84,31,18,0],
].map(([x,y,size,seed]) => ({x,y,size,seed}))

const noise = n => { const v = Math.sin(n * 91.7 + 17) * 43758.54; return v - Math.floor(v) }
const palettes = [
  ['#353c35','#666c5b','#90947a','#b9b69a'],
  ['#3e4139','#787668','#a3a08a','#cec5a4'],
  ['#303e3c','#566860','#7e9082','#acb6a0'],
]
function polygon(c, points, color) {
  c.fillStyle = color; c.beginPath()
  points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y))
  c.closePath(); c.fill()
}

export function rockOutline(seed) {
  return Array.from({length:7}, (_,i) => {
    const a = i * Math.PI * 2 / 7 + .12
    const r = .83 + noise(seed * 31 + i) * .2
    return [Math.cos(a) * r, Math.sin(a) * r * (.62 + seed % 3 * .1)]
  })
}

export function drawWoodlandRock(c, {x,y,size,seed}, scorched = false) {
  const [dark,base,light,edge] = palettes[seed % palettes.length]
  const points = rockOutline(seed)
  c.save(); c.translate(x,y)
  c.fillStyle = '#20312740'; c.beginPath(); c.ellipse(3,size*.35,size*1.06,size*.4,0,0,Math.PI*2); c.fill()
  c.scale(size,size)
  polygon(c, points, dark)
  polygon(c, points.map(([px,py]) => [px*.89,py*.85-.06]), base)
  const center = [-.12 + noise(seed)*.28, -.07]
  polygon(c,[points[3],points[4],points[5],points[6],center],light)
  polygon(c,[points[0],points[1],points[2],center],dark)
  c.strokeStyle = edge; c.lineWidth = .055; c.beginPath()
  c.moveTo(points[3][0]*.8,points[3][1]*.8-.08)
  c.lineTo(points[4][0]*.86,points[4][1]*.86)
  c.lineTo(points[5][0]*.82,points[5][1]*.82); c.stroke()
  // Branching cracks follow the lit face; small inclusions break up flat facets.
  c.strokeStyle = dark; c.lineWidth = .045; c.beginPath()
  c.moveTo(.1,-.62); c.lineTo(-.07,-.3); c.lineTo(.13,-.06); c.lineTo(.08,.3)
  c.moveTo(-.07,-.3); c.lineTo(-.32,-.23); c.stroke()
  for(let i=0;i<8;i++) {
    const px=(noise(seed*17+i)-.5)*1.15, py=(noise(seed*23+i)-.5)*.7
    c.fillStyle=i%3 ? base : edge; c.fillRect(px,py,.045+i%2*.025,.035)
  }
  polygon(c,[[-.68,.13],[-.43,.05],[-.32,.18],[-.03,.22],[-.1,.36],[-.51,.39]],scorched?'#514c38':'#526a3e')
  for(let i=0;i<5;i++) {
    c.fillStyle=scorched?'#776548':'#91a267'
    c.fillRect(-.58+i*.1,.2+noise(seed+i)*.1,.06,.04)
  }
  c.restore()
}

export function drawLakeBank(c) {
  for(const rock of [...LAKE_ROCKS].sort((a,b)=>a.y-b.y)) {
    drawWoodlandRock(c,rock)
    // Small chips close to each group, not distributed at equal angular intervals.
    drawWoodlandRock(c,{x:rock.x+rock.size+4,y:rock.y+4,size:3+rock.seed%3,seed:rock.seed+10})
  }
  for(const [x,y,count] of [[-169,27,4],[-110,-89,2],[114,-88,3],[82,109,4],[-52,113,2]]) {
    for(let j=0;j<count;j++) {
      const px=x+j*5, height=15+(j*7+count)%14
      c.strokeStyle=j%2?'#9bad65':'#65824d'; c.lineWidth=2; c.beginPath()
      c.moveTo(px,y); c.lineTo(px+(j%2?4:-3),y-height); c.stroke()
      c.fillStyle='#796342'; c.fillRect(px+(j%2?3:-4),y-height-5,3,7)
    }
  }
}
