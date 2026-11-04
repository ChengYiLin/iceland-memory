import type { Coordinate } from '@/types/journey'

export const ICELAND_BOUNDS: [Coordinate, Coordinate] = [
  [-24.7, 63.2],
  [-13.1, 66.65],
]

export function overviewPadding() {
  return window.matchMedia('(max-width: 767px)').matches
    ? { top: 104, bottom: 320, left: 24, right: 24 }
    : { top: 104, bottom: 120, left: 380, right: 80 }
}
