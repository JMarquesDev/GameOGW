export const GOLEM_DEATH_PATH = '/assets/golem-death.gif'
export const GOLEM_DEATH_DURATION = 4
let frames = []
let loading

// The supplied GIF has an opaque, dithered dark matte (eight RGB colors).
// Key that matte during decoding, not with globalAlpha (which fades the golem).
export function keyGolemMatte({ data, width, height }, redGreenLimit = 40) {
  const matte = new Uint8Array(width * height)
  for (let i = 0; i < matte.length; i++) {
    const p = i * 4
    matte[i] = Number(data[p] <= redGreenLimit && data[p + 1] <= redGreenLimit && data[p + 2] <= 90)
  }
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x
    if (!matte[i]) continue
    // Keep one dark outline pixel beside opaque stone/debris highlights.
    let outline = false
    for (let dy = -1; dy <= 1 && !outline; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !matte[ny * width + nx] && data[(ny * width + nx) * 4 + 3]) { outline = true; break }
    }
    if (!outline) data[i * 4 + 3] = 0
  }
}

// drawImage(HTMLImageElement) does not reliably advance animated GIFs on canvas.
// Decode each composited frame once and select it using the battle's clock.
export function preloadGolemDeath() {
  if (loading || typeof ImageDecoder === 'undefined') return loading
  loading = (async () => {
    const response = await fetch(GOLEM_DEATH_PATH)
    if (!response.ok) throw new Error(`GIF: ${response.status}`)
    const decoder = new ImageDecoder({ data: await response.arrayBuffer(), type: 'image/gif' })
    const decoded = []
    try {
      await decoder.tracks.ready
      const surface = document.createElement('canvas')
      const context = surface.getContext('2d', { willReadFrequently: true })
      let end = 0
      for (let i = 0; i < decoder.tracks.selectedTrack.frameCount; i++) {
        const { image } = await decoder.decode({ frameIndex: i })
        try {
          end += (image.duration || 62500) / 1e6
          surface.width = image.displayWidth; surface.height = image.displayHeight
          context.drawImage(image, 0, 0)
          const pixels = context.getImageData(0, 0, surface.width, surface.height)
          keyGolemMatte(pixels)
          context.putImageData(pixels, 0, 0)
          decoded.push({ bitmap: await createImageBitmap(surface), end })
        } finally { image.close() }
      }
      frames = decoded
    } catch (error) {
      decoded.forEach(frame => frame.bitmap.close())
      throw error
    } finally { decoder.close() }
  })().catch(error => { console.warn('Animação do golem indisponível; usando despedaçamento de reserva.', error) })
  return loading
}

export function deathFrameIndex(timeline, elapsed) {
  const index = timeline.findIndex(frame => elapsed < frame.end)
  return index < 0 ? timeline.length - 1 : index
}

export function drawGolemDeath(c, s) {
  if (!frames.length) return false
  const elapsed = Math.max(0, GOLEM_DEATH_DURATION - s.splitTime)
  const frame = frames[deathFrameIndex(frames, elapsed)]
  c.save(); c.imageSmoothingEnabled = false
  // Preserve the GIF's full 240x135 composition; align the giant's feet.
  c.drawImage(frame.bitmap, s.boss.x - 144, s.boss.y - 140, 288, 162)
  c.restore()
  return true
}
