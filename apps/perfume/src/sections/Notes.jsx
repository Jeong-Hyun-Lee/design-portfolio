import { useRef } from 'react'
import { useStep } from './useStep.js'
import { NOTES } from '../content.js'

/** Sticky copy over the GPGPU particles: the same scroll drives the particle shape (rig.notes). */
export default function Notes() {
  const section = useRef(null)
  const step = useStep(section, NOTES.length)

  return (
    <section ref={section} id="notes" className="notes" data-stage="1" aria-labelledby="notes-title">
      <div className="sticky">
        <div className="steps">
          <p className="label">향의 순서</p>
          <h2 id="notes-title" className="title">
            세 번에 걸쳐
            <br />
            피어나는 향
          </h2>
          <ol className="step-list">
            {NOTES.map((n, i) => (
              <li key={n.latin} data-active={i === step}>
                <p className="step-tier">
                  <span>{n.latin}</span> {n.tier}
                </p>
                <h3 className="step-title">{n.title}</h3>
                <p className="step-body">{n.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
