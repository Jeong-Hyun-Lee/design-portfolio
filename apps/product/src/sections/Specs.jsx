import { useEffect, useRef, useState } from 'react'
import { useInView } from '@portfolio/shared/useInView.js'
import { usePrefersReducedMotion } from '@portfolio/shared/usePrefersReducedMotion.js'
import { FIGURES, SPEC_ROWS } from '../content.js'

const COUNT_MS = 1200

/** Counts up once, the first time it scrolls into view. */
function Figure({ value, unit, label }) {
  const ref = useRef(null)
  const isInView = useInView(ref)
  const reducedMotion = usePrefersReducedMotion()
  const [shown, setShown] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!isInView || hasRun.current) return undefined
    hasRun.current = true
    if (reducedMotion) {
      setShown(value)
      return undefined
    }
    let frame = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / COUNT_MS)
      setShown(Math.round(value * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isInView, reducedMotion, value])

  return (
    <div ref={ref} className="figure">
      <p className="figure-value">
        <span aria-hidden="true">{shown}</span>
        <span className="sr-only">{value}</span>
        <span className="figure-unit">{unit}</span>
      </p>
      <p className="figure-label">{label}</p>
    </div>
  )
}

/** Sticky heading on the left while figures and the spec table scroll on the right. */
export default function Specs() {
  return (
    <section id="specs" className="specs section" aria-labelledby="specs-title">
      <div className="specs-grid">
        <header className="specs-head">
          <p className="eyebrow">사양</p>
          <h2 id="specs-title" className="h">
            숫자로 보면
          </h2>
        </header>
        <div>
          <div className="figures">
            {FIGURES.map((f) => (
              <Figure key={f.label} {...f} />
            ))}
          </div>
          <dl className="spec-table">
            {SPEC_ROWS.map(([k, v]) => (
              <div key={k} className="spec-row" data-reveal>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
