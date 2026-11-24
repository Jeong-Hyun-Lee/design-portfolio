import { useEffect, useState } from 'react'

/**
 * True while the element intersects the viewport (grown by rootMargin).
 * @param {{ current: Element | null }} ref
 * @param {{ rootMargin?: string }} [options]
 * @returns {boolean}
 */
export function useInView(ref, { rootMargin = '0px' } = {}) {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return isInView
}

/**
 * Id of the section crossing the middle band of the viewport.
 * @param {string[]} ids
 * @returns {string | null}
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  const key = ids.join(',')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key])

  return active
}
