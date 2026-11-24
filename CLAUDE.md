# CLAUDE.md

공통 개발 지침(코딩 전 생각하기, 단순함 우선, 외과적 변경, 목표 기반 실행, 커밋 메시지 규칙, Caveman 모드, 에이전트 팀 지침)은 다음 파일을 따르세요.

@.claude/common-guidelines.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

문래동에 있다는 설정의 가상 간판·브랜드 스튜디오 "스튜디오 접"의 랜딩페이지다. 한 페이지짜리 사이트다.

- 스택: Vite, React 19(TypeScript 없이 JSX), three.js(@react-three/fiber와 drei), 스크롤은 GSAP ScrollTrigger와 Lenis.
- 화면 문구는 모두 한국어다.
- GitHub: `Jeong-Hyun-Lee/design-portfolio` (main 브랜치).

## 명령어

- `npm run dev`: Vite 개발 서버를 띄운다. 기본 포트는 5173이다.
- `npm run build`: `dist/`에 프로덕션 빌드를 만든다. `dist/index.html`을 더블클릭(`file://`)해도 동작해야 한다.
  - 빌드에서 `file-protocol-build` 플러그인이 하는 일:
    - JS 전체를 classic `defer` 스크립트 하나(IIFE, 코드 분할 없음, 약 1.3MB)로 묶는다. `file://`에서는 크롬이 `type="module"`과 청크 로딩을 막기 때문이다.
    - CSS의 `crossorigin`을 뗀다.
    - GLB를 base64로 담은 `models/lantern.glb.js`를 추가로 만든다.
  - `LanternScene`은 `file://`일 때만 이 스크립트 태그로 모델을 읽고, http에서는 `fetch`로 `.glb`를 읽는다. 그래서 drei `useGLTF` 대신 `GLTFLoader.parseAsync`를 쓴다.
  - 빌드 때 나오는 `import.meta ... iife` 경고는 Vite preload 도우미에서 나는 것이고 동작과 무관하다.
  - 새로 넣는 코드에서 `fetch`/XHR로 로컬 파일을 읽으면 `file://`에서 깨진다. 이미지·영상 태그는 괜찮다.
- `npm run check`: 유일한 테스트인 `src/shapes.check.js`를 실행한다.
  - 테스트 프레임워크 없이 `node:assert`로 접기 계산을 검증한다.
- PowerShell에서는 `npm run dev -- --port N`의 포트 옵션이 전달되지 않는다. `npx vite --port N --strictPort`를 쓴다.
- `vite.config.js`의 `base`가 `'./'`라서 `dist/`는 어느 하위 경로(GitHub Pages `/design-portfolio/` 등)에서도 동작한다. `public/` 에셋은 `/media/...`처럼 루트 경로로 쓰지 말고 `${import.meta.env.BASE_URL}media/...`로 참조한다.
## 개발 서버에서 주의할 점

- (개발 서버 한정, 빌드는 하나로 묶인다) `lazy()`로만 불러오는 모듈이 쓰는 라이브러리는 모두 `vite.config.js`의 `optimizeDeps.include`에 적어야 한다.
  - 빠지면 Vite가 실행 도중에 의존성을 다시 묶는다. 그러면 청크 요청이 `504 Outdated Optimize Dep`로 실패하고 화면이 하얗게 빈다.
  - three, drei, gsap의 새 진입점을 import할 때도 마찬가지다.
- 이 폴더의 개발 서버는 모두 `node_modules/.vite` 캐시를 함께 쓴다.
  - 서버를 하나 더 띄우면 먼저 떠 있던 서버의 캐시가 깨질 수 있으니 한 번에 하나만 띄운다.
  - 꼬였으면 `npx vite --force`로 한 번 실행해 캐시를 새로 만든다.
- 브라우저 콘솔에 `workbox`, `Inter` 폰트, manifest 오류가 보이면 이 프로젝트 문제가 아니다.
  - 같은 localhost 포트에서 예전에 돌렸던 다른 앱의 서비스 워커가 요청을 가로채는 것이다.
  - 개발자 도구에서 사이트 데이터를 지우거나 다른 포트를 쓴다.

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
- 이 계산을 세 곳이 함께 쓴다.
  - `FoldScene.jsx`의 3D 띠: 매 프레임 관절 각도를 목표값 쪽으로 감쇠시켜 접히는 애니메이션을 만든다.
  - Works 목록의 SVG 아이콘(`App.jsx`의 `Glyph`)
  - 3D 로딩이 실패했을 때 보이는 평면 그림
- 자모를 추가하려면 `SHAPES`와 `JAMO` 목록에 넣고 `npm run check`를 돌린다.

**스크롤**

- `useSmoothScroll`
  - Lenis를 `gsap.ticker`로 돌리고, Lenis 스크롤 이벤트를 `ScrollTrigger.update`에 넘긴다.
  - `ignoreMobileResize`를 켠다.
  - 사용자가 동작 줄이기를 설정했으면 꺼진다.
