import type { Collection, ContentDay } from '@/types/content'
import type { Coordinate } from '@/types/journey'

// Deliberate daily highlights from the actual itinerary, never invented stops.
const highlights: Record<number, { memory: string; label: string; compactLabel?: string }> = {
  2: { memory: 'day-02-memory-03', label: '哈爾格林姆教堂' },
  3: { memory: 'day-03-memory-04', label: '瓦汀舍利爾洞穴' },
  4: { memory: 'day-04-memory-05', label: '犀牛石' },
  5: { memory: 'day-05-memory-03', label: 'Glaumbær 草皮屋', compactLabel: '草皮屋' },
  6: { memory: 'day-06-memory-01', label: '森林溫泉' },
  7: { memory: 'day-07-memory-04', label: '馬蹄峽谷' },
  8: { memory: 'day-08-memory-02', label: 'Víti 火口湖' },
  9: { memory: 'day-09-memory-04', label: 'Hengifoss 瀑布', compactLabel: 'Hengifoss' },
  10: { memory: 'day-10-memory-02', label: 'Gufufoss・東部峽灣', compactLabel: 'Gufufoss 瀑布' },
  11: { memory: 'day-11-memory-04', label: '赫本・龍蝦晚餐' },
  12: { memory: 'day-12-memory-02', label: '再訪蝙蝠山' },
  13: { memory: 'day-13-memory-04', label: '羽毛峽谷' },
  14: { memory: 'day-14-memory-06', label: '西人島' },
  15: { memory: 'day-15-memory-01', label: '藍湖溫泉' },
  16: { memory: 'day-16-memory-04', label: '黃金圈・Gullfoss', compactLabel: 'Gullfoss 瀑布' },
}
export interface DayAnchor {
  coordinate: Coordinate
  label: string
  compactLabel?: string
  kind: 'highlight' | 'area'
}
export function dayAnchor(day: ContentDay, collection: Collection): DayAnchor | null {
  if (!day.regionIds.length && day.memories.every((m) => m.locationStatus === 'flight')) return null
  const highlight = highlights[day.number]
  const preferred = day.memories.find(
    (m) => m.id === highlight?.memory && m.locationStatus === 'confirmed' && m.coordinate,
  )
  if (preferred?.coordinate)
    return {
      coordinate: preferred.coordinate,
      label: highlight!.label,
      compactLabel: highlight!.compactLabel,
      kind: 'highlight',
    }
  const located = day.memories.filter((m) => m.locationStatus === 'confirmed' && m.coordinate)
  // Fallback chooses the furthest known stop from the city, not the accommodation.
  located.sort((a, b) => cityDistance(b.coordinate!) - cityDistance(a.coordinate!))
  if (located[0]?.coordinate)
    return { coordinate: located[0].coordinate, label: located[0].locationName, kind: 'highlight' }
  const region = collection.regions.find((r) => day.regionIds.includes(r.id))
  return region
    ? {
        coordinate: region.anchor,
        label: `${region.title}・市區回憶`,
        compactLabel: region.title,
        kind: 'area',
      }
    : null
}
function cityDistance([lon, lat]: Coordinate) {
  return Math.hypot((lon + 21.94) * Math.cos((64.15 * Math.PI) / 180), lat - 64.15)
}
