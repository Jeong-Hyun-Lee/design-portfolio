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
 * TOP_DESIGN.md: one rendered object on a cold grey canvas, one macOS-style window card,
 * one black button. All colour comes from the 3D scene (the green lasers).
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
      <div className="hero-stage" role="img" aria-label="나무 바닥과 흰 벽의 3D 전시장 모형 위로 초록 레이저 두 줄이 교차하는 장면">
        <SceneBoundary fallback={<Photo name="hero/room" alt="" className="hero-fallback" isEager />}>
          <Suspense fallback={null}>
            <HeroScene progress={progress} isActive={isVisible} />
          </Suspense>
        </SceneBoundary>
      </div>

      <div className="window" data-speed="-0.6">
        <div className="window-bar" aria-hidden="true">
          <span className="window-dot" />
          <span className="window-dot" />
          <span className="window-dot" />
          <span className="window-tag">R3</span>
        </div>
        <h1 id="hero-title" className="window-title">
          {PRODUCT}
        </h1>
        <a className="window-cta" href="#reserve">
          체험 신청 <span aria-hidden="true">›</span>
        </a>
      </div>
    </section>
  )
}
