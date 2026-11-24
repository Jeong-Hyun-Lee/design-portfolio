import * as THREE from 'three'
import { BRAND, BRAND_LATIN } from '../content.js'

// Text drawn to canvases, so web fonts render inside WebGL with no font files or CDN fetches
// of our own (the page's Google Fonts stylesheet is reused). Works from file://.

const SANS = '"IBM Plex Sans KR", system-ui, sans-serif'
const SERIF = 'Hahmlet, "Noto Serif KR", Georgia, serif'
const LOGO = 'Marcellus, Optima, Georgia, serif' // logotype face, same as the closing 3D mark

/** Resolves once the faces are usable on a canvas (or immediately if the API is missing). */
export function fontsReady() {
  if (!document.fonts?.load) return Promise.resolve()
  return Promise.all([
    document.fonts.load(`300 100px ${SANS}`, '새벽볕 EAU DE PARFUM'),
    document.fonts.load(`400 100px ${SERIF}`, '지안에게'),
    document.fonts.load(`400 100px ${LOGO}`, BRAND),
  ]).catch(() => undefined) // a missing font only means the fallback face is used
}

function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** The hero's giant logotype, placed behind the bottle so the glass refracts it. 2:1 aspect. */
export function heroTitleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fffdf9'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // fit the word to the canvas width whatever the face's proportions
  ctx.font = `400 100px ${LOGO}`
  const px = Math.min(560, (100 * 1900) / ctx.measureText(BRAND).width)
  ctx.font = `400 ${px}px ${LOGO}`
  ctx.fillText(BRAND, 1024, 470)
  ctx.font = `300 54px ${SANS}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = '22px'
  ctx.fillText(BRAND_LATIN, 1024, 900)
  return canvasTexture(canvas)
}

export const LABEL_PX = { width: 512, height: 732 } // same 0.7 aspect as LABEL in bottleShape

/**
 * Frosted print on the front facet. Redrawn into the same canvas when the configuration changes.
 * @param {HTMLCanvasElement} canvas
 * @param {{ no: string, name: string, ml: number, engraving: string }} label
 */
export function drawLabel(canvas, { no, name, ml, engraving }) {
  const { width: w, height: h } = LABEL_PX
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255, 253, 249, 0.92)'
  ctx.strokeStyle = 'rgba(255, 253, 249, 0.6)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const spaced = (px) => {
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`
  }

  ctx.font = `400 104px ${LOGO}`
  spaced(2)
  ctx.fillText(BRAND, w / 2, 200, w - 48)

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w / 2 - 60, 270)
  ctx.lineTo(w / 2 + 60, 270)
  ctx.stroke()

  ctx.font = `300 40px ${SANS}`
  spaced(2)
  ctx.fillText(`${no}  ${name}`, w / 2, 360)
  ctx.font = `400 20px ${SANS}`
  spaced(8)
  ctx.fillText(BRAND_LATIN, w / 2, 412)
  ctx.font = `300 30px ${SANS}`
  spaced(4)
  ctx.fillText(`${ml} ml`, w / 2, 478)

  if (engraving) {
    ctx.font = `400 44px ${SERIF}`
    spaced(3)
    ctx.fillText(engraving, w / 2, 620, w - 60)
    ctx.font = `400 16px ${SANS}`
    spaced(6)
    ctx.fillText('ENGRAVED FOR', w / 2, 560)
  }
}

export function labelTexture() {
  const canvas = document.createElement('canvas')
  return { canvas, texture: canvasTexture(canvas) }
}
