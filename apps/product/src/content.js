// All page copy. The product name is a placeholder until the real one is decided.
export const PRODUCT = 'Room 3D'

export const NAV = [
  { id: 'build', label: '만들기' },
  { id: 'demo', label: '시연' },
  { id: 'playground', label: '직접 옮기기' },
  { id: 'scenes', label: '쓰임' },
  { id: 'specs', label: '사양' },
]

export const MANIFESTO =
  '회의실을 빌리지 않아도 됩니다. 파일을 올리면 벽에 걸리고, 사람들은 아바타로 걸어 들어와 그 앞에 섭니다. 링크 하나로 열리는 전시장이자 강의실이자 회의실입니다.'

// Build steps: the 3D room assembles in this order as the section scrolls.
export const STEPS = [
  {
    title: '공간을 엽니다',
    body: '나무 바닥과 흰 벽, 큰 스크린이 있는 기본 전시장이 바로 준비됩니다. 따로 설치할 것은 없습니다.',
  },
  {
    title: '파일을 올립니다',
    body: '영상, PDF 문서, 3D 모델을 공유 목록에서 고르면 스크린 앞에 패널로 걸립니다. 공간마다 500MB까지 올릴 수 있습니다.',
  },
  {
    title: '자리를 맞춥니다',
    body: 'X·Y·Z 위치와 회전, 크기를 막대 하나씩으로 조정합니다. 가로와 세로 방향도 바꿀 수 있고, 마음에 안 들면 초기화합니다.',
  },
  {
    title: '함께 봅니다',
    body: '초대받은 사람은 아바타로 들어와 같은 패널 앞에 섭니다. 채팅과 감정 표현으로 이야기를 나눕니다.',
  },
]

export const MEDIA = [
  { key: 'video', label: '영상', note: 'MP4 영상은 패널 안에서 바로 재생됩니다. 재생, 볼륨, 전체 화면 조작이 패널에 붙어 있습니다.' },
  { key: 'doc', label: '문서', note: 'PDF는 한 장씩 넘겨 보는 패널로 걸립니다. 발표 자료를 벽에 붙여 두고 설명할 때 씁니다.' },
  { key: 'model', label: '3D 모델', note: 'FBX 모델은 공간 안에 실물처럼 놓입니다. 사람들이 주위를 돌며 직접 살펴봅니다.' },
]

export const SCENES = [
  { slug: 'training', title: '사내 교육', body: '교육 영상을 벽에 걸어 두고, 신입 사원이 각자 시간에 들어와 봅니다.' },
  { slug: 'expo', title: '온라인 전시', body: '제품 3D 모델을 공간 가운데에 놓고 관람객이 주위를 돌며 살펴봅니다.' },
  { slug: 'recruiting', title: '채용 설명회', body: '회사 소개 영상 앞에서 지원자와 담당자가 아바타로 만나 질문을 주고받습니다.' },
  { slug: 'classroom', title: '수업', body: '강의 자료 PDF를 넘기며 설명하고, 학생들은 채팅으로 질문합니다.' },
  { slug: 'review', title: '디자인 리뷰', body: '시안을 나란히 걸어 두고 팀이 함께 걸어 다니며 의견을 남깁니다.' },
]

// Counted up when they scroll into view.
export const FIGURES = [
  { value: 500, unit: 'MB', label: '공간당 저장 용량' },
  { value: 8, unit: '명', label: '한 공간 동시 접속' },
  { value: 3, unit: '종', label: '지원 파일 형식' },
  { value: 5, unit: '가지', label: '배치 조정 항목' },
]

export const SPEC_ROWS = [
  ['지원 파일', 'MP4 영상, PDF 문서, FBX 3D 모델'],
  ['배치 조정', 'X·Y·Z 위치, 회전, 크기, 가로·세로 방향, 초기화'],
  ['저장 용량', '공간당 500MB'],
  ['동시 접속', '공간당 8명'],
  ['소통', '채팅, 감정 표현, 메시지'],
  ['화면', 'UI 숨기기로 공간만 보기'],
]
