import { LngLatBounds, Marker, type GeoJSONSource, type Map } from 'maplibre-gl'
import type { Coordinate, JourneyDay, PlaybackPhase } from '@/types/journey'
import { routeAtProgress, routeDistances } from './route'
import { ICELAND_BOUNDS, overviewPadding } from './viewport'

const routeSource = 'active-route'
const allRoutes = 'overview-routes'
const line = (coordinates: Coordinate[]) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates },
})

export function addJourneyLayers(map: Map, days: JourneyDay[]) {
  map.addSource(allRoutes, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: days.map((day) => line(day.route)) },
  })
  map.addLayer({
    id: allRoutes,
    type: 'line',
    source: allRoutes,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#658b77',
      'line-width': 3,
      'line-opacity': 0.5,
      'line-dasharray': [2, 2],
    },
  })
  map.addSource(routeSource, { type: 'geojson', data: line([]) })
  map.addLayer({
    id: routeSource,
    type: 'line',
    source: routeSource,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#285f4b', 'line-width': 4 },
  })
}

interface SceneEvents {
  selectDay: (id: string) => void
  selectMemory: (id: string) => void
  phase: (phase: PlaybackPhase) => void
}

export function renderJourneyScene(
  map: Map,
  days: JourneyDay[],
  day: JourneyDay | null,
  events: SceneEvents,
) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 767px)').matches
  const markers: Marker[] = []
  let frame = 0
  let active = true

  function marker(coordinate: Coordinate, label: string, onClick: () => void, dayNumber?: number) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `map-marker${dayNumber ? ' day-marker' : ''}`
    button.setAttribute('aria-label', label)
    button.title = label
    button.textContent = dayNumber
      ? String(dayNumber).padStart(2, '0')
      : String(markers.length + 1).padStart(2, '0')
    if (dayNumber) {
      const prefix = document.createElement('small')
      prefix.textContent = 'DAY'
      button.prepend(prefix)
    }
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      onClick()
    })
    markers.push(new Marker({ element: button }).setLngLat(coordinate).addTo(map))
    return button
  }

  function updateRoute(coordinates: Coordinate[]) {
    map.getSource<GeoJSONSource>(routeSource)?.setData(line(coordinates))
  }

  map.setLayoutProperty(allRoutes, 'visibility', day ? 'none' : 'visible')
  updateRoute([])

  if (!day) {
    for (const entry of days) {
      const anchor = entry.route[Math.floor(entry.route.length / 2)]
      if (anchor)
        marker(
          anchor,
          `探索第 ${entry.number} 天：${entry.title}`,
          () => events.selectDay(entry.id),
          entry.number,
        )
    }
    map.fitBounds(ICELAND_BOUNDS, {
      padding: overviewPadding(),
      duration: reducedMotion ? 0 : 900,
    })
  } else {
    const distances = routeDistances(day.route)
    const totalDistance = distances.at(-1) ?? 0
    const memoryMarkers = day.memories.map((memory) => ({
      element: marker(memory.coordinate, `開啟回憶：${memory.title}`, () =>
        events.selectMemory(memory.id),
      ),
      threshold: totalDistance
        ? (distances[memory.routeIndex] ?? totalDistance) / totalDistance
        : 0,
    }))

    function draw(progress: number) {
      updateRoute(routeAtProgress(day!.route, distances, progress))
      for (const entry of memoryMarkers)
        entry.element.classList.toggle('is-lit', progress >= entry.threshold)
    }

    function beginDrawing() {
      if (!active) return
      events.phase('drawing')
      if (reducedMotion) {
        draw(1)
        events.phase('exploring')
        return
      }
      let start: number | undefined
      function tick(now: number) {
        if (!active) return
        start ??= now
        const progress = Math.min((now - start) / 2800, 1)
        draw(progress)
        if (progress < 1) frame = requestAnimationFrame(tick)
        else events.phase('exploring')
      }
      frame = requestAnimationFrame(tick)
    }

    events.phase('moving')
    if (day.route.length) {
      const bounds = day.route.reduce(
        (bounds, coordinate) => bounds.extend(coordinate),
        new LngLatBounds(),
      )
      if (!reducedMotion) map.once('moveend', beginDrawing)
      map.fitBounds(bounds, {
        padding: mobile
          ? { top: 120, bottom: 340, left: 48, right: 48 }
          : { top: 140, bottom: 160, left: 420, right: 100 },
        maxZoom: 10,
        duration: reducedMotion ? 0 : 1100,
      })
      if (reducedMotion) beginDrawing()
    } else events.phase('exploring')

    return () => {
      active = false
      cancelAnimationFrame(frame)
      map.off('moveend', beginDrawing)
      map.stop()
      markers.forEach((marker) => marker.remove())
    }
  }

  return () => {
    active = false
    map.stop()
    markers.forEach((marker) => marker.remove())
  }
}
