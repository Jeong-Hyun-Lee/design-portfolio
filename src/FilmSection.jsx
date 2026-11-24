import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView } from './useInView.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const MEDIA = `${import.meta.env.BASE_URL}media/`
const VIDEO_WEBM = `${MEDIA}studio-film.webm`
const VIDEO_MP4 = `${MEDIA}studio-film.mp4` // Safari before 17.4 has no VP9 webm
const POSTER = `${MEDIA}studio-film-poster.jpg`
const PIN_LENGTH = '+=160%' // scroll distance the section stays pinned

export default function FilmSection() {
  const section = useRef(null)
  const video = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasControls, setHasControls] = useState(false)
  const isNear = useInView(section, { rootMargin: '100% 0px' })

  // the browser may refuse autoplay (data saver, policy); then show native controls
  const play = () => video.current?.play().catch(() => setHasControls(true))
  const pause = () => video.current?.pause()
  const handleToggle = () => (video.current?.paused ? play() : pause())

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: PIN_LENGTH,
            pin: true,
            scrub: true,
            onToggle: (self) => (self.isActive ? play() : pause()),
          },
        })
        tl.fromTo(
          '.film-frame',
          { clipPath: 'inset(16% 20% round 6px)' },
          { clipPath: 'inset(0% 0% round 0px)', ease: 'none', duration: 0.45 },
        )
          .from('.film-caption', { autoAlpha: 0, y: 24, duration: 0.1 }, 0.4)
          .to({}, { duration: 0.45 })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => setHasControls(true))
    },
    { scope: section },
  )

  return (
    <section id="film" ref={section} className="film" aria-labelledby="film-title">
      <figure className="film-frame">
        <video
          ref={video}
          className="film-video"
          poster={isNear ? POSTER : undefined}
          muted
          loop
          playsInline
          preload={isNear ? 'auto' : 'none'}
          controls={hasControls}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-label="장갑 낀 손이 아연 도금판에 파란 접는 선을 긋고, ㄱ 자로 접힌 철판이 놓인 작업실 장면"
        >
          <source src={VIDEO_WEBM} type="video/webm" />
          <source src={VIDEO_MP4} type="video/mp4" />
        </video>
        <figcaption className="film-caption">
          <div>
            <h2 id="film-title" className="film-title">
              선 하나 긋고 한 번 접으면 글자가 섭니다
            </h2>
            <p className="film-credit">문래동 작업실에서</p>
          </div>
          {!hasControls && (
            <button type="button" className="film-toggle" onClick={handleToggle}>
              {isPlaying ? '영상 멈추기' : '영상 재생'}
            </button>
          )}
        </figcaption>
      </figure>
    </section>
  )
}
