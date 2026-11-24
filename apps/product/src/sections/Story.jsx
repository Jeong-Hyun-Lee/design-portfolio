import Photo from '../Photo.jsx'

/**
 * DESIGN.md's hero treatment, used mid-page: full-bleed warm photograph fading diagonally into
 * the cream canvas, a thin serif headline over it. Photo and headline move at different speeds
 * (data-parallax-img / data-speed, driven by App's useParallax).
 */
export default function Story() {
  return (
    <section className="story" aria-labelledby="story-title" data-parallax-frame>
      <Photo
        name="story/team"
        alt="따뜻한 저녁 빛이 드는 사무실에서 두 사람이 노트북 화면 속 같은 3D 전시장을 보며 웃고 있다"
        width="2400"
        height="1350"
        className="story-photo"
        data-parallax-img
      />
      <div className="story-copy" data-speed="0.5">
        <h2 id="story-title" className="display">
          서로 다른 도시에서,
          <br />
          같은 벽 앞에
        </h2>
      </div>
    </section>
  )
}
