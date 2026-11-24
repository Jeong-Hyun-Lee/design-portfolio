import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)
// mobile URL bars resize the viewport while scrolling; don't re-measure pins for that
ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in sync.
 * @param {boolean} isEnabled off when the user prefers reduced motion
 */
export function useSmoothScroll(isEnabled) {
  useEffect(() => {
    // web fonts change line heights; recompute trigger positions once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    if (!isEnabled) return undefined

    const lenis = new Lenis({ anchors: true, autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [isEnabled])
}
