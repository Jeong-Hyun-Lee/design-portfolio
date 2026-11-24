import { useState } from 'react'
import { CAPS, ENGRAVING_MAX, SCENTS, VOLUMES } from '../content.js'
import { cleanEngraving, priceOf, scentById, setConfig, useConfig } from '../config.js'

const won = (n) => `${n.toLocaleString('ko-KR')}원`

/**
 * One row of hairline tabs on native radios (keyboard and screen readers for free).
 * @param {{ legend: string, name: string, value: string|number, onChange: (v: any) => void,
 *   options: { value: string|number, label: string, hint?: string, swatch?: string }[] }} props
 */
function Choice({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="choice">
      <legend>{legend}</legend>
      <div className="options">
        {options.map((o) => (
          <label key={o.value} className="option">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className="option-label">
              {o.swatch && <span className="option-swatch" style={{ '--juice': o.swatch }} aria-hidden="true" />}
              {o.label}
            </span>
            {o.hint && <small>{o.hint}</small>}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Configurator (Letter): every choice re-renders the 3D bottle through the shared config store. */
export default function Atelier() {
  const config = useConfig()
  const [notice, setNotice] = useState('')
  const scent = scentById(config.scent)
  const engravedLength = Array.from(config.engraving).length

  const reserve = () =>
    setNotice(`${scent.name} ${config.volume}ml을 담았습니다. Perfume은 포트폴리오용 가상 브랜드라 실제 주문은 받지 않습니다.`)

  return (
    <section id="atelier" className="atelier" aria-labelledby="atelier-title">
      <div className="atelier-panel">
        <p className="label">고르기</p>
        <h2 id="atelier-title" className="atelier-title">
          My Perfume
        </h2>
        <p className="atelier-mood">
          {scent.no} {scent.name} · {scent.mood}
        </p>

        <Choice
          legend="시간"
          name="scent"
          value={config.scent}
          onChange={(id) => setConfig({ scent: id })}
          options={SCENTS.map((s) => ({ value: s.id, label: s.name, swatch: s.liquid }))}
        />
        <Choice
          legend="마개"
          name="cap"
          value={config.cap}
          onChange={(cap) => setConfig({ cap })}
          options={CAPS.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Choice
          legend="용량"
          name="volume"
          value={config.volume}
          onChange={(volume) => setConfig({ volume })}
          options={VOLUMES.map((v) => ({ value: v.ml, label: `${v.ml}ml`, hint: won(v.price) }))}
        />

        <label className="engrave">
          <span className="engrave-head">
            <span>각인</span>
            <small aria-live="polite">
              {engravedLength}/{ENGRAVING_MAX}
            </small>
          </span>
          <input
            className="engrave-input"
            type="text"
            value={config.engraving}
            onChange={(e) => setConfig({ engraving: cleanEngraving(e.target.value) })}
            placeholder="이름이나 날짜"
            autoComplete="off"
            spellCheck="false"
          />
        </label>

        <div className="atelier-total">
          <span>합계</span>
          <strong>{won(priceOf(config.volume))}</strong>
        </div>
        <div className="atelier-actions">
          <button type="button" className="btn-buy" onClick={reserve}>
            <span>예약 구매</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </button>
          <a className="link-quiet" href="#craft">
            공방 이야기 보기
          </a>
        </div>
        <p className="atelier-notice" role="status">
          {notice}
        </p>
      </div>
    </section>
  )
}
