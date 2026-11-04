<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Map,
  Marker,
  NavigationControl,
  LngLatBounds,
  setWorkerUrl,
  type GeoJSONSource,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Collection, ContentDay, ContentMemory } from '@/types/content'
import { imageUrl } from '@/types/content'
import { dayAnchor } from './dayAnchors'
import { isPlaced, pinLabel } from './memoryDisplay'
import { routeAtProgress, routeDistances } from '@/features/map/route'
const props = defineProps<{
  collection: Collection
  day: ContentDay | null
  activeMemory?: string | null
  selectionKey?: number
}>()
const emit = defineEmits<{
  selectDay: [id: string]
  open: [id: string]
  group: [ids: string[]]
}>()
const container = ref<HTMLDivElement>(),
  error = ref('')
let map: Map,
  ready = false,
  markers: Marker[] = [],
  frame = 0,
  timer: ReturnType<typeof setTimeout> | undefined,
  timeout: ReturnType<typeof setTimeout> | undefined
let route: [number, number][] = []
const blank = () => ({ type: 'FeatureCollection' as const, features: [] })
function data(progress: number) {
  return route.length < 2
    ? blank()
    : {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: routeAtProgress(route, routeDistances(route), progress),
        },
      }
}
function paint(progress: number) {
  ;(map.getSource('route') as GeoJSONSource | undefined)?.setData(data(progress))
}
function cancel() {
  cancelAnimationFrame(frame)
  clearTimeout(timer)
  map?.stop()
}
function clearLeaders() {
  markers.forEach((m) => m.setOffset([0, 0]))
  ;(map.getSource('leaders') as GeoJSONSource | undefined)?.setData(blank())
}
interface Rect {
  x: number
  y: number
  width: number
  height: number
}
function nearestFreeSpot(
  point: { x: number; y: number },
  box: DOMRect,
  container: DOMRect,
  occupied: Rect[],
  gap: number,
  reach: number,
) {
  const left = box.width / 2 + 16
  const right = container.width - left
  const top = box.height / 2 + 16
  const bottom = container.height - box.height / 2 - 40
  const fits = (x: number, y: number) =>
    x >= left &&
    x <= right &&
    y >= top &&
    y <= bottom &&
    occupied.every(
      (other) =>
        Math.abs(x - other.x) >= (box.width + other.width) / 2 + gap ||
        Math.abs(y - other.y) >= (box.height + other.height) / 2 + gap,
    )
  if (fits(point.x, point.y)) return { x: point.x, y: point.y }
  let nearest: { x: number; y: number } | null = null
  let distance = reach ** 2
  for (let y = top; y <= bottom; y += 12) {
    for (let x = left; x <= right; x += 12) {
      const candidate = (x - point.x) ** 2 + (y - point.y) ** 2
      if (candidate < distance && fits(x, y)) {
        distance = candidate
        nearest = { x, y }
      }
    }
  }
  return nearest
}
function spread() {
  if (!ready) return
  const container = map.getContainer().getBoundingClientRect()
  const gap = innerWidth < 768 ? 4 : 8
  const occupied = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.viewer-brand, .viewer-intro, .journey-toolbar, .map-message, .maplibregl-ctrl-bottom-left',
    ),
  )
    .filter((element) => element.getClientRects().length)
    .map((element) => {
      const box = element.getBoundingClientRect()
      return {
        x: box.left - container.left + box.width / 2,
        y: box.top - container.top + box.height / 2,
        width: box.width,
        height: box.height,
      }
    })
  const reach = Math.min(container.width, container.height) * 0.3
  const lines: number[][][] = []
  for (const marker of markers) {
    const element = marker.getElement()
    const anchor = marker.getLngLat()
    const point = map.project(anchor)
    element.classList.remove('is-compact')
    let box = element.getBoundingClientRect()
    let position = nearestFreeSpot(point, box, container, occupied, gap, reach)
    // A pin far from its place misleads and one under another cannot be tapped, so it gives up its name first.
    if (!position) {
      element.classList.add('is-compact')
      box = element.getBoundingClientRect()
      position = nearestFreeSpot(point, box, container, occupied, gap, Infinity)
    }
    const placed = position ?? point
    marker.setOffset([placed.x - point.x, placed.y - point.y])
    occupied.push({ x: placed.x, y: placed.y, width: box.width, height: box.height })
    if (placed.x !== point.x || placed.y !== point.y)
      lines.push([anchor.toArray(), map.unproject([placed.x, placed.y]).toArray()])
  }
  ;(map.getSource('leaders') as GeoJSONSource).setData({
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiLineString', coordinates: lines },
  })
}
function finish() {
  cancel()
  if (ready) paint(1)
}
watch(
  () => props.activeMemory,
  (id) => {
    if (id) finish()
  },
)
function scene() {
  if (!ready) return
  cancel()
  markers.forEach((m) => m.remove())
  markers = []
  clearLeaders()
  const day = props.day
  route = day?.memories.filter(isPlaced).map((m) => m.coordinate!) ?? []
  paint(0)
  map.setPaintProperty('route', 'line-opacity', day ? 1 : 0.4)
  if (!day) {
    route = props.collection.days.flatMap((entry) => {
      const anchor = dayAnchor(entry, props.collection)
      return anchor ? [anchor.coordinate] : []
    })
    paint(1)
    for (const entry of props.collection.days) {
      const anchor = dayAnchor(entry, props.collection)
      if (!anchor) continue
      const button = document.createElement('button')
      button.className = 'day-pin'
      button.setAttribute('aria-label', `走進第 ${entry.number} 天：${anchor.label}`)
      const label = document.createElement('strong')
      const fullLabel = document.createElement('span')
      fullLabel.className = 'pin-place-full'
      fullLabel.textContent = anchor.label
      const compactLabel = document.createElement('span')
      compactLabel.className = 'pin-place-compact'
      compactLabel.textContent = anchor.compactLabel ?? anchor.label
      label.append(fullLabel, compactLabel)
      const number = document.createElement('span')
      number.className = 'day-pin-day'
      number.innerHTML = `<i>第 </i>${entry.number}<i> 天</i>`
      button.append(label, number)
      button.title = `Day ${entry.number} · ${entry.title} · ${anchor.kind === 'area' ? '市區參考入口' : anchor.label}`
      button.onclick = () => emit('selectDay', entry.id)
      markers.push(new Marker({ element: button }).setLngLat(anchor.coordinate).addTo(map))
    }
    map.fitBounds(
      [
        [-24.7, 63.2],
        [-13.1, 66.65],
      ],
      {
        padding:
          innerWidth < 768
            ? { top: 190, bottom: 190, left: 32, right: 32 }
            : { top: 180, bottom: 145, left: 70, right: 70 },
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500,
      },
    )
    spread()
    return
  }
  const groups = new globalThis.Map<string, ContentMemory[]>()
  for (const memory of day.memories) {
    if (!isPlaced(memory)) continue
    const key = memory.coordinate!.join(',')
    groups.set(key, [...(groups.get(key) ?? []), memory])
  }
  for (const group of groups.values()) {
    const memory = group[0]!
    const button = document.createElement('button')
    button.className = 'memory-pin'
    const place = pinLabel(memory)
    button.setAttribute(
      'aria-label',
      group.length > 1
        ? `${place}：${group.length} 段回憶`
        : `開啟回憶：${memory.title.includes(place) ? memory.title : `${place}・${memory.title}`}`,
    )
    button.title = group.length > 1 ? place : memory.title
    const number = document.createElement('b')
    number.textContent =
      group.length > 1 ? `${group.length} 段` : String(day.memories.indexOf(memory) + 1)
    button.append(number)
    if (memory.photos[0]) {
      const image = document.createElement('img')
      image.src = imageUrl(memory.photos[0].thumbnail)
      image.alt = ''
      image.onerror = () => image.remove()
      button.append(image)
    }
    const label = document.createElement('span')
    label.className = 'memory-pin-label'
    label.textContent = place
    button.append(label)
    button.onclick = () => {
      paint(1)
      cancel()
      if (group.length > 1)
        emit(
          'group',
          group.map((m) => m.id),
        )
      else emit('open', memory.id)
    }
    markers.push(new Marker({ element: button }).setLngLat(memory.coordinate!).addTo(map))
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reduced || props.activeMemory ? 0 : 650
  if (route.length === 0) {
    const fallback = dayAnchor(day, props.collection)
    if (fallback) map.easeTo({ center: fallback.coordinate, zoom: 10, duration })
    else
      map.fitBounds(
        [
          [-24.7, 63.2],
          [-13.1, 66.65],
        ],
        { padding: 60, duration },
      )
    return
  }
  const bounds = new LngLatBounds()
  route.forEach((p) => bounds.extend(p))
  map.fitBounds(bounds, {
    padding: { top: innerWidth > 767 ? 230 : 205, bottom: 150, left: 60, right: 60 },
    maxZoom: 11,
    duration,
  })
  if (reduced || props.activeMemory || route.length < 2) {
    paint(1)
    spread()
    return
  }
  timer = setTimeout(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / 1850)
      paint(progress)
      if (progress < 1) frame = requestAnimationFrame(animate)
      else spread()
    }
    frame = requestAnimationFrame(animate)
  }, duration)
}
watch(() => [props.day?.id, props.selectionKey], scene, { flush: 'post' })
onMounted(() => {
  try {
    setWorkerUrl(workerUrl)
    map = new Map({
      container: container.value!,
      style: undefined,
      bounds: [
        [-24.7, 63.2],
        [-13.1, 66.65],
      ],
      fitBoundsOptions: { padding: 55 },
      maxBounds: [
        [-28, 61],
        [-10, 69],
      ],
      renderWorldCopies: false,
      maxZoom: 13,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-left')
    map.on('error', () => {
      error.value = '底圖暫時無法載入，仍可從「旅程與回憶」閱讀。'
    })
    timeout = setTimeout(() => {
      if (!ready) error.value = '底圖仍在載入，「旅程與回憶」已可開啟。'
    }, 10000)
    map.once('style.load', () => {
      clearTimeout(timeout)
      ready = true
      error.value = ''
      map.addSource('route', { type: 'geojson', data: blank() })
      map.addSource('leaders', { type: 'geojson', data: blank() })
      map.addLayer({
        id: 'leaders',
        type: 'line',
        source: 'leaders',
        paint: { 'line-color': '#667567', 'line-width': 1.2 },
      })
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#b46d49', 'line-width': 3, 'line-dasharray': [2, 2] },
      })
      scene()
    })
    map.on('movestart', clearLeaders)
    map.on('moveend', spread)
    map.on('resize', spread)
    map.setStyle(
      import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/positron',
      {
        transformStyle: (_previous, style) => {
          for (const source of Object.values(style.sources)) {
            if (
              source.type === 'vector' &&
              source.url?.startsWith('https://tiles.openfreemap.org/')
            )
              source.attribution =
                '<a href="https://openmaptiles.org/">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
          return style
        },
      },
    )
  } catch {
    error.value = '此裝置無法顯示地圖，仍可從「旅程與回憶」閱讀。'
  }
})
onBeforeUnmount(() => {
  cancel()
  clearTimeout(timeout)
  markers.forEach((m) => m.remove())
  map?.remove()
})
</script>
<template>
  <div class="canvas-wrap">
    <div ref="container" class="journey-canvas" aria-label="冰島回憶地圖" />
    <p v-if="error" class="map-message" role="status">{{ error }}</p>
  </div>
</template>
