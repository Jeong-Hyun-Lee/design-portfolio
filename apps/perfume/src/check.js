// `npm run check -w apps/perfume`: invariants of the pure modules the 3D scene is built from.
import assert from 'node:assert/strict'
import { GLASS, LIQUID, LIQUID_Y, CAP, COLLAR, volumeScale, explodeOffsets } from './three/bottleShape.js'
import { makeTargets } from './three/noteShapes.js'
import { STROKES, WORDMARK_SIZE } from './three/wordmark.js'
import { poseAt, stageKeyframes, lightness, noteBlend, particleOpacity } from './rig.js'
import { cleanEngraving } from './config.js'
import { ENGRAVING_MAX } from './content.js'

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)

// lathe profiles: closed on the axis, rising, positive radius
for (const [name, profile] of [['GLASS', GLASS], ['LIQUID', LIQUID]]) {
  assert.equal(profile[0][0], 0, `${name} starts on the axis`)
  assert.equal(profile.at(-1)[0], 0, `${name} ends on the axis`)
  profile.slice(1).forEach(([r, y], i) => {
    assert.ok(y >= profile[i][1], `${name} y never goes down at ${i + 1}`)
    assert.ok(r >= 0)
  })
}

// the liquid sits strictly inside the glass at every height it occupies
const glassRadiusAt = (y) => {
  for (let i = 1; i < GLASS.length; i++) {
    const [r0, y0] = GLASS[i - 1]
    const [r1, y1] = GLASS[i]
    if (y >= y0 && y <= y1 && y1 > y0) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0)
  }
  return 0
}
LIQUID.filter(([r]) => r > 0).forEach(([r, y]) => assert.ok(r < glassRadiusAt(y), `liquid r=${r} inside glass at y=${y}`))
assert.ok(LIQUID_Y.min > GLASS[0][1] && LIQUID_Y.max < GLASS.at(-1)[1])
assert.ok(COLLAR.y > GLASS.at(-1)[1] - COLLAR.height && CAP.y - CAP.height / 2 >= COLLAR.y)

close(volumeScale(50), 1)
close(volumeScale(100) ** 3, 2)
assert.deepEqual(Object.values(explodeOffsets(0)).flat().filter((v) => v !== 0), [])
assert.ok(explodeOffsets(1).cap[1] > explodeOffsets(1).collar[1], 'cap flies further than collar')

// particle targets: right size, finite, bounded, deterministic
const N = 64 * 64
const targets = makeTargets(N)
for (const [name, data] of Object.entries(targets)) {
  assert.equal(data.length, N * 4, name)
  for (let i = 0; i < data.length; i += 4) {
    const [x, y, z, w] = data.subarray(i, i + 4)
    assert.ok([x, y, z, w].every(Number.isFinite), `${name} finite`)
    assert.ok(Math.hypot(x, z) < 3.6 && Math.abs(y) < 3, `${name} bounded at ${i / 4}`)
    assert.ok(w >= 0 && w < 1)
  }
}
assert.deepEqual(makeTargets(16).top, makeTargets(16).top)

// wordmark strokes fit their box once centred
STROKES.forEach((s) => {
  const pts = s.ring ? [s.ring] : s.line
  pts.flat().forEach((v) => assert.ok(Number.isFinite(v)))
  pts.forEach(([x, y]) => assert.ok(Math.abs(x) <= WORDMARK_SIZE.width / 2 + 0.01 && Math.abs(y) <= 0.7))
})

// stage choreography
for (const isPortrait of [true, false]) {
  const frames = stageKeyframes(isPortrait)
  assert.deepEqual(poseAt(0, frames), frames[0])
  assert.deepEqual(poseAt(2, frames), frames[2])
  assert.deepEqual(poseAt(99, frames), frames.at(-1))
  const mid = poseAt(1.5, frames)
  assert.ok(mid.scale <= Math.max(frames[1].scale, frames[2].scale) && mid.scale >= Math.min(frames[1].scale, frames[2].scale))
}
assert.equal(lightness(0), 0)
assert.equal(lightness(3), 1)
assert.equal(lightness(4), 0)
assert.equal(noteBlend(0, 0), 0)
assert.equal(noteBlend(1, 1), 3)
assert.ok(particleOpacity(1) === 1 && particleOpacity(2) === 0 && particleOpacity(0) > 0)

// engraving input
assert.equal(cleanEngraving('  윤\u0000슬\n  2026'), '윤슬 2026')
assert.equal(Array.from(cleanEngraving('가'.repeat(40))).length, ENGRAVING_MAX)
assert.equal(cleanEngraving('<b>x</b>'), '<b>x</b>'.slice(0, ENGRAVING_MAX)) // kept as plain text

console.log('perfume check: ok')
