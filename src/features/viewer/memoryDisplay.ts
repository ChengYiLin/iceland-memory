import type { ContentDay, ContentMemory } from '@/types/content'

const decoration = /[\s，,。．・·、：:！!？?…]/g
const comparable = (text: string) => text.replace(decoration, '')

export function dateLabel(date: string) {
  const [, month, day] = date.split('/')
  return `${Number(month)}月${Number(day)}日`
}

export function isPlaced(memory: ContentMemory) {
  return memory.locationStatus === 'confirmed' && memory.coordinate !== null
}

export function unplacedCount(day: ContentDay) {
  return day.memories.filter((memory) => !isPlaced(memory)).length
}

/** Short enough for a map pin: a bracketed alias belongs in the album, not on the map. */
export function pinLabel(memory: ContentMemory) {
  const name = memory.locationName.replace(/[（(][^）)]*[）)]/g, '').trim()
  return name || memory.locationName
}

/** The line under a memory's title, or null when it would only repeat the title. */
export function locationNote(memory: ContentMemory) {
  if (memory.locationStatus === 'flight') return '航程故事'
  if (memory.locationStatus === 'pending') return '位置待確認'
  return comparable(memory.locationName) === comparable(memory.title) ? null : memory.locationName
}

/** Imported summaries often restate the title with other punctuation, which adds nothing. */
export function daySummary(day: ContentDay) {
  return comparable(day.summary) === comparable(day.title) ? null : day.summary
}
