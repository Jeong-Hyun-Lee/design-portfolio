import { BRAND, NAV } from '../content.js'

/** Vivid+Co nav: bare text links and one outlined action. Blend mode keeps it legible on dark and light. */
export default function Nav({ active }) {
  return (
    <header className="nav">
      <a className="nav-logo" href="#top">
        {BRAND}
      </a>
      <nav aria-label="섹션">
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
      <a className="nav-cta" href="#atelier">
        예약하기
      </a>
    </header>
  )
}
