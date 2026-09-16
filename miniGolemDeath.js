import { keyGolemMatte, deathFrameIndex } from './golemDeath.js'
export const MINI_DEATH_DURATION=4
export const MINI_DEATH_PATH='/assets/mini-golem-death.gif'
let frames=[],loading
export function preloadMiniDeath() {
  if(loading || typeof ImageDecoder==='undefined') return loading
  loading=(async()=>{
    const response=await fetch(MINI_DEATH_PATH)
    if(!response.ok) throw new Error(`GIF: ${response.status}`)
    const decoder=new ImageDecoder({data:await response.arrayBuffer(),type:'image/gif'})
    const decoded=[]
    try {
      await decoder.tracks.ready
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true})
      let end=0
      for(let i=0;i<decoder.tracks.selectedTrack.frameCount;i++) {
        const {image}=await decoder.decode({frameIndex:i})
        try {
          canvas.width=image.displayWidth;canvas.height=image.displayHeight;ctx.drawImage(image,0,0)
          const pixels=ctx.getImageData(0,0,canvas.width,canvas.height)
          keyGolemMatte(pixels);ctx.putImageData(pixels,0,0)
          end+=(image.duration||62500)/1e6
          decoded.push({bitmap:await createImageBitmap(canvas),end})
        } finally {image.close()}
      }
      frames=decoded
    } catch(error){decoded.forEach(f=>f.bitmap.close());throw error}
    finally{decoder.close()}
  })().catch(error=>console.warn('GIF do golem menor indisponível; usando efeito de reserva.',error))
  return loading
}
export function updateMiniDeaths(fragments,dt) {
  for(const f of fragments) if(f.hp<=0) {
    if(f.deathRemaining==null) {
      f.deathRemaining=MINI_DEATH_DURATION;f.moving=false;f.windup=0;f.punch=0;f.slam=0
    }
    f.deathRemaining=Math.max(0,f.deathRemaining-dt)
  }
}
export function miniDeathsComplete(fragments) {
  return fragments.length>0 && fragments.every(f=>f.hp<=0 && f.deathRemaining===0)
}
export function drawMiniDeath(c,f,fallback) {
  if(!(f.deathRemaining>0)) return
  const elapsed=MINI_DEATH_DURATION-f.deathRemaining
  c.save();c.imageSmoothingEnabled=false
  if(frames.length) {
    const frame=frames[deathFrameIndex(frames,elapsed)]
    c.drawImage(frame.bitmap,f.x-44,f.y-45,88,49.5)
  } else if(fallback) {
    c.globalAlpha=f.deathRemaining/MINI_DEATH_DURATION
    c.drawImage(fallback,f.x-40,f.y-68+elapsed*9,80,73-elapsed*9)
  }
  c.restore()
}