- 패럴렉스는 속성으로 선언한다.
  - `data-speed="n"`이 붙은 요소는 스크롤에 맞춰 `y`가 움직인다.
  - `App.jsx`의 `useParallax`가 처리하고, 트리거는 요소의 부모 섹션이다.
- `FilmSection`은 스스로 화면에 고정되어 `clip-path`를 스크롤에 맞춰 열고, `onToggle`에서 영상을 재생하거나 멈춘다.
- `AlleySection`은 ScrollTrigger 진행도를 ref에 쓰고, `LanternScene`이 `useFrame`에서 그 ref를 읽는다.
  - 이 값으로 가로등 회전과 발광 세기를 정한다.
  - 그래서 스크롤 때문에 React가 다시 렌더링되지 않는다.
- 트리거를 만드는 순서가 중요하다.
  - 자식 컴포넌트의 effect(화면 고정)가 `App`의 패럴렉스 effect보다 먼저 실행된다. 그래야 고정 구간이 차지하는 높이가 먼저 측정된다.
  - 화면 고정은 섹션 컴포넌트 안에 둔다.
- GSAP 동작은 모두 `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` 안에 있다. 동작 줄이기를 켠 쪽에는 정적인 대안을 둔다(예: 영상 기본 재생 컨트롤).

**IntersectionObserver (`useInView.js`)**

- `useInView(ref, { rootMargin })`는 애니메이션이 아니라 리소스를 아끼는 데 쓴다.
  - 캔버스가 화면 밖에 있으면 R3F `frameloop`를 `'never'`로 바꿔 렌더링을 멈춘다.
  - 가로등 GLB와 영상은 한 화면 거리 안으로 들어올 때 불러온다(`rootMargin: '100% 0px'`).
- `useActiveSection`은 지금 보고 있는 섹션의 메뉴 링크에 `aria-current`를 단다.

**3D**

- 두 캔버스 모두 `lazy()`로 불러오고(개발 서버에서만 별도 청크) 에러 처리 컴포넌트 `SceneBoundary`로 감싸 있다.
  - 로딩에 실패하거나 WebGL이 없으면 평면 그림으로 대체되거나 빈 영역으로 남는다.
  - 나머지 페이지는 계속 동작한다.
- 금속 반사에 쓰는 환경맵은 `RoomLight`가 만든다(로컬 PMREM `RoomEnvironment`).
  - drei의 `<Environment preset>`은 외부 CDN에서 HDR을 받아 오므로 쓰지 않는다.

## 스타일

- 스타일은 모두 `src/styles.css`에 있고, 디자인 토큰은 `:root`에 있다.
  - 색: 아연판 회색 `#dcddd8`, 흑철 `#1c1f22`, 마킹 파랑 `#2b47c9`
  - 서체: 제목은 Black Han Sans, 본문은 IBM Plex Sans KR. `index.html`에서 불러온다.
- 페이지 좌우 여백에는 `--page-x`를 쓴다. 본문 폭이 1600px을 넘지 않게 막아 준다. `--gutter`는 요소 사이 간격에만 쓴다.
- 화면 크기 기준점
  - `1200px` 이하: 작업 순서를 2열로 바꾼다.
  - `860px` 이하: 한 단으로 쌓고, 3D 영역을 문구 위로 올린다.
  - `520px`, `380px` 이하: 버튼과 메뉴를 작게 줄인다.
  - `(orientation: landscape) and (max-height: 500px)`: 가로로 든 폰.
- 호버 스타일은 `@media (hover: hover)` 안에만 둔다.

## 에셋과 출처 표기

출처 표기는 페이지에 표시된다. 파일을 바꿀 때 표기도 같이 맞춘다.

- `public/models/lantern.glb`: Khronos glTF-Sample-Assets의 "Lantern"(Microsoft, CC0). 약 9.5MB.
- `codex-asset-prompt.md`로 Codex에 만들게 한 자체 에셋. 규격과 대체 텍스트는 `public/assets-manifest.json`에 있다.
  - `public/media/studio-film.{webm,mp4}`와 `studio-film-poster.jpg`: FilmSection 영상. 정지 이미지를 ffmpeg로 이어 만든 것이다. webm을 먼저 쓰고, VP9를 못 쓰는 Safari를 위해 mp4를 둔다.
  - `public/images/works/<slug>.{webp,jpg}`: Works 이미지. `App.jsx`의 `WORKS[].slug`와 파일 이름이 같아야 한다.
  - `public/og.jpg`: 공유 썸네일. `index.html`의 `og:image`는 상대 경로라서, 배포할 때 실제 도메인을 붙인 절대 URL로 바꿔야 한다.
- 스튜디오 이름, 작업 사례, 주소, 메일은 모두 임시 내용이다.
