import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useActiveSection, useInView } from '@portfolio/shared/useInView.js'
import { useSmoothScroll } from '@portfolio/shared/useSmoothScroll.js'
import { usePrefersReducedMotion } from '@portfolio/shared/usePrefersReducedMotion.js'
import Hero from './sections/Hero.jsx'
import Nav from './sections/Nav.jsx'
import Manifesto from './sections/Manifesto.jsx'
import Build from './sections/Build.jsx'
import Demo from './sections/Demo.jsx'
import Playground from './sections/Playground.jsx'
import Scenes from './sections/Scenes.jsx'
import Specs from './sections/Specs.jsx'
import Story from './sections/Story.jsx'
import { Closing, Footer } from './sections/Closing.jsx'
import { NAV } from './content.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const PARALLAX_PX = 80 // travel of a data-speed="1" element across its parent
// data-parallax-img travel, % of the image's own height. The image is 130% of its frame, so
// up to ±11.5% (= ±15% of the frame) never shows an edge.
const IMAGE_SHIFT_PCT = 11
const TRACKED = NAV.map((n) => n.id)

/**
 * Declarative parallax. Runs after every section's own ScrollTriggers (children's effects run
 * first), so pinned sections' spacing is already measured when these are created.
 */
function useParallax() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('[data-speed]').forEach((el) => {
        const shift = Number(el.dataset.speed) * PARALLAX_PX
        gsap.fromTo(
          el,
          { y: shift },
          { y: -shift, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      gsap.utils.toArray('[data-parallax-img]').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -IMAGE_SHIFT_PCT },
          {
            yPercent: IMAGE_SHIFT_PCT,
            ease: 'none',
            scrollTrigger: { trigger: img.closest('[data-parallax-frame]'), start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    })
  })
}

/** Fade-up reveal for [data-reveal] elements, once each, via one shared IntersectionObserver. */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.dataset.revealed = 'true'
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function App() {
  const hero = useRef(null)
  const reducedMotion = usePrefersReducedMotion()
  // nav slides in once the hero's bottom passes the upper 40% of the viewport
  const isHeroUp = useInView(hero, { rootMargin: '0px 0px -60% 0px' })
  const active = useActiveSection(TRACKED)
  useSmoothScroll(!reducedMotion)
  useParallax()
  useReveal()

  return (
    <>
      <Nav isHidden={isHeroUp} active={active} />
      <main>
        <Hero ref={hero} />
        <Manifesto />
        <Build />
        <Demo />
        <Playground />
        <Scenes />
        <Specs />
        <Story />
        <Closing />
      </main>
      <Footer />
    </>
  )
}
