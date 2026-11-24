// A single steel strip, cut into equal segments joined by hinges.
// Each jamo is described as strokes (segment counts) and the turn between them.
export const SEGMENTS = 16
export const SEG_LEN = 0.5

const DEG = Math.PI / 180

export const SHAPES = {
  flat: { base: 0, strokes: [16], turns: [] },
  'ㄱ': { base: 0, strokes: [8, 8], turns: [-90] },
  'ㄴ': { base: -90, strokes: [8, 8], turns: [90] },
  'ㄷ': { base: 180, strokes: [5, 6, 5], turns: [90, 90] },
  'ㄹ': { base: 0, strokes: [4, 2, 4, 2, 4], turns: [-90, -90, 90, 90] },
  'ㅁ': { base: 0, strokes: [4, 4, 4, 4], turns: [-90, -90, -90] },
}

/**
 * Shape description to radians: base heading plus one angle per hinge.
 * @param {{ base: number, strokes: number[], turns: number[] }} shape
 * @returns {{ base: number, hinges: number[] }}
 */
export function toAngles({ base, strokes, turns }) {
  const hinges = new Array(SEGMENTS - 1).fill(0)
  let end = 0
  strokes.slice(0, -1).forEach((count, k) => {
    end += count
    hinges[end - 1] = turns[k] * DEG
  })
  return { base: base * DEG, hinges }
}

/** Wrap an angle to [-PI, PI] so the strip turns the short way round. */
export function wrapAngle(a) {
  return Math.atan2(Math.sin(a), Math.cos(a))
}

/**
 * Walk the strip and return segment centres, hinge points and the outline,
 * all centred on the shape's bounding box.
 * @param {number} base
 * @param {number[]} hinges
 */
export function layout(base, hinges) {
  let angle = base
  let x = 0
  let y = 0
  const raw = [{ x, y, angle }]
  for (let s = 0; s < SEGMENTS; s++) {
    if (s > 0) angle += hinges[s - 1]
    x += Math.cos(angle) * SEG_LEN
    y += Math.sin(angle) * SEG_LEN
    raw.push({ x, y, angle })
  }

  const xs = raw.map((p) => p.x)
  const ys = raw.map((p) => p.y)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const points = raw.map((p) => ({ x: p.x - cx, y: p.y - cy }))

  const segments = raw.slice(1).map((p, i) => ({
    x: (points[i].x + points[i + 1].x) / 2,
    y: (points[i].y + points[i + 1].y) / 2,
    angle: p.angle,
  }))

  return { segments, joints: points.slice(1, -1), points }
}

/** Outline points for a jamo, for static SVG drawings. */
export function outline(name) {
  const { base, hinges } = toAngles(SHAPES[name])
  return layout(base, hinges).points
}
