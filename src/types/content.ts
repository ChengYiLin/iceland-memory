import type { Coordinate, MemoryPhoto } from './journey'
export interface ContentMemory {
  id: string
  title: string
  locationName: string
  coordinate: Coordinate | null
  locationStatus: 'confirmed' | 'pending' | 'flight'
  coordinateSource?: string
  story: string
  remarks: string
  photos: MemoryPhoto[]
}
export interface ContentDay {
  id: string
  number: number
  date: string
  title: string
  summary: string
  regionIds: string[]
  notes: string[]
  memories: ContentMemory[]
}
export interface Collection {
  schemaVersion: 1
  title: string
  totalDays: number
  regions: { id: string; title: string; anchor: Coordinate }[]
  days: ContentDay[]
}
export function imageUrl(path: string) {
  return new URL(path.replace(/^\//, ''), new URL('./', document.baseURI)).href
}
