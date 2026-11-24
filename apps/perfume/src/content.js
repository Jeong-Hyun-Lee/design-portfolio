// All page copy and product data. The brand is fictional (portfolio piece).

export const BRAND = '윤슬'
export const BRAND_LATIN = 'YUNSEUL'

export const NAV = [
  { id: 'notes', label: '향' },
  { id: 'anatomy', label: '병' },
  { id: 'atelier', label: '고르기' },
  { id: 'craft', label: '공방' },
]

// Order matters: index = particle shape (0 top, 1 middle, 2 base).
export const NOTES = [
  {
    tier: '탑 노트',
    latin: 'TOP',
    title: '유자 껍질, 베르가못',
    body: '뚜껑을 여는 순간 터지는 첫 향. 겨울 유자 껍질의 쌉쌀한 기름이 빛 알갱이처럼 위로 흩어집니다.',
  },
  {
    tier: '미들 노트',
    latin: 'HEART',
    title: '백목련, 물이끼',
    body: '십 분쯤 지나면 꽃잎이 열립니다. 이른 봄 목련과 젖은 돌 틈의 이끼가 피부 온도에서 겹쳐집니다.',
  },
  {
    tier: '베이스 노트',
    latin: 'BASE',
    title: '백단, 젖은 돌',
    body: '마지막까지 남는 향. 물결이 잦아들듯 백단의 따뜻한 나무 냄새가 낮게 깔립니다.',
  },
]

// Exploded-view parts, top to bottom. `part` keys match three/Bottle.jsx.
export const PARTS = [
  { part: 'cap', name: '마개', spec: '단조 황동, 손으로 연마한 여덟 면' },
  { part: 'collar', name: '분사구', spec: '0.08ml씩 안개처럼 뿌리는 펌프' },
  { part: 'glass', name: '유리', spec: '바닥 두께 9mm 크리스털, 팔각으로 깎아 빛을 가릅니다' },
  { part: 'liquid', name: '향수', spec: '부향률 18% 오 드 퍼퓸' },
]

// Gallery walls from DESIGN.md. liquid = colour of the juice inside the bottle.
export const SCENTS = [
  { id: 'dawn', no: '01', name: '새벽볕', mood: '동이 트기 전 강가의 첫 빛', wall: '#fcede1', liquid: '#f3a37a' },
  { id: 'rain', no: '02', name: '비숲', mood: '소나기가 지나간 오후의 숲', wall: '#eefcef', liquid: '#8fd3a0' },
  { id: 'night', no: '03', name: '밤물결', mood: '달빛이 부서지는 늦은 밤의 바다', wall: '#e6def0', liquid: '#9a86d8' },
]

export const CAPS = [
  { id: 'chrome', name: '크롬' },
  { id: 'brass', name: '황동' },
  { id: 'matte', name: '무광 흑' },
]

// ml -> price in KRW
export const VOLUMES = [
  { ml: 30, price: 148000 },
  { ml: 50, price: 210000 },
  { ml: 100, price: 320000 },
]

export const ENGRAVING_MAX = 10

export const CRAFT = [
  { figure: '41', unit: '일', label: '원료를 숙성하는 기간' },
  { figure: '8', unit: '면', label: '유리병을 손으로 깎는 면' },
  { figure: '300', unit: '병', label: '한 달에 만드는 양' },
]
