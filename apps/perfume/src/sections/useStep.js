import { useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Which of `count` steps a tall sticky section is on. React state changes only when the step
 * does, not on every scroll frame.
 * @param {{ current: Element | null }} ref the tall section
 * @param {number} count
 */
export function useStep(ref, count) {
  const [step, setStep] = useState(0)
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setStep(Math.min(count - 1, Math.floor(self.progress * count))),
    })
  })
  return step
}
