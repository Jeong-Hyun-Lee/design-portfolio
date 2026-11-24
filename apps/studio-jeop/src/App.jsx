import { lazy, Suspense, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Glyph from './Glyph.jsx'
import Masthead from './Masthead.jsx'
import { useActiveSection, useInView } from '@portfolio/shared/useInView.js'
import { useSmoothScroll } from '@portfolio/shared/useSmoothScroll.js'
import AlleySection from './AlleySection.jsx'
import FilmSection from './FilmSection.jsx'
import SceneBoundary from '@portfolio/shared/SceneBoundary.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const FoldScene = lazy(() => import('./FoldScene.jsx'))

const PARALLAX_PX = 70 // travel of a data-speed="1" element across its section
// Works images: travel in % of the image's own height. The image is 140% of its frame
// (see .work-media img), so up to ±14% stays inside the frame without showing an edge.
const IMAGE_SHIFT_PCT = 13
const IMAGE_ZOOM = 1.12 // starts slightly zoomed in and settles to 1 as it scrolls past

const NAV = [
  { id: 'services', label: '하는 일' },
  { id: 'works', label: '작업' },
  { id: 'process', label: '순서' },
  { id: 'contact', label: '문의' },
]
const TRACKED_SECTIONS = ['intro', 'services', 'alley', 'works', 'film', 'process', 'contact']

const JAMO = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ']

const SERVICES = [
  {
    name: '브랜드 아이덴티티',
    body: '이름에 맞는 글자부터 그립니다. 로고와 전용 서체, 쓰는 법을 정리한 규정집까지 한 벌로 만듭니다.',
  },
  {
    name: '간판과 공간 그래픽',
    body: '도면에서 멈추지 않습니다. 골목 제작소와 함께 재단하고 접고 용접해서 현장에 직접 답니다.',
  },
  {
    name: '한글 레터링',
    body: '패키지와 포스터, 책 표지에 들어갈 제목 글자를 그립니다. 기성 서체로는 안 되는 자리에 씁니다.',
  },
]

const WORKS = [
  {
    slug: 'bitnara-sign',
    glyph: 'ㄱ',
    title: '빛나라전기 간판',
    place: '을지로',
    kind: '간판',
    year: 2025,
    alt: '저녁 을지로 전기 상가 골목에 걸린, 철판을 접어 만든 돌출 간판',
  },
  {
    slug: 'soetdae-roastery',
    glyph: 'ㅁ',
    title: '쇳대 로스터리',
    place: '문래동',
    kind: '아이덴티티',
    year: 2025,
    alt: '자연광이 드는 문래동 철공소 개조 카페의 접힌 철판 카운터와 메뉴판 프레임',
  },
  {
    slug: 'folding-books',
    glyph: 'ㄹ',
    title: '접는 책 시리즈',
    place: '독립출판',
    kind: '레터링',
    year: 2024,
    alt: '회색 작업대 위에 놓인, ㄹ 자 접힘 그래픽의 책 표지 네 권',
  },
  {
    slug: 'corner-furniture',
    glyph: 'ㄷ',
    title: '모서리 가구',
    place: '성수동',
    kind: '공간 그래픽',
    year: 2024,
    alt: '콘크리트 바닥의 성수동 쇼룸에 놓인, 강판을 ㄷ 자로 접은 선반과 벤치',
  },
]

const STEPS = [
  { name: '실측', body: '현장의 크기와 보는 거리, 쓰는 사람을 잽니다.' },
  { name: '전개도', body: '글자를 펼친 상태로 그리고, 접을 선을 긋습니다.' },
  { name: '시험 접기', body: '종이와 얇은 판으로 먼저 접어 보고 고칩니다.' },
  { name: '설치', body: '제작소와 함께 만들어 현장에 답니다.' },
]

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
  )
}

