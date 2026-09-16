export const BARRIER_RISE_SECONDS = 1.2
export function barrierProgress(s) {
  return s.active ? Math.min(1, Math.max(0, 1 - (s.barrierIntro || 0) / BARRIER_RISE_SECONDS)) : 0
}
export function ruinShake(s, time) {
  const splitQuake=s.phase==='splitting' ? (s.splitTime<.85?4:1) : 0
  const strength = s.active ? Math.max(Math.max(0, s.barrierIntro || 0) / BARRIER_RISE_SECONDS * 5,
    (s.quake||0)*7, splitQuake, s.phase==='tremor'?1.4:s.phase==='undead'?.45:0) : 0
  return { x: Math.sin(time * .071) * strength, y: Math.cos(time * .093) * strength * .7 }
}
const blocks = []
for (let x=1239; x<1601; x+=24) {
  blocks.push([x,279,24,12], [x,607,24,12])
}
for (let y=291; y<607; y+=24) {
  blocks.push([1239,y,16,24], [1585,y,16,24])
}
export function drawRuinBarrier(c,s) {
  if (!s.active) return
  const progress=barrierProgress(s), height=36*(1-Math.pow(1-progress,3))
  c.save()
  blocks.forEach(([x,y,w,d],i)=>{
    const h=height*(.88+(i%3)*.06)
    c.fillStyle='#222d29'; c.fillRect(x-1,y-h-1,w+2,d+h+2)
    c.fillStyle=i%2?'#646e60':'#727965'; c.fillRect(x,y-h,w-1,h+d)
    c.fillStyle='#a8ac8d'; c.fillRect(x,y-h,w-1,5)
    c.fillStyle='#39463c'; c.fillRect(x+w-5,y-h+5,4,h+d-5)
    c.fillRect(x+2,y-h+18,w-8,2)
    c.fillStyle='#536447'; c.fillRect(x+3,y-h+6,6,3)
    if(progress<1) {
      const t=Math.max(0,Math.min(1,progress*1.4-(i%5)*.07))
      for(let j=0;j<2;j++) {
        const px=x+w/2+Math.sin(i*9+j)*t*27
        const py=y+Math.cos(i+j)*t*16-Math.sin(t*Math.PI)*28
        c.globalAlpha=1-t
        c.fillStyle=j?'#b6b398':'#7b816b'; c.fillRect(px,py,4+j*2,4+j*2)
        c.fillStyle='#c7b998'; c.fillRect(x-5,y-t*10,w+8,6)
      }
      c.globalAlpha=1
    }
  })
  c.restore()
}
