import { outline } from './shapes.js'

/** Static SVG drawing of a folded jamo, from the same fold geometry as the 3D strip. */
export default function Glyph({ name }) {
  const points = outline(name)
    .map((p) => `${p.x},${-p.y}`)
    .join(' ')
  return (
    <svg className="glyph" viewBox="-2.6 -2.6 5.2 5.2" aria-hidden="true">
      <polyline points={points} />
    </svg>
  )
}
