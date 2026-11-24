// "윤슬" drawn as strokes (straight bars and one ring), built later as chrome capsules and a
// torus. Coordinates are per-syllable boxes, then centred.

const SYLLABLE_GAP = 1.2

const YUN = [
  { ring: [0.5, 1.06], r: 0.19 }, // ㅇ
  { line: [[0.08, 0.74], [0.92, 0.74]] }, // ㅠ
  { line: [[0.34, 0.74], [0.34, 0.56]] },
  { line: [[0.66, 0.74], [0.66, 0.56]] },
  { line: [[0.18, 0.44], [0.18, 0.1]] }, // ㄴ
  { line: [[0.18, 0.1], [0.88, 0.1]] },
]

const SEUL = [
  { line: [[0.5, 1.28], [0.16, 0.9]] }, // ㅅ
  { line: [[0.5, 1.28], [0.84, 0.9]] },
  { line: [[0.08, 0.74], [0.92, 0.74]] }, // ㅡ
  { line: [[0.18, 0.56], [0.82, 0.56]] }, // ㄹ
  { line: [[0.82, 0.56], [0.82, 0.34]] },
  { line: [[0.82, 0.34], [0.18, 0.34]] },
  { line: [[0.18, 0.34], [0.18, 0.1]] },
  { line: [[0.18, 0.1], [0.84, 0.1]] },
]

const shift = (stroke, dx, dy) =>
  stroke.ring
    ? { ring: [stroke.ring[0] + dx, stroke.ring[1] + dy], r: stroke.r }
    : { line: stroke.line.map(([x, y]) => [x + dx, y + dy]) }

export const WORDMARK_SIZE = { width: 1 + SYLLABLE_GAP, height: 1.28 }

const CX = WORDMARK_SIZE.width / 2
const CY = 0.69

export const STROKES = [
  ...YUN.map((s) => shift(s, -CX, -CY)),
  ...SEUL.map((s) => shift(s, SYLLABLE_GAP - CX, -CY)),
]
