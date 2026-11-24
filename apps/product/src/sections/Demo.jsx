import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView } from '@portfolio/shared/useInView.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const MEDIA = `${import.meta.env.BASE_URL}media/`
const PIN_LENGTH = '+=150%'

/**
 * The real screen recording. The section pins, the frame opens from an inset window to full
 * bleed, and the video plays only while pinned. Muted by default; one button unmutes.
 */
export default function Demo() {
  const section = useRef(null)
  const video = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [hasControls, setHasControls] = useState(false)
  const isNear = useInView(section, { rootMargin: '100% 0px' })

  // the browser may refuse autoplay (data saver, policy); then fall back to native controls
  const play = () => video.current?.play().catch(() => setHasControls(true))
  const pause = () => video.current?.pause()
  const handleToggle = () => (video.current?.paused ? play() : pause())
  const handleSound = () => {
    video.current.muted = !video.current.muted
    setIsMuted(video.current.muted)
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section.current,
              start: 'top top',
              end: PIN_LENGTH,
              pin: true,
              scrub: true,
              onToggle: (self) => (self.isActive ? play() : pause()),
            },
          })
          .fromTo('.demo-frame', { clipPath: 'inset(14% 18% round 25px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none', duration: 0.45 })
          .from('.demo-caption', { autoAlpha: 0, y: 24, duration: 0.1 }, 0.4)
          .to({}, { duration: 0.45 })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => setHasControls(true))
    },
    { scope: section },
  )

  return (
    <section ref={section} id="demo" className="demo" aria-labelledby="demo-title">
      <figure className="demo-frame">
        <video
          ref={video}
          className="demo-video"
          src={`${MEDIA}product-demo.mp4`}
          poster={isNear ? `${MEDIA}product-demo-poster.jpg` : undefined}
          muted
          loop
          playsInline
          preload={isNear ? 'auto' : 'none'}
          controls={hasControls}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-label="실제 서비스 화면: 아바타가 전시장 벽 앞에 서서 파일을 골라 영상 패널을 걸고 위치와 크기를 조정하는 장면"
        />
        <figcaption className="demo-caption">
          <div>
            <p className="eyebrow eyebrow-light">실제 화면</p>
            <h2 id="demo-title" className="demo-title">
              고르고, 걸고, 맞추는 데 1분
            </h2>
          </div>
          {!hasControls && (
            <div className="demo-buttons">
              <button type="button" className="demo-btn" onClick={handleToggle}>
                {isPlaying ? '일시 정지' : '재생'}
              </button>
              <button type="button" className="demo-btn" onClick={handleSound} aria-pressed={!isMuted}>
                {isMuted ? '소리 켜기' : '소리 끄기'}
              </button>
            </div>
          )}
        </figcaption>
      </figure>
    </section>
  )
}
