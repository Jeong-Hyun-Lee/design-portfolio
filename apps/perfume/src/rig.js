// Scroll and UI state shared between the DOM sections and the single fixed WebGL scene.
// Plain mutable object: written by ScrollTrigger callbacks, read every frame in useFrame,
// so scrolling never re-renders React.

export const rig = {
  stage: 0, // 0 hero, 1 notes, 2 anatomy, 3 atelier (light), 4 closing
  notes: 0, // 0..1 progress through the notes section
  anatomy: 0, // 0..1 progress through the exploded view
  velocity: 0, // scroll velocity, px/s
  explode: 0, // 0..1 how far the bottle is taken apart (written by Bottle, read by Effects)
}

export const STAGES = { hero: 0, notes: 1, anatomy: 2, atelier: 3, closing: 4 }

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (t) => t * t * (3 - 2 * t)
const mix = (a, b, t) => a + (b - a) * t

/**
 * Bottle placement per stage, in fractions of the visible viewport (x of width, y of height)
 * so the same keyframes work for any aspect. Portrait screens stack text under the bottle.
 * @param {boolean} isPortrait
 */
export function stageKeyframes(isPortrait) {
  return isPortrait
    ? [
        { x: 0, y: -0.08, scale: 0.52 },
        { x: 0, y: 0.23, scale: 0.5 },
        { x: 0, y: 0.2, scale: 0.4 },
        { x: 0, y: 0.24, scale: 0.5 },
        { x: 0, y: -1.4, scale: 0.5 },
      ]
    : [
        { x: 0, y: -0.03, scale: 0.8 },
        { x: 0.2, y: 0, scale: 0.82 },
        { x: 0.2, y: -0.01, scale: 0.56 },
        { x: -0.2, y: -0.06, scale: 0.72 },
        { x: -0.2, y: -1.4, scale: 0.6 },
      ]
}

/**
 * Pose at a fractional stage, eased between neighbouring keyframes.
 * @param {number} stage
 * @param {{ x: number, y: number, scale: number }[]} frames
 */
export function poseAt(stage, frames) {
  const s = Math.min(frames.length - 1, Math.max(0, stage))
  if (s === frames.length - 1) return { ...frames[s] }
  const i = Math.min(frames.length - 2, Math.floor(s))
  const t = smooth(s - i)
  const a = frames[i]
  const b = frames[i + 1]
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), scale: mix(a.scale, b.scale, t) }
}

/** 0 dark, 1 light: the light walls only exist between the anatomy and closing stages. */
export function lightness(stage) {
  return clamp01(stage - 2) * (1 - clamp01(stage - 3))
}

/**
 * Particle shape blend: 0 cloud (hero), 1 top, 2 middle, 3 base note.
 * @param {number} stage
 * @param {number} notes progress through the notes section
 */
export function noteBlend(stage, notes) {
  return clamp01(stage) + clamp01(notes) * 2
}

/** Particle visibility: faint glints in the hero, full in notes, gone after anatomy starts. */
export function particleOpacity(stage) {
  if (stage <= 1) return mix(0.15, 1, clamp01(stage))
  return 1 - clamp01((stage - 1) * 1.6)
}
