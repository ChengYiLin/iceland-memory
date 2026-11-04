import { describe, expect, it } from 'vitest'
import { routeAtProgress, routeDistances } from '../route'
import type { Coordinate } from '@/types/journey'

describe('route drawing', () => {
  const route: Coordinate[] = [
    [0, 0],
    [1, 0],
    [4, 0],
  ]
  const distances = routeDistances(route)

  it('moves by distance instead of vertex count and clamps playback boundaries', () => {
    expect(routeAtProgress(route, distances, 0.5)).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ])
    expect(routeAtProgress(route, distances, -1)).toEqual([
      [0, 0],
      [0, 0],
    ])
    expect(routeAtProgress(route, distances, 2)).toEqual(route)
  })

  it('handles empty routes and stationary tracks', () => {
    expect(routeAtProgress([], [], 0.5)).toEqual([])
    const stationary: Coordinate[] = [
      [0, 0],
      [0, 0],
    ]
    expect(routeAtProgress(stationary, routeDistances(stationary), 0.5)).toEqual(stationary)
  })
})
