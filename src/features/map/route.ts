import type { Coordinate } from '@/types/journey'

/** Cumulative distance in projected map coordinates, for consistent drawing speed. */
export function routeDistances(route: Coordinate[]): number[] {
  const distances = [0]
  const project = ([lng, lat]: Coordinate): Coordinate => [
    (lng * Math.PI) / 180,
    Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
  ]
  for (let index = 1; index < route.length; index += 1) {
    const previous = project(route[index - 1]!)
    const current = project(route[index]!)
    distances.push(
      distances[index - 1]! + Math.hypot(current[0] - previous[0], current[1] - previous[1]),
    )
  }
  return distances
}

export function routeAtProgress(
  route: Coordinate[],
  distances: number[],
  progress: number,
): Coordinate[] {
  if (route.length < 2) return route
  const fraction = Math.max(0, Math.min(1, progress))
  const target = (distances.at(-1) ?? 0) * fraction
  if (fraction === 1 || (target === 0 && distances.at(-1) === 0)) return route
  const result: Coordinate[] = [route[0]!]
  for (let index = 1; index < route.length; index += 1) {
    const end = distances[index]!
    if (end <= target) {
      result.push(route[index]!)
      continue
    }
    const start = distances[index - 1]!
    const ratio = end === start ? 0 : (target - start) / (end - start)
    const previous = route[index - 1]!
    const next = route[index]!
    result.push([
      previous[0] + (next[0] - previous[0]) * ratio,
      previous[1] + (next[1] - previous[1]) * ratio,
    ])
    break
  }
  return result
}
