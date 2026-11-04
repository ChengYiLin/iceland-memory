import { describe, expect, it } from 'vitest'
import type { ContentDay, ContentMemory } from '@/types/content'
import { dateLabel, daySummary, locationNote, pinLabel, unplacedCount } from '../memoryDisplay'

function memory(overrides: Partial<ContentMemory> = {}): ContentMemory {
  return {
    id: 'm',
    title: '惠爾山（Hverfjall）',
    locationName: '惠爾山（Hverfjall）',
    coordinate: [-16.9, 65.6],
    locationStatus: 'confirmed',
    story: '',
    remarks: '',
    photos: [],
    ...overrides,
  }
}
function day(overrides: Partial<ContentDay> = {}): ContentDay {
  return {
    id: 'd',
    number: 8,
    date: '2026/09/30',
    title: '冰火洞穴・三大地熱區',
    summary: '冰火洞穴，三大地熱區',
    regionIds: [],
    notes: [],
    memories: [],
    ...overrides,
  }
}

describe('memory display', () => {
  it('shortens a pin to its name without the bracketed alias', () => {
    expect(pinLabel(memory())).toBe('惠爾山')
    expect(pinLabel(memory({ locationName: 'Víti 火口湖' }))).toBe('Víti 火口湖')
    expect(pinLabel(memory({ locationName: '（只有括號）' }))).toBe('（只有括號）')
  })

  it('omits a location line that only repeats the title', () => {
    expect(locationNote(memory())).toBeNull()
    expect(
      locationNote(memory({ title: 'Mývatn apartments。', locationName: 'Mývatn apartments' })),
    ).toBeNull()
    expect(locationNote(memory({ title: '生氣爬火山', locationName: 'Víti 火口湖' }))).toBe(
      'Víti 火口湖',
    )
  })

  it('keeps pending and flight states visible', () => {
    expect(locationNote(memory({ locationStatus: 'pending', coordinate: null }))).toBe('位置待確認')
    expect(locationNote(memory({ locationStatus: 'flight', coordinate: null }))).toBe('航程故事')
  })

  it('shows a summary only when it says something the title does not', () => {
    expect(daySummary(day())).toBeNull()
    expect(daySummary(day({ summary: '那天風很大，我們還是爬上去了。' }))).toBe(
      '那天風很大，我們還是爬上去了。',
    )
  })

  it('counts memories that have no place on the map', () => {
    const memories = [
      memory(),
      memory({ locationStatus: 'pending', coordinate: null }),
      memory({ locationStatus: 'flight', coordinate: null }),
      memory({ coordinate: null }),
    ]
    expect(unplacedCount(day({ memories }))).toBe(3)
  })

  it('formats a travel date without leading zeros', () => {
    expect(dateLabel('2026/09/03')).toBe('9月3日')
  })
})
