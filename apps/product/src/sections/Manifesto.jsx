import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MANIFESTO } from '../content.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Large serif statement whose words ink in one by one as it scrolls through the viewport. */
export default function Manifesto() {
  const section = useRef(null)
  const words = MANIFESTO.split(' ')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.manifesto-word',
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: section.current, start: 'top 75%', end: 'bottom 55%', scrub: true },
          },
        )
      })
    },
    { scope: section },
  )

  return (
    <section ref={section} className="manifesto section" aria-label="소개">
      <p className="eyebrow">왜 3D 공간인가</p>
      <p className="manifesto-text">
        {words.map((w, i) => (
          <span key={i} className="manifesto-word">
            {w}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}
