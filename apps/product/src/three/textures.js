import * as THREE from 'three'

// Procedural canvas textures, so the 3D room needs no image files (and works on file://).

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Light oak planks running front to back. */
export function makeWoodTexture() {
  const texture = canvasTexture(512, 512, (ctx, w, h) => {
    const rows = 8
    const plank = h / rows
    for (let i = 0; i < rows; i++) {
      ctx.fillStyle = `hsl(30 38% ${58 + Math.random() * 8}%)`
      ctx.fillRect(0, i * plank, w, plank)
      // grain
      for (let g = 0; g < 14; g++) {
        ctx.strokeStyle = `rgba(90, 55, 25, ${0.04 + Math.random() * 0.05})`
        ctx.lineWidth = 1 + Math.random()
        const y = i * plank + Math.random() * plank
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(70, 45, 20, 0.35)'
      ctx.fillRect(0, i * plank, w, 2)
    }
  })
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1.5, 1)
  return texture
}

const MEDIA_DRAW = {
  video(ctx, w, h) {
    const bg = ctx.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, '#26303d')
    bg.addColorStop(1, '#0d1117')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(w * 0.12, h * 0.18, w * 0.36, h * 0.42)
    ctx.fillRect(w * 0.54, h * 0.18, w * 0.34, h * 0.2)
    ctx.beginPath()
    ctx.arc(w / 2, h * 0.45, 58, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(w / 2 - 16, h * 0.45 - 26)
    ctx.lineTo(w / 2 + 28, h * 0.45)
    ctx.lineTo(w / 2 - 16, h * 0.45 + 26)
    ctx.fillStyle = '#111'
    ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, h - 70, w, 70)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(40, h - 64, w - 80, 6)
    ctx.fillStyle = '#ff7714'
    ctx.fillRect(40, h - 64, (w - 80) * 0.42, 6)
    ctx.fillStyle = '#fff'
    ctx.font = '600 26px system-ui, sans-serif'
    ctx.fillText('▶   00:41', 40, h - 22)
  },
  doc(ctx, w, h) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#1f1c1b'
    ctx.fillRect(60, 60, w * 0.45, 34)
    ctx.fillStyle = '#c7c1b7'
    for (let i = 0; i < 9; i++) ctx.fillRect(60, 130 + i * 34, w * (0.38 + (i % 3) * 0.05), 12)
    ctx.strokeStyle = '#ff7714'
    ctx.lineWidth = 4
    const bars = [0.5, 0.75, 0.35, 0.9, 0.62]
    bars.forEach((v, i) => ctx.strokeRect(w * 0.6 + i * 62, h * 0.8 - v * h * 0.5, 40, v * h * 0.5))
    ctx.fillStyle = '#a69b92'
    ctx.font = '500 24px system-ui, sans-serif'
    ctx.fillText('3 / 12', w - 120, h - 36)
  },
}

/** What a placed panel shows: 'video' or 'doc'. ('model' is real geometry, not a texture.) */
export function makeMediaTexture(kind) {
  return canvasTexture(1024, 576, MEDIA_DRAW[kind] ?? MEDIA_DRAW.video)
}
