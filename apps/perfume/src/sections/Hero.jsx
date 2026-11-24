import { BRAND } from '../content.js'

/** The giant logotype behind the bottle is drawn in WebGL (three/HeroTitle); this is the readable layer. */
export default function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {BRAND} 오 드 퍼퓸
      </h1>
      <div className="hero-foot">
        <p className="hero-lede">물 위에서 부서지는 빛을 병에 담았습니다.</p>
        <p className="hero-meta">
          <span>Eau de Parfum</span>
          <span>30 · 50 · 100 ml</span>
        </p>
        <p className="hero-cue" aria-hidden="true">
          아래로
        </p>
      </div>
    </section>
  )
}
