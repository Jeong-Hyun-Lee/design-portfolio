# CLAUDE.md

공통 개발 지침(코딩 전 생각하기, 단순함 우선, 외과적 변경, 목표 기반 실행, 커밋 메시지 규칙, Caveman 모드, 에이전트 팀 지침)은 다음 파일을 따르세요.

@.claude/common-guidelines.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

포트폴리오 사이트 여러 개를 담는 npm workspaces 저장소다.

- 스택: Vite, React 19(TypeScript 없이 JSX), three.js(@react-three/fiber와 drei), 스크롤은 GSAP ScrollTrigger와 Lenis.
- 화면 문구는 모두 한국어다.
- GitHub: `Jeong-Hyun-Lee/design-portfolio` (main 브랜치).

## 구성

- `apps/<이름>/`: 포트폴리오 하나가 Vite 앱 하나다. 각자 `index.html`, `src/`, `public/`, `vite.config.js`를 갖고, 빌드 결과도 각자의 `dist/`에 나온다.
  - `apps/studio-jeop`: "스튜디오 접" 사이트. 내부 구조는 `apps/studio-jeop/CLAUDE.md`에 있다.
  - `apps/starter`: 새 포트폴리오를 시작할 때 복사하는 최소 앱.
- `packages/shared/` (`@portfolio/shared`): 앱들이 함께 쓰는 코드. 빌드 단계 없이 소스를 그대로 import한다.
  - `vite.js`의 `defineStaticSite({ models })`: 모든 앱의 Vite 설정. 앱의 `vite.config.js`는 이것만 부른다.
  - `src/useSmoothScroll.js`, `src/useInView.js`(`useInView`, `useActiveSection`), `src/SceneBoundary.jsx`, `src/RoomLight.jsx`, `src/loadGlb.js`
  - import 경로는 `@portfolio/shared/useInView.js`처럼 파일 이름까지 쓴다(`exports`의 `./*` → `./src/*`).
- 라이브러리 의존성은 루트 `package.json`에만 둔다. 모든 앱이 같은 버전을 쓴다. 앱의 `package.json`에는 스크립트와 `@portfolio/shared`만 둔다.

## 명령어

- `npm install`: 루트에서 한 번만 하면 된다.
- `npm run dev -w apps/<이름>`: 해당 앱 개발 서버. 루트 `npm run dev`는 studio-jeop을 띄운다.
- `npm run build -w apps/<이름>`: 해당 앱만 빌드. 루트 `npm run build`는 모든 앱을 빌드한다.
- `npm run check`: 테스트가 있는 앱(`check` 스크립트)의 테스트를 모두 돌린다. 지금은 studio-jeop의 `src/shapes.check.js`뿐이다.
- 포트 지정: bash에서는 `npm run dev -w apps/<이름> -- --port N`. PowerShell은 `--` 뒤 인자를 넘기지 못하므로 앱 폴더에서 `npx vite --port N --strictPort`를 쓴다.

## 새 포트폴리오 추가

1. `apps/starter`를 `apps/<새 이름>`으로 복사한다.
2. 복사한 폴더의 `package.json`에서 `name`을 바꾼다.
3. 루트에서 `npm install`을 다시 실행한다. 새 workspace가 연결된다.
4. GLB 모델을 쓰면 `public/` 아래 경로를 그 앱 `vite.config.js`의 `defineStaticSite({ models: [...] })`에 적고, 코드에서는 `loadGlb(경로)`로 읽는다.

## 빌드: `file://` 더블클릭 실행

모든 앱의 `dist/index.html`은 더블클릭(`file://`)으로도 동작해야 한다. `defineStaticSite`가 처리하는 것은 아래와 같다.

- JS 전체를 classic `defer` 스크립트 하나(IIFE, 코드 분할 없음)로 묶는다. `file://`에서는 크롬이 `type="module"`과 청크 로딩을 막기 때문이다.
- CSS의 `crossorigin`을 뗀다.
- `models`에 적은 GLB마다 base64를 담은 `<경로>.js`를 만든다. `loadGlb`는 `file://`일 때만 이 스크립트를 읽고, http에서는 `fetch`로 `.glb`를 읽는다. 그래서 drei `useGLTF` 대신 `loadGlb`와 `GLTFLoader.parseAsync`를 쓴다.
- `base: './'`라서 `dist/`는 어느 하위 경로(GitHub Pages 등)에서도 동작한다. `public/` 에셋은 `/media/...`처럼 루트 경로로 쓰지 말고 `${import.meta.env.BASE_URL}media/...`로 참조한다.
- 새 코드에서 `fetch`/XHR로 로컬 파일을 읽으면 `file://`에서 깨진다. 이미지·영상 태그는 괜찮다.
- 빌드 때 나오는 `import.meta ... iife` 경고는 Vite preload 도우미에서 나는 것이고 동작과 무관하다.

## 개발 서버에서 주의할 점

- `lazy()`로만 불러오는 라이브러리는 `packages/shared/vite.js`의 `LAZY_DEPS`에 적어야 한다.
  - 빠지면 Vite가 실행 도중에 의존성을 다시 묶는다. 그러면 청크 요청이 `504 Outdated Optimize Dep`로 실패하고 화면이 하얗게 빈다.
  - three, drei, gsap의 새 진입점을 import할 때도 마찬가지다.
- 같은 앱의 개발 서버를 두 개 띄우면 캐시가 깨질 수 있다. 꼬였으면 앱 폴더에서 `npx vite --force`로 한 번 실행해 캐시를 새로 만든다.
- 브라우저 콘솔에 `workbox`, `Inter` 폰트, manifest 오류가 보이면 이 프로젝트 문제가 아니다.
  - 같은 localhost 포트에서 예전에 돌렸던 다른 앱의 서비스 워커가 요청을 가로채는 것이다.
  - 개발자 도구에서 사이트 데이터를 지우거나 다른 포트를 쓴다.

## 공통 코드의 동작

- `useSmoothScroll(isEnabled)`
  - Lenis를 `gsap.ticker`로 돌리고, Lenis 스크롤 이벤트를 `ScrollTrigger.update`에 넘긴다.
  - `ignoreMobileResize`를 켠다.
  - 동작 줄이기를 설정한 사용자에게는 `false`를 넘겨 끈다.
- `useInView(ref, { rootMargin })`는 애니메이션보다 리소스를 아끼는 데 쓴다.
  - 예: 캔버스가 화면 밖이면 R3F `frameloop`를 `'never'`로 바꾸고, 무거운 에셋은 `rootMargin: '100% 0px'`로 한 화면 앞에서 불러온다.
- `SceneBoundary`: 3D 로딩 실패나 WebGL 미지원 때 `fallback`만 보이고 나머지 페이지는 계속 동작하게 한다.
- `RoomLight`: 금속 반사용 환경맵을 로컬에서 만든다(PMREM `RoomEnvironment`). drei의 `<Environment preset>`은 외부 CDN에서 HDR을 받아 오므로 쓰지 않는다.
- GSAP 동작은 `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` 안에 두고, 동작 줄이기 쪽에는 정적인 대안을 둔다.
