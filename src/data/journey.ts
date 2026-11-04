import type { Journey, MemoryPhoto } from '@/types/journey'

function placeholder(id: string, caption: string): MemoryPhoto {
  return {
    id,
    src: '/images/memory-placeholder.svg',
    thumbnail: '/images/memory-placeholder.svg',
    width: 1200,
    height: 800,
    alt: '照片待加入，暫以山景插畫呈現',
    caption,
  }
}

/** Sample content only. Replace with the travellers' actual itinerary and selected photos. */
export const journey: Journey = {
  title: '冰島，沿途的我們',
  totalDays: 18,
  isDemo: true,
  days: [
    {
      id: 'day-01',
      number: 1,
      title: '往島嶼的深處',
      summary: '從城市出發，把沿路值得留下的片刻串在一起。',
      routeKind: 'illustrative',
      route: [
        [-21.9426, 64.1466],
        [-21.129, 64.2559],
        [-20.3024, 64.3104],
        [-20.1199, 64.3271],
      ],
      memories: [
        {
          id: 'first-stop',
          title: '旅程從這裡開始',
          locationName: '雷克雅維克 Reykjavík',
          coordinate: [-21.9426, 64.1466],
          routeIndex: 0,
          story: '這裡可以放上你們出發時的心情，或第一個想記住的小故事。',
          photos: [
            placeholder('arrival', '第一張，故事的起點。'),
            placeholder('departure', '第二張，接著發生的事。'),
          ],
        },
        {
          id: 'between-continents',
          title: '走進遼闊的風景',
          locationName: '辛格維利爾 Þingvellir',
          coordinate: [-21.129, 64.2559],
          routeIndex: 1,
          story: '把風景與同行的人放進同一段回憶。照片可以依當時發生的順序排列。',
          photos: [
            placeholder('landscape', '先看見的風景。'),
            placeholder('moment', '接著，留下當時的片刻。'),
          ],
        },
        {
          id: 'waterfall',
          title: '停下來的理由',
          locationName: '黃金瀑布 Gullfoss',
          coordinate: [-20.1199, 64.3271],
          routeIndex: 3,
          story: '這裡留給你們在這個地方發生的故事。',
          photos: [placeholder('waterfall', '一張能打開這段回憶的照片。')],
        },
      ],
    },
    {
      id: 'day-02',
      number: 2,
      title: '沿著南岸，慢慢走',
      summary: '讓路線帶我們靠近海，也靠近那些意料之外的回憶。',
      routeKind: 'illustrative',
      route: [
        [-20.9971, 63.9335],
        [-20.5, 63.8],
        [-19.9881, 63.6156],
        [-19.5114, 63.5321],
        [-19.009, 63.4186],
      ],
      memories: [
        {
          id: 'south-start',
          title: '再一次出發',
          locationName: '塞爾福斯 Selfoss',
          coordinate: [-20.9971, 63.9335],
          routeIndex: 0,
          story: '回憶也可以是一頓早餐、一段對話，或準備出發的小插曲。',
          photos: [placeholder('breakfast', '當天的第一個片刻。')],
        },
        {
          id: 'south-waterfall',
          title: '瀑布前的一個下午',
          locationName: '塞里雅蘭瀑布 Seljalandsfoss',
          coordinate: [-19.9881, 63.6156],
          routeIndex: 2,
          story: '挑幾張前後相連的照片，讓別人也能感受你們當時的經歷。',
          photos: [placeholder('approach', '走近之前。'), placeholder('after', '走近之後。')],
        },
        {
          id: 'south-end',
          title: '在海邊收起這一天',
          locationName: '維克 Vík',
          coordinate: [-19.009, 63.4186],
          routeIndex: 4,
          story: '用一段你們想留下的回憶，為這一天收尾。',
          photos: [placeholder('evening', '這一天，最後想記住的畫面。')],
        },
      ],
    },
  ],
}