function Hero() {
  const [shape, setShape] = useState('ㄱ')
  const hero = useRef(null)
  const isHeroVisible = useInView(hero)
  const reducedMotion = usePrefersReducedMotion()
  const label = shape === 'flat' ? '펼친' : `${shape} 모양으로 접은`

  return (
    <section id="intro" ref={hero} className="hero" aria-labelledby="hero-title">
      <div className="hero-copy" data-speed="0.8">
        <h1 id="hero-title" className="hero-title">
          <span>한글을 접어</span>
          <span className="hero-title-fold">브랜드를</span>
          <span className="hero-title-fold">만듭니다</span>
        </h1>
        <p className="hero-lede">
          스튜디오 접은 문래동 철공소 골목에 있는 브랜드 디자인 스튜디오입니다. 글자의 획을 철판처럼 다룹니다. 재고, 선을
          긋고, 접어서 간판과 공간과 아이덴티티로 세웁니다.
        </p>
      </div>

      <div className="hero-stage">
        <div className="hero-canvas" role="img" aria-label={`철판 한 장을 ${label} 3D 모형`}>
          <SceneBoundary fallback={<Glyph name={shape} />}>
            <Suspense fallback={null}>
              <FoldScene shape={shape} reducedMotion={reducedMotion} isActive={isHeroVisible} />
            </Suspense>
          </SceneBoundary>
        </div>
        <div className="folder" role="group" aria-label="철판으로 접을 글자">
          {JAMO.map((j) => (
            <button
              key={j}
              type="button"
              className="folder-key"
              aria-pressed={shape === j}
              aria-label={`${j} 접기`}
              onClick={() => setShape(j)}
            >
              {j}
            </button>
          ))}
          <button
            type="button"
            className="folder-key folder-key-flat"
            aria-pressed={shape === 'flat'}
            onClick={() => setShape('flat')}
          >
            펴기
          </button>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="band" aria-labelledby="services-title">
      <h2 id="services-title" className="band-title" data-speed="0.6">하는 일</h2>
      <dl className="services">
        {SERVICES.map((s) => (
          <div key={s.name} className="service">
            <dt className="service-name">{s.name}</dt>
            <dd className="service-body">{s.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Works() {
  return (
    <section id="works" className="band" aria-labelledby="works-title">
      <h2 id="works-title" className="band-title" data-speed="0.6">작업</h2>
      <ul className="works">
        {WORKS.map((w) => (
          <li key={w.slug} className="work">
            <div className="work-media">
              <picture>
                <source srcSet={`${import.meta.env.BASE_URL}images/works/${w.slug}.webp`} type="image/webp" />
                <img
                  src={`${import.meta.env.BASE_URL}images/works/${w.slug}.jpg`}
                  alt={w.alt}
                  width="1600"
                  height="1000"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="work-meta">
              <Glyph name={w.glyph} />
              <div>
                <h3 className="work-title">{w.title}</h3>
                <p className="work-place">{w.place}</p>
              </div>
              <div className="work-tags">
                <p className="work-kind">{w.kind}</p>
                <p className="work-year">{w.year}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Process() {
  return (
    <section id="process" className="band" aria-labelledby="process-title">
      <h2 id="process-title" className="band-title" data-speed="0.6">일하는 순서</h2>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.name} className="step">
            <h3 className="step-name">{s.name}</h3>
            <p className="step-body">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="contact-title">만들 글자가 있나요?</h2>
      <p className="contact-body">어떤 이름인지, 어디에 걸리는지, 언제까지 필요한지 보내 주세요. 사흘 안에 답장합니다.</p>
      <a className="button" href="mailto:hello@studio-jeop.kr">
        메일 보내기
      </a>
    </section>
  )
}

function useParallax() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('[data-speed]').forEach((el) => {
        const shift = Number(el.dataset.speed) * PARALLAX_PX
        gsap.fromTo(
          el,
          { y: shift },
          {
            y: -shift,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
      gsap.utils.toArray('.work-media img').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -IMAGE_SHIFT_PCT, scale: IMAGE_ZOOM },
          {
            yPercent: IMAGE_SHIFT_PCT,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: img.closest('.work-media'), start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    })
  })
}

export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  const active = useActiveSection(TRACKED_SECTIONS)
  useSmoothScroll(!reducedMotion)
  useParallax()

  return (
    <>
      <Masthead nav={NAV} active={active} />
      <main id="top">
        <Hero />
        <Services />
        <AlleySection />
        <Works />
        <FilmSection />
        <Process />
        <Contact />
      </main>
      <footer className="footer">
        <div className="footer-cols">
          <div>
            <h2 className="footer-label">찾아오는 길</h2>
            <address className="footer-text">
              서울 영등포구 문래동 3가
              <br />
              철공소 골목
            </address>
          </div>
          <div>
            <h2 className="footer-label">연락</h2>
            <a className="footer-link" href="mailto:hello@studio-jeop.kr">
              hello@studio-jeop.kr
            </a>
          </div>
          <nav aria-label="푸터 메뉴">
            <h2 className="footer-label">둘러보기</h2>
            <ul className="footer-nav">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a className="footer-link" href={`#${n.id}`}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-base">
          <p>© 2026 스튜디오 접</p>
          <p>가로등 3D 모델: Microsoft, CC0</p>
          <a className="footer-link footer-up" href="#top">
            맨 위로
          </a>
        </div>
      </footer>
    </>
  )
}
