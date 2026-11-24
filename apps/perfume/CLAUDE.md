# perfume

가상 향수 브랜드 "윤슬"의 런칭 페이지다. WebGL 렌더링을 보여 주려고 만든 포트폴리오이고, 브랜드·가격·공방은 모두 지어낸 것이다(푸터에 밝힌다). 저장소 공통 규칙은 루트 `CLAUDE.md`에 있다.

- 개발: `npm run dev -w apps/perfume`
- 테스트: `npm run check -w apps/perfume` (`src/check.js`: 병 단면, 입자 목표 형태, 워드마크 획, 스크롤 단계 계산, 각인 입력 정리)
- 디자인 기준
  - 어두운 구간(히어로, 향 노트, 병 분해): `TOP_DESIGN.md` (Vivid+Co). 색은 유리가 가르는 프리즘 빛에서만 나온다.
  - 밝은 구간(전환, 구성기, 공방): `DESIGN.md` (Letter). 갤러리 벽 3색 = 향 3종, 모서리 2px, 행동 버튼은 청록 하나.
  - 마지막 섹션은 Hyper Tria 구도(검정 위 크롬 워드마크).

## 구조

캔버스는 화면 뒤에 고정된 **하나**뿐이다(`three/Experience.jsx`). DOM 섹션이 그 위로 스크롤되고, 스크롤 위치는 React를 거치지 않고 `rig.js`의 `rig` 객체에 쓰인다.

- `App.jsx`의 `useScrollRig`: 스크롤마다 `[data-stage]` 섹션의 위치를 읽어 `rig.stage`(0 히어로 → 1 향 → 2 병 → 3 구성기 → 4 마무리), `rig.notes`, `rig.anatomy`, `rig.velocity`를 쓰고 CSS 변수 `--light`도 갱신한다. 불투명한 공방 섹션이 화면을 다 덮으면 캔버스 `frameloop`를 멈춘다.
- `rig.js`: 단계별 병 위치 키프레임(`stageKeyframes`, 가로/세로 화면 따로), 밝기(`lightness`), 입자 형태 블렌드(`noteBlend`)를 계산하는 순수 함수.
- `config.js`: 구성기 선택값 저장소. DOM 패널과 3D 병(서로 다른 React 트리)이 `useConfig()`로 같이 읽는다.

**3D (`src/three/`)**
- `Bottle.jsx`: 팔각 크리스털 병. 유리는 drei `MeshTransmissionMaterial`(굴절, 색수차), 향수는 `liquidMaterial.js`의 직접 쓴 셰이더(채움 높이로 잘라내고, 병의 움직임에 따라 감쇠 스프링으로 출렁인다). 병 분해 때 부품이 흩어지고 `focusPoint`를 피사계 심도에 넘긴다.
- `bottleShape.js`: 병·향수 단면, 부품 치수, 분해 오프셋. 숫자만 있어서 테스트할 수 있다.
- `NoteParticles.jsx`: GPGPU 입자(three `GPUComputationRenderer`, 위치를 half-float 텍스처에 두고 셰이더로 적분). 목표 형태 4개(`noteShapes.js`: 흩어진 빛, 탑 나선, 미들 목련, 베이스 물결) 사이를 섞고 컬 노이즈로 흐르며 포인터를 피한다.
- `HeroTitle.jsx`: 병 뒤에 둔 거대한 "윤슬"(canvas 텍스처)과 빛줄기. 유리가 이것을 굴절시키는 것이 히어로의 핵심 연출이다.
- `Wordmark.jsx` + `wordmark.js`: 마무리 섹션의 크롬 "윤슬". 획을 캡슐과 토러스로 만든다(한글 폰트 지오메트리 없이).
- `Effects.jsx`: 후처리. 피사계 심도(데스크톱만), 블룸(HDR 1 이상만), 스크롤 속도에 따라 커지는 색수차, 필름 그레인, 비네트, Neutral 톤 매핑.
- `textures.js`: 히어로 제목과 병 라벨을 canvas로 그린다. 페이지의 Google Fonts를 그대로 쓰므로 폰트 파일이 따로 필요 없고 `file://`에서도 된다.
- 환경 반사는 drei `<Environment>` 안의 `Lightformer`로 로컬에서 만든다(외부 HDR 없음).

**성능**
- 터치 기기·좁은 화면(`isLite`): 입자 112²(데스크톱 192²), 투과 해상도 256, 뒷면 투과·피사계 심도·MSAA 끔.
- drei `PerformanceMonitor`가 프레임이 떨어지면 해상도(dpr)를 1로 내린다.
- 입자가 안 보이는 단계에서는 시뮬레이션 패스를 건너뛴다.

## 주의

- 개발 중 `rig.js`를 고치면 HMR이 모듈을 둘로 나눠 장면이 스크롤을 따라가지 않을 수 있다. 새로고침(F5)하면 된다.
- 동작 줄이기 설정: Lenis 끔, 병 자동 회전·흔들림 끔, 입자 흐름 약하게, 색수차 고정.
