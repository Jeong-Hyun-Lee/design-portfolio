# product

3D 가상 공간 서비스 소개 페이지다. 제품명 "Room 3D"는 가칭이고 `src/content.js`의 `PRODUCT` 하나만 바꾸면 된다. 저장소 공통 규칙(명령어, `file://` 빌드, 공통 코드)은 루트 `CLAUDE.md`에 있다.

- 개발: `npm run dev -w apps/product`
- 디자인 기준
  - 히어로: `TOP_DESIGN.md`. 회색 `#f1f2f3`, 시스템 서체 700~800, 창 카드 하나, 검은 버튼 하나. 색은 3D 렌더에서만 나온다.
  - 나머지: `DESIGN.md`. 크림 `#ebe9e1`, 얇은 세리프 제목(Noto Serif KR), Geist 본문.
    - 주황 `#ff7714`은 테두리·화살표·표시에만 쓰고 면 채우기나 본문 글자에는 쓰지 않는다.
    - 모서리는 0~2px.
  - DESIGN의 Stone `#a69b92`는 글자 대비가 부족해서, 글자에는 `--stone-text`(`#6f655d`)를 쓴다.

## 구조

섹션 순서(`App.jsx`): Hero → Manifesto → Build → Demo → Playground → Scenes → Specs → Story → Closing. Nav는 히어로가 대부분 지나가면 내려온다.

**3D (`src/three/`)**
- `RoomModel.jsx`: 데모 영상의 방(나무 바닥, 뒷벽·왼쪽 벽, 스크린, 걸린 패널, 아바타)을 기본 도형으로 만든 모델이다. 세 장면이 함께 쓴다.
  - `build` ref(0~1): 벽 → 패널 → 배치 조정 → 아바타 순으로 세워진다. `buildPhases()`가 진행도를 단계별로 나눈다.
  - `pose`: 패널 위치를 직접 지정한다(Playground 슬라이더).
  - `arrangePose()`: 배치 조정 단계의 패널 움직임. `Build.jsx`의 편집기 막대도 같은 함수로 값을 계산한다.
- `Lasers.jsx`: 히어로의 초록 레이저와 바닥 격자. 직접 쓴 셰이더(ShaderMaterial)다.
- `textures.js`: 나무 바닥과 패널 화면을 canvas로 그린다. 이미지 파일이 필요 없어 `file://`에서도 동작한다.
- 패널에 데모 영상을 VideoTexture로 넣지 않은 이유: `file://`에서 열면 영상이 다른 출처로 취급돼 WebGL 텍스처로 쓸 수 없다.

**스크롤·관찰 기법이 쓰인 곳**
- CSS sticky:
  - Build의 3D 무대(그리드 안이라 `align-self: start`가 필요하다)
  - Specs 제목
- GSAP pin:
  - Demo: 영상 프레임이 `clip-path`로 열리고, 고정된 동안만 재생한다.
  - Scenes: 세로 스크롤로 가로 트랙을 움직이고, 사진은 `containerAnimation`으로 카드 안에서 따로 움직인다.
- 패럴렉스: `data-speed`(px 이동)와 `data-parallax-img`(이미지 높이 % 이동), App의 `useParallax`.
- IntersectionObserver:
  - Nav 표시
  - 활성 메뉴
  - Build 활성 단계
  - Specs 숫자 카운트
  - `data-reveal` 페이드인
  - 화면 밖 캔버스 렌더링 중지(`frameloop`)
  - 영상 지연 로딩
- View Transitions: Playground에서 파일 형식을 바꾸면 무대와 설명이 왼쪽에서 닦아내듯 바뀐다. 지원하지 않는 브라우저나 동작 줄이기 설정에서는 바로 바뀐다.

## 에셋

- `public/media/product-demo.mp4`: 사용자가 준 실제 서비스 화면 녹화(약 103초, 1278x720, 오디오 포함).
  - 13초 무렵 공유 파일 속 회사 로고가 나온다. 공개 전에 확인이 필요하다.
  - `product-demo-poster.jpg`는 45초 지점 프레임이다.
- 사진은 `codex-asset-prompt.md`로 Codex에 요청한다. 파일이 없으면 `Photo.jsx`가 자리 표시를 보여 준다.
- `Specs`의 숫자(500MB, 8명 등)는 데모 영상 화면에서 읽은 값이다. 실제 사양과 맞는지 확인이 필요하다.
