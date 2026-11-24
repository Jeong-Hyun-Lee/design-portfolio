# studio-jeop

문래동에 있다는 설정의 가상 간판·브랜드 스튜디오 "스튜디오 접"의 랜딩페이지다. 저장소 공통 규칙(명령어, `file://` 빌드, 공통 코드)은 루트 `CLAUDE.md`에 있다.

- 개발: `npm run dev -w apps/studio-jeop` (루트 `npm run dev`도 같다)
- 테스트: `npm run check -w apps/studio-jeop` → `src/shapes.check.js`. 테스트 프레임워크 없이 `node:assert`로 접기 계산을 검증한다.

## 구조

페이지는 `App.jsx`에 나열한 섹션이 위에서 아래로 이어진다. 순서는 Hero, Services, AlleySection, Works, FilmSection, Process, Contact다. 섹션 여러 곳에 걸치는 동작은 섹션 안이 아니라 훅에 둔다.

**상단 제목 (`Masthead.jsx`)**

- 메뉴만 있는 고정 바(`.masthead`, 높이 `--bar-h`)와, 그 아래 큰 "스튜디오 접" 제목(`.bigmark`)으로 이뤄진다.
- 제목은 `position: sticky`이고, `top`을 JS가 음수로 계산해 넣는다. 그래서 제목 아랫부분 20px만 바 안에 남을 때까지 올라간 뒤 멈춘다.
- 같은 스크롤 구간 동안 왼쪽 아래 기준으로 20px 높이까지 줄어들기 때문에, 멈추는 순간 바 안에 작은 로고로 들어맞는다.
- sticky가 페이지 끝까지 유지되려면 `.bigmark`가 `#root`의 직계 자식이어야 한다. `<header>`나 다른 래퍼 안으로 옮기면 그 래퍼가 끝날 때 함께 풀린다.

**접기 계산 (`shapes.js`)**

- 콘셉트는 철판 띠 한 장(관절로 이은 16조각)을 접어 한글 자모를 만드는 것이다.
- 자모 하나는 `{ base, strokes, turns }`로 정의한다.
  - `strokes`: 획마다 쓰는 조각 수. 합이 `SEGMENTS`와 같아야 한다.
  - `turns`: 획과 획 사이에서 꺾는 각도.
- `toAngles()`는 관절마다의 라디안 값을 만든다.
- `layout()`은 조각 중심점, 관절 위치, 외곽선을 만든다. 모두 바운딩 박스 중심을 원점으로 맞춘다.
- 이 계산을 여러 곳이 함께 쓴다.
  - `FoldScene.jsx`의 3D 띠: 매 프레임 관절 각도를 목표값 쪽으로 감쇠시켜 접히는 애니메이션을 만든다.
  - `Glyph.jsx`의 SVG: Works 목록 아이콘, 상단 제목 옆 ㄱ, 3D 로딩이 실패했을 때의 평면 그림.
- 자모를 추가하려면 `SHAPES`와 `JAMO` 목록에 넣고 `npm run check`를 돌린다.

**스크롤**

- 패럴렉스는 속성으로 선언한다.
  - `data-speed="n"`이 붙은 요소는 스크롤에 맞춰 `y`가 움직인다. 트리거는 요소의 부모다.
  - Works 이미지는 별도로, 프레임 높이에 비례해(`IMAGE_SHIFT_PCT`) 움직이고 확대(`IMAGE_ZOOM`)에서 1로 줄어든다. 이미지는 프레임의 140% 크기라서 이동 폭은 최대 14%까지다.
  - 둘 다 `App.jsx`의 `useParallax`가 처리한다.
- `FilmSection`은 스스로 화면에 고정되어 `clip-path`를 스크롤에 맞춰 열고, `onToggle`에서 영상을 재생하거나 멈춘다.
- `AlleySection`은 ScrollTrigger 진행도를 ref에 쓰고, `LanternScene`이 `useFrame`에서 그 ref를 읽는다.
  - 이 값으로 가로등 회전과 발광 세기를 정한다.
  - 그래서 스크롤 때문에 React가 다시 렌더링되지 않는다.
- 트리거를 만드는 순서가 중요하다.
  - 자식 컴포넌트의 effect(화면 고정)가 `App`의 패럴렉스 effect보다 먼저 실행된다. 그래야 고정 구간이 차지하는 높이가 먼저 측정된다.
  - 화면 고정은 섹션 컴포넌트 안에 둔다.

**3D**

- 히어로(`FoldScene`)와 가로등(`LanternScene`) 두 캔버스 모두 `lazy()`로 불러오고 `SceneBoundary`로 감싸 있다.
- 가로등 GLB는 `vite.config.js`의 `models`에 적혀 있고 `loadGlb('models/lantern.glb')`로 읽는다.

## 스타일

- 스타일은 모두 `src/styles.css`에 있고, 디자인 토큰은 `:root`에 있다.
  - 색: 아연판 회색 `#dcddd8`, 흑철 `#1c1f22`, 마킹 파랑 `#2b47c9`
  - 서체: 제목은 Black Han Sans, 본문은 IBM Plex Sans KR. `index.html`에서 불러온다.
- 페이지 좌우 여백에는 `--page-x`를 쓴다. 본문 폭이 1600px을 넘지 않게 막아 준다. `--gutter`는 요소 사이 간격에만 쓴다.
- 화면 크기 기준점
  - `1200px` 이하: 작업 순서를 2열로 바꾼다.
  - `860px` 이하: 한 단으로 쌓고, 3D 영역을 문구 위로 올린다.
  - `520px`, `380px` 이하: 버튼과 메뉴를 작게 줄인다.
  - `(orientation: landscape) and (max-height: 500px)`: 가로로 든 폰. `--bar-h`를 줄인다.
- 호버 스타일은 `@media (hover: hover)` 안에만 둔다.

## 에셋과 출처 표기

출처 표기는 페이지에 표시된다. 파일을 바꿀 때 표기도 같이 맞춘다.

- `public/models/lantern.glb`: Khronos glTF-Sample-Assets의 "Lantern"(Microsoft, CC0). 약 9.5MB.
- 저장소 루트의 `codex-asset-prompt.md`로 Codex에 만들게 한 자체 에셋. 규격과 대체 텍스트는 `public/assets-manifest.json`에 있다.
  - `public/media/studio-film.{webm,mp4}`와 `studio-film-poster.jpg`: FilmSection 영상. webm을 먼저 쓰고, VP9를 못 쓰는 Safari를 위해 mp4를 둔다.
  - `public/images/works/<slug>.{webp,jpg}`: Works 이미지. `App.jsx`의 `WORKS[].slug`와 파일 이름이 같아야 한다.
  - `public/og.jpg`: 공유 썸네일. `index.html`의 `og:image`는 상대 경로라서, 배포할 때 실제 도메인을 붙인 절대 URL로 바꿔야 한다.
- 스튜디오 이름, 작업 사례, 주소, 메일은 모두 임시 내용이다.
