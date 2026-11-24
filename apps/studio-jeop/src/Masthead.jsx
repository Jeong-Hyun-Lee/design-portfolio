import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Glyph from './Glyph.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const SMALL_PX = 20 // visual height of the title once it has docked into the bar

/**
 * Sticky bar with the nav, plus the big studio title that shrinks into that bar.
 *
 * The title is position: sticky with a negative top: it keeps scrolling up until exactly
 * SMALL_PX of its box would remain under the bar, then sticks. Over that same scroll distance
 * it scales (origin left bottom) down to SMALL_PX, so at the sticking point it fills the bar.
 * The title must stay a direct child of #root, or sticky ends with its parent.
 */
export default function Masthead({ nav, active }) {
  const bar = useRef(null)
  const mark = useRef(null)

  useGSAP(() => {
    const el = mark.current
    const geometry = () => {
      const barH = bar.current.offsetHeight
      const bigH = el.offsetHeight // layout height; transforms don't change it
      const stickTop = (barH - SMALL_PX) / 2
      el.style.top = `${stickTop + SMALL_PX - bigH}px`
      return { scale: SMALL_PX / bigH, distance: barH + bigH - stickTop - SMALL_PX }
    }

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el,
        { scale: 1 },
        {
          scale: () => geometry().scale,
          ease: 'none',
          scrollTrigger: { start: 0, end: () => geometry().distance, scrub: true, invalidateOnRefresh: true },
        },
      )
    })
    // reduced motion: same docking, but it switches size at the sticking point instead of animating
    mm.add('(prefers-reduced-motion: reduce)', () => {
      const dock = (isDocked) => gsap.set(el, { scale: isDocked ? geometry().scale : 1 })
      ScrollTrigger.create({
        start: 0,
        end: () => geometry().distance,
        invalidateOnRefresh: true,
        onLeave: () => dock(true),
        onEnterBack: () => dock(false),
      })
    })
  })

  return (
    <>
      <header ref={bar} className="masthead">
        <nav aria-label="주요 메뉴">
          <ul className="nav">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <a ref={mark} className="bigmark" href="#top">
        <span>스튜디오 접</span>
        <Glyph name="ㄱ" />
      </a>
    </>
  )
}
