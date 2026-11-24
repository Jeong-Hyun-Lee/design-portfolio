import { useRef } from 'react'
import { useStep } from './useStep.js'
import { PARTS } from '../content.js'

/** Exploded view (Eduardo del Fraile: one object in the void). Depth of field follows the step. */
export default function Anatomy() {
  const section = useRef(null)
  const step = useStep(section, PARTS.length)

  return (
    <section ref={section} id="anatomy" className="anatomy" data-stage="2" aria-labelledby="anatomy-title">
      <div className="sticky">
        <div className="steps">
          <p className="label">병</p>
          <h2 id="anatomy-title" className="title">
            한 병을 이루는
            <br />네 부분
          </h2>
          <ol className="part-list">
            {PARTS.map((p, i) => (
              <li key={p.part} data-active={i === step}>
                <span className="part-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="part-name">{p.name}</span>
                <span className="part-spec">{p.spec}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
