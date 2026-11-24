import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useActiveSection } from '@portfolio/shared/useInView.js'
import { useSmoothScroll } from '@portfolio/shared/useSmoothScroll.js'
import { usePrefersReducedMotion } from '@portfolio/shared/usePrefersReducedMotion.js'
import SceneBoundary from '@portfolio/shared/SceneBoundary.jsx'
import Nav from './sections/Nav.jsx'
import Hero from './sections/Hero.jsx'
import Notes from './sections/Notes.jsx'
import Anatomy from './sections/Anatomy.jsx'
import Shift from './sections/Shift.jsx'
import Atelier from './sections/Atelier.jsx'
import Craft from './sections/Craft.jsx'
import { Closing, Footer } from './sections/Closing.jsx'
import { lightness, rig } from './rig.js'
import { BRAND, NAV } from './content.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const Experience = lazy(() => import('./three/Experience.jsx'))
// top and closing are tracked too so no nav link stays lit over sections it doesn't name
const TRACKED = ['top', ...NAV.map((n) => n.id), 'closing']
const VELOCITY_DECAY = 0.9 // per tick, so lens fringing fades once scrolling stops
const clamp01 = (v) => Math.min(1, Math.max(0, v))

function useMedia(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

/** How far the viewport has travelled through a tall (sticky) section, 0..1. */
function progressThrough(el, vh) {
  const r = el.getBoundingClientRect()
  return clamp01(-r.top / Math.max(1, r.height - vh))
}

/**
 * The bridge from DOM to WebGL. On every scroll it reads where the sections are and writes the
 * stage (0..4), per-section progress and velocity into `rig`, plus --light for the CSS.
 * Reading rects each scroll (not trigger callbacks) keeps it right after reloads mid-page.
 * Returns true while the opaque craft section covers the whole screen: the canvas can rest.
 */
function useScrollRig() {
  const [isCovered, setIsCovered] = useState(false)

  useGSAP(() => {
    const staged = [...document.querySelectorAll('[data-stage]')].map((el) => ({ el, stage: Number(el.dataset.stage) }))
    const notes = document.getElementById('notes')
    const anatomy = document.getElementById('anatomy')
    const craft = document.getElementById('craft')
    const root = document.documentElement
    let wasCovered = false

    const update = (self) => {
      const vh = window.innerHeight
      let stage = 0
      for (const { el, stage: s } of staged) {
        const enter = clamp01((vh - el.getBoundingClientRect().top) / vh)
        if (enter > 0) stage = s - 1 + enter
      }
      rig.stage = stage
      rig.notes = progressThrough(notes, vh)
      rig.anatomy = progressThrough(anatomy, vh)
      if (self?.getVelocity) rig.velocity = self.getVelocity()
      root.style.setProperty('--light', lightness(stage).toFixed(3))

      const box = craft.getBoundingClientRect()
      const covered = box.top <= 0 && box.bottom >= vh
      if (covered !== wasCovered) setIsCovered((wasCovered = covered))
    }

    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update })
    update()
    const decay = () => {
      rig.velocity *= VELOCITY_DECAY
    }
    gsap.ticker.add(decay)
    return () => gsap.ticker.remove(decay)
  })

  return isCovered
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

function StageFallback() {
  return (
    <div className="stage-fallback" aria-hidden="true">
      <span>{BRAND}</span>
    </div>
  )
}

export default function App() {
  const isReducedMotion = usePrefersReducedMotion()
  const isPortrait = useMedia('(max-aspect-ratio: 1/1)')
  const isLite = useMedia('(max-width: 760px), (pointer: coarse)')
  const active = useActiveSection(TRACKED)
  useSmoothScroll(!isReducedMotion)
  const isCovered = useScrollRig()
  useReveal()

  return (
    <>
      <SceneBoundary fallback={<StageFallback />}>
        <Suspense fallback={null}>
          <Experience isPortrait={isPortrait} isLite={isLite} isReducedMotion={isReducedMotion} isPaused={isCovered} />
        </Suspense>
      </SceneBoundary>
      <Nav active={active} />
      <main>
        <Hero />
        <Notes />
        <Anatomy />
        <Shift />
        <Atelier />
        <Craft />
        <Closing />
      </main>
      <Footer />
    </>
  )
}
