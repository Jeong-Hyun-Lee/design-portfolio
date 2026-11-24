import { useState } from 'react'
import { CAPS, ENGRAVING_MAX, SCENTS, VOLUMES } from '../content.js'
import { cleanEngraving, priceOf, scentById, setConfig, useConfig } from '../config.js'

const won = (n) => `${n.toLocaleString('ko-KR')}원`

/** Segmented single choice built on native radios (keyboard and screen readers for free). */
function Segmented({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="choice">
      <legend>{legend}</legend>
      <div className="segmented">
        {options.map((o) => (
          <label key={o.value} className="segment">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span>{o.label}</span>
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
    setNotice(`${scent.name} ${config.volume}ml을 담았습니다. 윤슬은 포트폴리오용 가상 브랜드라 실제 주문은 받지 않습니다.`)

  return (
    <section id="atelier" className="atelier" aria-labelledby="atelier-title">
      <div className="atelier-panel">
        <p className="label">고르기</p>
        <h2 id="atelier-title" className="atelier-title">
          나의 윤슬
        </h2>
        <p className="atelier-mood">{scent.mood}</p>

        <fieldset className="choice">
          <legend>시간</legend>
          <div className="scents">
            {SCENTS.map((s) => (
              <label key={s.id} className="scent">
                <input
                  type="radio"
                  name="scent"
                  value={s.id}
                  checked={config.scent === s.id}
                  onChange={() => setConfig({ scent: s.id })}
                  className="sr-only"
                />
                <span className="swatch" style={{ '--wall': s.wall, '--juice': s.liquid }} aria-hidden="true" />
                <span className="scent-no">{s.no}</span>
                <span className="scent-name">{s.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Segmented
          legend="마개"
          name="cap"
          value={config.cap}
          onChange={(cap) => setConfig({ cap })}
          options={CAPS.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Segmented
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
          <button type="button" className="btn-teal" onClick={reserve}>
            예약 구매
          </button>
          <a className="link-teal" href="#craft">
            공방 이야기 <span aria-hidden="true">→</span>
          </a>
        </div>
        <p className="atelier-notice" role="status">
          {notice}
        </p>
      </div>
    </section>
  )
}
