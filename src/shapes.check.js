import assert from 'node:assert/strict'
import { SHAPES, SEGMENTS, outline } from './shapes.js'

const close = (a, b) => Math.abs(a - b) < 1e-9

for (const [name, s] of Object.entries(SHAPES)) {
  assert.equal(s.strokes.reduce((a, b) => a + b, 0), SEGMENTS, `${name}: strokes must use every segment`)
  assert.equal(s.turns.length, s.strokes.length - 1, `${name}: one turn between each stroke`)
}

const size = (pts) => {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]
}

const box = outline('ㅁ')
assert.ok(close(box[0].x, box.at(-1).x) && close(box[0].y, box.at(-1).y), 'ㅁ must close')

const [gw, gh] = size(outline('ㄱ'))
assert.ok(close(gw, 4) && close(gh, 4), 'ㄱ is 4 x 4')
const g = outline('ㄱ')
assert.ok(g[0].y > g.at(-1).y && g.at(-1).x > g[0].x, 'ㄱ runs right then down')

const [fw, fh] = size(outline('flat'))
assert.ok(close(fw, 8) && close(fh, 0), 'flat strip is 8 long')

const r = outline('ㄹ')
assert.ok(close(r[0].x, r.at(-1).x - 2) && r[0].y > r.at(-1).y, 'ㄹ starts top-left, ends bottom-right')

process.stdout.write('shapes ok\n')
