import { BRAND } from '../content.js'

/** Hyper Tria close: back to black, the chrome wordmark (three/Wordmark) is the only thing on stage. */
export function Closing() {
  return (
    <section id="closing" className="closing" data-stage="4" aria-labelledby="closing-title">
      <div className="sticky closing-inner">
        <h2 id="closing-title" className="sr-only">
          {BRAND}
        </h2>
        <p className="closing-line">빛이 가장 낮게 깔리는 시간에.</p>
        <a className="btn-outline" href="#top">
          처음으로 <span aria-hidden="true">↑</span>
        </a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <p>Perfume은 WebGL 포트폴리오를 위해 만든 가상 브랜드입니다. 제품, 가격, 공방은 실제가 아닙니다.</p>
      <p>© 2026 PERFUME</p>
    </footer>
  )
}
