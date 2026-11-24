import { lazy, Suspense, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useInView } from '@portfolio/shared/useInView.js'
import { usePrefersReducedMotion } from '@portfolio/shared/usePrefersReducedMotion.js'
import SceneBoundary from '@portfolio/shared/SceneBoundary.jsx'
import { MEDIA } from '../content.js'

const PlaygroundScene = lazy(() => import('../three/PlaygroundScene.jsx'))

// Same controls as the product's editor panel. Values are offsets from the panel's home pose.
const SLIDERS = [
  { key: 'x', label: 'X 위치', min: -1.5, max: 1.5, step: 0.05 },
  { key: 'y', label: 'Y 위치', min: -0.5, max: 0.5, step: 0.05 },
  { key: 'z', label: 'Z 위치', min: 0, max: 1.5, step: 0.05 },
  { key: 'rotY', label: '회전', min: -0.8, max: 0.8, step: 0.02 },
  { key: 'scale', label: '크기', min: 0.6, max: 1.6, step: 0.05 },
]
const HOME = { x: 0, y: 0, z: 0, rotY: 0, scale: 1 }

/**
 * Hands-on WebGL: real range inputs move the panel inside the 3D room. Switching the file type
 * goes through the View Transitions API, so the stage and caption wipe across instead of
 * cutting (falls back to an instant swap where unsupported or with reduced motion).
 */
export default function Playground() {
  const section = useRef(null)
  const isVisible = useInView(section)
  const reducedMotion = usePrefersReducedMotion()
  const [pose, setPose] = useState(HOME)
  const [media, setMedia] = useState('video')
  const [orientation, setOrientation] = useState('landscape')
  const idBase = useId()
  const current = MEDIA.find((m) => m.key === media)

  const withTransition = (update) => {
    if (!document.startViewTransition || reducedMotion) return update()
    document.startViewTransition(() => flushSync(update))
  }
  const handleMedia = (key) => key !== media && withTransition(() => setMedia(key))
  const handleSlider = (key) => (e) => setPose((p) => ({ ...p, [key]: Number(e.target.value) }))

  return (
    <section ref={section} id="playground" className="playground section" aria-labelledby="playground-title">
      <header className="section-head">
        <p className="eyebrow">직접 옮기기</p>
        <h2 id="playground-title" className="h">
          패널을 직접 움직여 보세요
        </h2>
      </header>

      <div className="playground-grid">
        <div className="playground-stage" role="img" aria-label={`3D 전시장 벽 앞에 걸린 ${current.label} 패널`}>
          <SceneBoundary>
            <Suspense fallback={null}>
              <PlaygroundScene pose={pose} media={media} orientation={orientation} isActive={isVisible} />
            </Suspense>
          </SceneBoundary>
          <p className="playground-hint" aria-hidden="true">
            마우스로 끌면 공간을 돌려 볼 수 있습니다
          </p>
        </div>

        <div className="playground-panel">
          <div className="tabs" role="group" aria-label="파일 형식">
            {MEDIA.map((m) => (
              <button key={m.key} type="button" className="tab" aria-pressed={media === m.key} onClick={() => handleMedia(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="playground-note">{current.note}</p>

          <div className="sliders">
            {SLIDERS.map((s) => (
              <div key={s.key} className="slider">
                <label htmlFor={`${idBase}-${s.key}`}>{s.label}</label>
                <input
                  id={`${idBase}-${s.key}`}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={pose[s.key]}
                  onChange={handleSlider(s.key)}
                />
                <output htmlFor={`${idBase}-${s.key}`}>{pose[s.key].toFixed(2)}</output>
              </div>
            ))}
          </div>

          <div className="playground-actions">
            <div className="tabs" role="group" aria-label="패널 방향">
              <button type="button" className="tab" aria-pressed={orientation === 'landscape'} onClick={() => setOrientation('landscape')}>
                가로
              </button>
              <button type="button" className="tab" aria-pressed={orientation === 'portrait'} onClick={() => setOrientation('portrait')}>
                세로
              </button>
            </div>
            <button type="button" className="btn-ghost" onClick={() => setPose(HOME)}>
              초기화 <span aria-hidden="true">↺</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
