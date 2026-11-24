import { lazy, Suspense, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView } from '@portfolio/shared/useInView.js'
import SceneBoundary from '@portfolio/shared/SceneBoundary.jsx'
import Photo from '../Photo.jsx'
import { PRODUCT } from '../content.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const HeroScene = lazy(() => import('../three/HeroScene.jsx'))

/**
 * TOP_DESIGN.md: one rendered object on a cold grey canvas. All colour comes from the 3D scene.
 * `ref` is the section; App watches it to reveal the nav.
 */
export default function Hero({ ref }) {
  const progress = useRef(0)
  const isVisible = useInView(ref)

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        progress.current = self.progress
      },
    })
  })

  return (
    <section ref={ref} id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" role="img" aria-label="나무 바닥과 흰 벽의 3D 전시장 모형">
        <SceneBoundary fallback={<Photo name="hero/room" alt="" className="hero-fallback" isEager />}>
          <Suspense fallback={null}>
            <HeroScene progress={progress} isActive={isVisible} />
          </Suspense>
        </SceneBoundary>
      </div>

      <h1 id="hero-title" className="sr-only">
        {PRODUCT} — 브라우저에서 여는 3D 전시·회의 공간
      </h1>
    </section>
  )
}
