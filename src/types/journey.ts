/** GeoJSON and MapLibre use longitude first. */
export type Coordinate = [longitude: number, latitude: number]

export interface MemoryPhoto {
  id: string
  src: string
  thumbnail: string
  width: number
  height: number
  alt: string
  caption?: string
}

export interface TravelMemory {
  id: string
  title: string
  locationName: string
  coordinate: Coordinate
  /** Index in this day's route where the memory is revealed. */
  routeIndex: number
  story: string
  photos: MemoryPhoto[]
}

export interface JourneyDay {
  id: string
  number: number
  title: string
  date?: string
  summary: string
  routeKind: 'illustrative' | 'recorded' | 'road-matched'
  route: Coordinate[]
  memories: TravelMemory[]
}

export interface Journey {
  title: string
  totalDays: number
  isDemo: boolean
  days: JourneyDay[]
}

export type PlaybackPhase = 'idle' | 'moving' | 'drawing' | 'exploring'
