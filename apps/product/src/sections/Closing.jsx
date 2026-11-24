import { NAV, PRODUCT } from '../content.js'

export function Closing() {
  return (
    <section id="reserve" className="closing section" aria-labelledby="closing-title">
      <h2 id="closing-title" className="h-lg" data-reveal>
        첫 공간을 열어 보세요
      </h2>
      <p className="closing-body" data-reveal>
        팀 이름과 쓰려는 용도를 보내 주시면 체험용 공간을 하나 만들어 링크로 보내 드립니다.
      </p>
      <div className="closing-actions" data-reveal>
        <a className="btn-primary" href="mailto:demo@room3d.example">
          체험 신청하기
        </a>
        <a className="btn-ghost" href="#specs">
          사양 다시 보기 <span className="arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cols">
        <p className="footer-mark">{PRODUCT}</p>
        <nav aria-label="푸터 메뉴">
          <ul className="footer-nav">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer-note">
          3D 화면은 three.js로 실시간 렌더링합니다. 시연 영상은 실제 서비스 화면이고, 사진은 AI로 생성한 이미지입니다.
        </p>
      </div>
      <p className="footer-base">© 2026 {PRODUCT}</p>
    </footer>
  )
}
