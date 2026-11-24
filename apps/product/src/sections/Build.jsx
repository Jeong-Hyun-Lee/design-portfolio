import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView } from '@portfolio/shared/useInView.js'
import SceneBoundary from '@portfolio/shared/SceneBoundary.jsx'
import { arrangePose, buildPhases, PANEL_HOME } from '../three/RoomModel.jsx'
import { STEPS } from '../content.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const BuildScene = lazy(() => import('../three/BuildScene.jsx'))

// Editor meters, mirroring the product's own panel. [label, value -> 0..1]
const METERS = [
  ['X', (p) => (p.x - PANEL_HOME.x + 1.5) / 3],
  ['Y', (p) => (p.y - PANEL_HOME.y + 0.5) / 1],
  ['Z', (p) => (p.z - PANEL_HOME.z + 0.5) / 1],
  ['회전', (p) => (p.rotY + 0.6) / 1.2],
  ['크기', (p) => (p.scale - 0.6) / 1],
]

/**
 * Sticky scrollytelling: the 3D stage stays pinned (CSS sticky) while the steps scroll past.
 * Scroll progress builds the room; an IntersectionObserver picks the active step; the editor
 * meters are written straight to CSS variables so scrolling never re-renders React.
 */
export default function Build() {
  const section = useRef(null)
  const meters = useRef([])
  const build = useRef(0)
  const [active, setActive] = useState(0)
  const isVisible = useInView(section)

  useGSAP(
    () => {
      const writeMeters = (p) => {
        const pose = arrangePose(buildPhases(p).arrange)
        METERS.forEach(([, toUnit], i) => meters.current[i]?.style.setProperty('--v', Math.min(1, Math.max(0, toUnit(pose)))))
      }
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        ScrollTrigger.create({
          trigger: '.build-steps',
          start: 'top 60%',
          end: 'bottom 70%',
          onUpdate: (self) => {
            build.current = self.progress
            writeMeters(self.progress)
          },
        })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        build.current = 1
        writeMeters(1)
      })
    },
    { scope: section },
  )

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.index))),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    section.current.querySelectorAll('.build-step').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section ref={section} id="build" className="build section" aria-labelledby="build-title">
      <header className="section-head">
        <p className="eyebrow">만들기</p>
        <h2 id="build-title" className="h">
          빈 공간이 전시장이 되기까지
        </h2>
      </header>

      <div className="build-grid">
        <div className="build-stage">
          <div className="build-canvas" role="img" aria-label="스크롤에 따라 벽이 세워지고 패널이 걸리고 아바타가 들어오는 3D 전시장">
            <SceneBoundary>
              <Suspense fallback={null}>
                <BuildScene build={build} isActive={isVisible} />
              </Suspense>
            </SceneBoundary>
          </div>
          <div className="editor" aria-hidden="true">
            <p className="editor-title">배치 조정</p>
            {METERS.map(([label], i) => (
              <div key={label} className="editor-row" ref={(el) => (meters.current[i] = el)}>
                <span>{label}</span>
                <span className="editor-track" />
              </div>
            ))}
          </div>
        </div>

        <ol className="build-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="build-step" data-index={i} data-active={active === i}>
              <span className="build-num">0{i + 1}</span>
              <h3 className="h-sm">{s.title}</h3>
              <p className="build-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
