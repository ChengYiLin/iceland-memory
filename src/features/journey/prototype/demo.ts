// PROTOTYPE: invented stories and illustration placeholders, not the travellers' itinerary.
import type { Coordinate } from '@/types/journey'

const entries: [string, string, Coordinate, string][] = [
  [
    '早餐還沒吃完，就想出發',
    'Selfoss · 塞爾福斯',
    [-20.997, 63.934],
    '咖啡還熱著，我們已經開始猜今天會遇見什麼。',
  ],
  [
    '為一匹馬，多停了十分鐘',
    'Hella · 海拉附近',
    [-20.398, 63.835],
    '本來只想伸伸腿，最後卻在圍欄邊待了好久。',
  ],
  [
    '那包被風吹走的零食',
    'Hvolsvöllur · 沿途停靠',
    [-20.225, 63.751],
    '回頭想起來，比起風景，反而記得兩個人追袋子的樣子。',
  ],
  [
    '一起淋濕，也一起大笑',
    'Seljalandsfoss · 塞里雅蘭瀑布',
    [-19.988, 63.616],
    '走進水霧之前還在猶豫。走出來之後，只有笑聲。',
  ],
  [
    '午餐比計畫晚了一點',
    'Skógar · 斯科加爾',
    [-19.511, 63.532],
    '找了一處避風的地方，把簡單的午餐吃成了最難忘的一餐。',
  ],
  [
    '在海邊，忽然都不說話了',
    'Dyrhólaey · 迪霍拉里',
    [-19.13, 63.405],
    '一路聊個不停，到了海邊卻安靜下來。那一刻不需要再說什麼。',
  ],
  [
    '把這一天留在窗邊',
    'Vík · 維克',
    [-19.009, 63.419],
    '天色慢慢暗了，我們把今天的照片又翻了一次。',
  ],
]

// Local inline illustrations keep this throwaway prototype independent of image services.
function illustration(index: number, frame: number) {
  const sky = ['#cddbd9', '#ddcfb5', '#b8c9d0', '#dbcdc9', '#d6dcb9', '#bdd3d1', '#c7c6d8'][
    (index + frame) % 7
  ]!
  const ridge = ['#637b6a', '#7c8170', '#596d78', '#8a7069', '#6a7853', '#537c79', '#6b6787'][
    (index + frame) % 7
  ]!
  const w = frame === 1 ? 800 : 1200
  const h = frame === 1 ? 1100 : 800
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${sky}"/><circle cx="${w * 0.73}" cy="${h * 0.25}" r="60" fill="#f7edcc"/><path d="M0 ${h * 0.65} L${w * 0.25} ${h * 0.24} L${w * 0.5} ${h * 0.62} L${w * 0.75} ${h * 0.38} L${w} ${h * 0.65} V${h} H0Z" fill="${ridge}"/><path d="M0 ${h * 0.8} Q${w * 0.4} ${h * 0.55} ${w} ${h * 0.77} V${h} H0Z" fill="#344f48"/><path d="M${w * 0.25} ${h} Q${w * 0.65} ${h * 0.8} ${w * 0.52} ${h * 0.63}" fill="none" stroke="#c2b899" stroke-width="30"/><text x="40" y="70" font-family="sans-serif" font-size="22" fill="#28463f">ILLUSTRATION / MEMORY ${index + 1} / FRAME ${frame + 1}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const memories = entries.map(([title, place, coordinate, story], index) => ({
  id: index,
  title,
  place,
  coordinate,
  story,
  photos: Array.from({ length: index === 1 ? 5 : 3 }, (_, frame) => ({
    src: illustration(index, frame),
    caption: ['先記住眼前的風景。', '再留一點空間，給同行的人。', '最後，把這個片刻帶回家。'][
      frame % 3
    ]!,
  })),
}))
export type DemoMemory = (typeof memories)[number]
export const route = memories.map((memory) => memory.coordinate)
export type Variant = 'A' | 'B' | 'C'

const dayTwoEntries: typeof entries = [
  ['出發前，再看一次海', 'Vík · 維克', [-19.009, 63.419], '昨晚看過的海，早上又像是另一個地方。'],
  [
    '在綠色荒原裡繞了一小圈',
    'Kirkjubæjarklaustur · 教堂鎮附近',
    [-18.06, 63.79],
    '本來只打算停一下，卻沿著小路多走了一段。',
  ],
  [
    '冰川比想像中安靜',
    'Skaftafell · 斯卡夫塔山',
    [-16.97, 64.016],
    '我們把聲音放輕，像怕打擾眼前的風景。',
  ],
  [
    '看著冰，一起等光',
    'Jökulsárlón · 傑古沙龍冰河湖',
    [-16.18, 64.048],
    '雲慢慢移開，我們也慢慢忘了時間。',
  ],
  ['今天的最後一口熱湯', 'Höfn · 赫本', [-15.208, 64.253], '在餐桌前交換今天最喜歡的一張照片。'],
]
const dayTwoMemories = dayTwoEntries.map(([title, place, coordinate, story], index) => ({
  id: index,
  title,
  place,
  coordinate,
  story,
  photos: Array.from({ length: [4, 3, 5, 3, 4][index]! }, (_, frame) => ({
    src: illustration(index + 7, frame),
    caption: [
      '今天，從這個片刻開始。',
      '留住當時的心情。',
      '一起看見的風景。',
      '再多停留一下。',
      '把這段回憶帶走。',
    ][frame]!,
  })),
}))
export const days = [
  { number: 1, title: '沿著南岸，記住我們', anchor: [-20.4, 63.8] as Coordinate, memories },
  {
    number: 2,
    title: '往東，靠近冰川的光',
    anchor: [-16.7, 64.05] as Coordinate,
    memories: dayTwoMemories,
  },
]
export type DemoDay = (typeof days)[number]
