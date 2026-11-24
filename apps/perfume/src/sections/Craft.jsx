import { CRAFT } from '../content.js'

/** Opaque paper section (Letter editorial body). While it fills the screen the canvas pauses. */
export default function Craft() {
  return (
    <section id="craft" className="craft" aria-labelledby="craft-title">
      <div className="craft-inner">
        <p className="label" data-reveal>
          공방
        </p>
        <h2 id="craft-title" className="craft-title" data-reveal>
          덜어내고,
          <br />
          남은 향
        </h2>
        <div className="craft-body" data-reveal>
          <p>
            윤슬은 작은 조향 공방에서 한 달에 삼백 병만 만듭니다. 원료를 섞은 뒤 마흔하루 동안 어두운 방에 두고, 매주 한 번씩
            덜어낼 원료를 고릅니다.
          </p>
          <p>
            병은 여덟 면을 손으로 깎은 크리스털입니다. 바닥을 9mm로 두껍게 남겨서, 창가에 두면 향수를 지난 빛이 책상 위에 작은
            물결을 그립니다.
          </p>
        </div>
        <dl className="craft-figures">
          {CRAFT.map((f) => (
            <div key={f.label} data-reveal>
              <dt>{f.label}</dt>
              <dd>
                <span>{f.figure}</span>
                {f.unit}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
