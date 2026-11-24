import { useRef, useSyncExternalStore } from 'react'
import { useInView } from '@portfolio/shared/useInView.js'
import { useSmoothScroll } from '@portfolio/shared/useSmoothScroll.js'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
  )
}

// Starting point for a new portfolio: copy apps/starter, rename it, replace this file.
export default function App() {
  const section = useRef(null)
  const isInView = useInView(section)
  useSmoothScroll(!usePrefersReducedMotion())

  return (
    <main>
      <section className="intro">
        <h1>새 포트폴리오</h1>
        <p>apps/starter를 복사해 시작하세요.</p>
      </section>
      <section ref={section} className="intro" data-in-view={isInView}>
        <p>공통 훅(useInView, useSmoothScroll)은 @portfolio/shared에서 가져옵니다.</p>
      </section>
    </main>
  )
}
