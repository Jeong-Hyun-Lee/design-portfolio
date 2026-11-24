import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Photo from '../Photo.jsx'
import { SCENES } from '../content.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Vertical scroll drives a horizontal track: the section pins and the cards slide sideways.
 * Each photo also drifts inside its card, tied to the horizontal tween via containerAnimation.
 * With reduced motion the track is a plain horizontal scroller with snap points.
 */
export default function Scenes() {
  const section = useRef(null)
  const track = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const row = track.current
        const distance = () => {
          const lastCard = row.lastElementChild.getBoundingClientRect()
          const viewport = row.getBoundingClientRect()
          const endPadding = parseFloat(getComputedStyle(row).paddingInlineEnd)
          return Math.max(0, lastCard.right - viewport.right + endPadding)
        }
        const slide = gsap.to(row, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        gsap.utils.toArray('.scene-photo img').forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: 'none',
              scrollTrigger: { trigger: img.closest('.scene'), containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
            },
          )
        })
      })
    },
    { scope: section },
  )

  return (
    <section ref={section} id="scenes" className="scenes" aria-labelledby="scenes-title">
      <header className="section-head scenes-head">
        <p className="eyebrow">쓰임</p>
        <h2 id="scenes-title" className="h">
          회의실 대신, 전시장 대신
        </h2>
      </header>
      <ul ref={track} className="scenes-track">
        {SCENES.map((s) => (
          <li key={s.slug} className="scene">
            <div className="scene-photo">
              <Photo name={`scenes/${s.slug}`} alt="" width="1200" height="1500" />
            </div>
            <h3 className="h-sm">{s.title}</h3>
            <p className="scene-body">{s.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
