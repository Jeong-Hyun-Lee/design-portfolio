import { NAV, PRODUCT } from '../content.js'

/**
 * Dark sticky bar (DESIGN.md). Hidden over the hero so the top keeps TOP_DESIGN's single-card
 * look, then slides down; `inert` keeps it out of the tab order while hidden.
 */
export default function Nav({ isHidden, active }) {
  return (
    <header className="nav" data-hidden={isHidden} inert={isHidden}>
      <a className="nav-logo" href="#top">
        {PRODUCT}
      </a>
      <nav aria-label="주요 메뉴">
        <ul className="nav-links">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a className="nav-cta" href="#reserve">
        체험 신청
      </a>
    </header>
  )
}
