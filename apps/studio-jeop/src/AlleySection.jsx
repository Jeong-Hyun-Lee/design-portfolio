import { lazy, Suspense, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView } from '@portfolio/shared/useInView.js'
import SceneBoundary from '@portfolio/shared/SceneBoundary.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const LanternScene = lazy(() => import('./LanternScene.jsx'))

export default function AlleySection() {
  const section = useRef(null)
  const progress = useRef(0)
  const isVisible = useInView(section)
  // start fetching the 9 MB model a screen before it is needed
  const isNear = useInView(section, { rootMargin: '100% 0px' })

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          progress.current = self.progress
        },
      })
    },
    { scope: section },
  )

  return (
    <section id="alley" ref={section} className="alley" aria-labelledby="alley-title">
      <p className="alley-word" aria-hidden="true" data-speed="1.6">
        골목
      </p>
      <div className="alley-copy" data-speed="0.4">
        <h2 id="alley-title" className="band-title">
          간판은 밤에도 읽혀야 합니다
        </h2>
        <p className="alley-body">
          낮에는 글자의 모양이, 밤에는 빛이 간판을 읽게 합니다. 그래서 조명 기구도 저희가 같이 고르고 답니다. 오래된 가로등
          하나도 골목의 글자가 됩니다.
        </p>
      </div>
      <div className="alley-canvas" role="img" aria-label="스크롤하면 천천히 돌면서 불이 켜지는 오래된 가로등 3D 모형">
        <SceneBoundary>
          <Suspense fallback={null}>{isNear && <LanternScene progress={progress} isActive={isVisible} />}</Suspense>
        </SceneBoundary>
      </div>
    </section>
  )
}
