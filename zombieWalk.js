import { keyGolemMatte, deathFrameIndex } from './golemDeath.js'

export const ZOMBIE_WALKS = {
  crawler: { path:'/assets/crawler-walk.gif', crop:[25,15,150,110] },
  withered: { path:'/assets/withered-walk.gif', crop:[65,0,110,135] },
  shambler: { path:'/assets/shambler-walk.gif', crop:[71,20,78,96] },
}
const clips={}
export function keyZombieMatte(pixels, id) {
  // Crawler includes RGB 72/72/85 in its matte. Keep Withered unchanged.
  keyGolemMatte(pixels, id === 'crawler' ? 76 : 40)
}
let loading
export function preloadZombieWalks() {
  if(loading || typeof ImageDecoder==='undefined') return loading
  loading=Promise.all(Object.entries(ZOMBIE_WALKS).map(async([id,config])=>{
    const frames=[]
    let decoder
    try {
      const response=await fetch(config.path)
      if(!response.ok) throw new Error(`GIF: ${response.status}`)
      decoder=new ImageDecoder({data:await response.arrayBuffer(),type:'image/gif'})
      await decoder.tracks.ready
      const surface=document.createElement('canvas'),context=surface.getContext('2d',{willReadFrequently:true})
      let end=0
      for(let i=0;i<decoder.tracks.selectedTrack.frameCount;i++) {
        const {image}=await decoder.decode({frameIndex:i})
        try {
          surface.width=image.displayWidth;surface.height=image.displayHeight
          context.drawImage(image,0,0)
          const pixels=context.getImageData(0,0,surface.width,surface.height)
          keyZombieMatte(pixels,id);context.putImageData(pixels,0,0)
          end+=(image.duration||62500)/1e6
          frames.push({bitmap:await createImageBitmap(surface),end})
        } finally {image.close()}
      }
      clips[id]={frames,duration:end}
    } catch(error) {
      frames.forEach(frame=>frame.bitmap.close())
      console.warn(`Animação ${id} indisponível; usando sprite base.`,error)
    } finally {decoder?.close()}
  }))
  return loading
}
export function updateZombieWalk(z,before,dt) {
  z.walking=!z.emerge && !z.windup && Math.hypot(z.x-before.x,z.y-before.y)>.001
  z.walkTime=z.walking?(z.walkTime||0)+dt:0
}
export function drawZombieWalk(c,z,type) {
  const clip=clips[type.id],config=ZOMBIE_WALKS[type.id]
  if(!z.walking || !clip) return false
  const frame=clip.frames[deathFrameIndex(clip.frames,z.walkTime%clip.duration)]
  const [sx,sy,sw,sh]=config.crop,w=type.height*sw/sh
  c.drawImage(frame.bitmap,sx,sy,sw,sh,z.x-w/2,z.y-type.height,w,type.height)
  return true
}
