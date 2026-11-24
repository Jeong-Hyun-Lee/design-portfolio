// Target positions for the scent-note particles, as RGBA float data (xyz + a random seed in w).
// Pure math so it can be tested; NoteParticles uploads them as DataTextures.

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TAU = Math.PI * 2

/** Loose shell of glints around the bottle (hero). */
function cloud(rand) {
  const u = rand() * 2 - 1
  const a = rand() * TAU
  const r = 1.6 + rand() * 1.5
  const s = Math.sqrt(1 - u * u)
  return [Math.cos(a) * s * r, u * r * 0.7, Math.sin(a) * s * r]
}

/** Top note: three helices of sparks spiralling up out of the cap, widening as they rise. */
function top(rand, i) {
  const t = rand()
  const arm = i % 3
  const a = t * 9 + (arm * TAU) / 3 + (rand() - 0.5) * 0.5
  const r = 0.35 + t * 1.15 + (rand() - 0.5) * 0.22
  return [Math.cos(a) * r, -0.3 + t * 2.6 + (rand() - 0.5) * 0.12, Math.sin(a) * r]
}

/** Middle note: a cupped magnolia of six petals, plus an inner ring of six offset by half. */
function middle(rand, i) {
  const isInner = i % 3 === 0
  const petals = 6
  const k = Math.floor(rand() * petals)
  const u = rand()
  const v = rand() * 2 - 1
  const length = isInner ? 1.0 : 1.7
  const width = Math.sin(Math.PI * u) * (isInner ? 0.35 : 0.55)
  const radial = 0.68 + u * length
  const lift = u * u * (isInner ? 1.3 : 0.9)
  const a = ((k + (isInner ? 0.5 : 0)) / petals) * TAU
  // petal-local (radial, tangential) rotated around the bottle
  const tx = -Math.sin(a) * v * width
  const tz = Math.cos(a) * v * width
  return [Math.cos(a) * radial + tx, 0.05 + lift + (rand() - 0.5) * 0.04, Math.sin(a) * radial + tz]
}

/** Base note: concentric ripples on still water under the bottle (윤슬 itself). */
function base(rand) {
  const ring = Math.floor(rand() * 7)
  const a = rand() * TAU
  const r = 0.85 + ring * 0.36 + (rand() - 0.5) * 0.05
  return [Math.cos(a) * r, -1.02 + Math.sin(a * 3 + ring) * 0.035, Math.sin(a) * r]
}

const SHAPES = { cloud, top, middle, base }

/**
 * @param {number} count particle count (size * size of the simulation texture)
 * @param {number} [seed]
 * @returns {Record<'cloud'|'top'|'middle'|'base', Float32Array>} count * 4 floats each
 */
export function makeTargets(count, seed = 7) {
  const out = {}
  for (const [name, shape] of Object.entries(SHAPES)) {
    const rand = mulberry32(seed + name.length * 101)
    const data = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      const [x, y, z] = shape(rand, i)
      data.set([x, y, z, rand()], i * 4)
    }
    out[name] = data
  }
  return out
}
