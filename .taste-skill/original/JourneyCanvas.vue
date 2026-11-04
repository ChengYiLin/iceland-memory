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
  phase: [phase: string]
}>()
const container = ref<HTMLDivElement>(),
  error = ref(''),
  preview = ref<ContentMemory | null>(null)
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
function spread() {
  if (!ready) return
  const occupied: { x: number; y: number; width: number; height: number }[] = [],
    lines: number[][][] = []
  for (const marker of markers) {
    const anchor = marker.getLngLat(),
      p = map.project(anchor)
    const box = marker.getElement().getBoundingClientRect()
    const offsets = props.day
      ? [0, -55, 55, -110, 110, -165, 165].map((y) => [0, y])
      : [
          [0, 0],
          [-72, -28],
          [72, 28],
          [0, -50],
          [0, 50],
          [-90, 36],
          [90, -36],
          [-72, -85],
          [72, 85],
          [0, 100],
          [0, -100],
          [-130, 0],
          [130, 0],
          [-110, -110],
          [110, 110],
          [0, 150],
          [0, -150],
        ]
    const [dx, dy] = offsets.find(
      ([x, y]) =>
        p.x + x! - box.width / 2 > 8 &&
        p.x + x! + box.width / 2 < map.getContainer().clientWidth - 8 &&
        p.y + y! > 65 &&
        p.y + y! < map.getContainer().clientHeight - (props.day ? 105 : 170) &&
        occupied.every(
          (o) =>
            Math.abs(p.x + x! - o.x) > (box.width + o.width) / 2 + 8 ||
            Math.abs(p.y + y! - o.y) > (box.height + o.height) / 2 + 8,
        ),
    ) ?? [0, 0]
    const offset = dy!

    marker.setOffset([dx!, offset])
    occupied.push({ x: p.x + dx!, y: p.y + offset, width: box.width, height: box.height })
    if (offset || dx)
      lines.push([anchor.toArray(), map.unproject([p.x + dx!, p.y + offset]).toArray()])
  }
  ;(map.getSource('leaders') as GeoJSONSource).setData({
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiLineString', coordinates: lines },
  })
}
function acceptPreview() {
  if (preview.value) emit('open', preview.value.id)
  preview.value = null
}
function open(memory: ContentMemory) {
  if (innerWidth > 767) emit('open', memory.id)
  else if (preview.value?.id === memory.id) {
    preview.value = null
    emit('open', memory.id)
  } else preview.value = memory
}
function finish() {
  cancel()
  if (ready) paint(1)
  emit('phase', '停在這裡，慢慢看看')
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
  preview.value = null
  markers.forEach((m) => m.remove())
  markers = []
  clearLeaders()
  const day = props.day
  route =
    day?.memories
      .filter((m) => m.locationStatus === 'confirmed' && m.coordinate)
      .map((m) => m.coordinate!) ?? []
  paint(0)
  if (!day) {
    for (const entry of props.collection.days) {
      const anchor = dayAnchor(entry, props.collection)
      if (!anchor) continue
      const button = document.createElement('button')
      button.className = 'day-pin'
      button.setAttribute('aria-label', `走進第 ${entry.number} 天：${anchor.label}`)
      const number = document.createElement('strong')
      number.textContent = `DAY ${String(entry.number).padStart(2, '0')}`
      const label = document.createElement('span')
      label.textContent = anchor.label
      button.append(number, label)
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
    emit('phase', '每一個 DAY，都是一段回憶。')
    return
  }
  const groups = new globalThis.Map<string, ContentMemory[]>()
  for (const memory of day.memories) {
    if (memory.locationStatus !== 'confirmed' || !memory.coordinate) continue
    const key = memory.coordinate.join(',')
    groups.set(key, [...(groups.get(key) ?? []), memory])
  }
  for (const group of groups.values()) {
    const memory = group[0]!
    const button = document.createElement('button')
    button.className = 'memory-pin'
    button.setAttribute('aria-label', `開啟回憶：${memory.title}`)
    if (memory.photos[0]) {
      const image = document.createElement('img')
      image.src = imageUrl(memory.photos[0].thumbnail)
      image.alt = ''
      image.onerror = () => image.remove()
      button.append(image)
    }
    const number = document.createElement('b')
    number.textContent =
      group.length > 1 ? `${group.length} 段` : String(day.memories.indexOf(memory) + 1)
    button.append(number)
    const label = document.createElement('span')
    label.className = 'memory-pin-label'
    label.textContent = `${memory.title} · ${memory.locationName}`
    button.append(label)
    button.onclick = () => {
      paint(1)
      cancel()
      emit('phase', '停在這裡，慢慢看看')
      if (group.length > 1)
        emit(
          'group',
          group.map((m) => m.id),
        )
      else open(memory)
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
    emit('phase', fallback ? '先回到這一天的區域，精確位置稍後補上。' : '航程故事，地圖留在冰島。')
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
    emit('phase', '停在這裡，慢慢看看')
    return
  }
  emit('phase', '沿著我們走過的地方…')
  timer = setTimeout(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / 1850)
      paint(progress)
      if (progress < 1) frame = requestAnimationFrame(animate)
      else {
        emit('phase', '停在這裡，慢慢看看')
        spread()
      }
    }
    frame = requestAnimationFrame(animate)
  }, duration)
}
watch(() => [props.day?.id, props.selectionKey], scene)
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
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.on('error', () => {
      error.value = '底圖暫時無法載入，仍可從日期與當日清單閱讀。'
    })
    timeout = setTimeout(() => {
      if (!ready) error.value = '底圖仍在載入，日期與故事已可開啟。'
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
    error.value = '此裝置無法顯示地圖，仍可從日期與當日清單閱讀。'
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
    <nav v-if="!day" class="flight-chapters" aria-label="去回程故事">
      <small>旅程的開始與結尾</small
      ><button
        v-for="entry in collection.days.filter((d) => !dayAnchor(d, collection))"
        :key="entry.id"
        :aria-label="`走進第 ${entry.number} 天：航程故事`"
        @click="emit('selectDay', entry.id)"
      >
        DAY {{ String(entry.number).padStart(2, '0') }}
        <span>{{ entry.number === 1 ? '出發' : '平安回家' }}</span> ↗
      </button>
    </nav>
    <p v-if="error" class="map-message" role="status">{{ error }}</p>
    <aside v-if="preview" class="memory-preview">
      <button @click="acceptPreview">
        <img v-if="preview.photos[0]" :src="imageUrl(preview.photos[0].thumbnail)" alt="" /><span
          ><small>{{ preview.locationName }}</small
          ><strong>{{ preview.title }}</strong
          ><em>看照片與故事 ↗</em></span
        ></button
      ><button aria-label="收起回憶預覽" @click="preview = null">×</button>
    </aside>
  </div>
</template>
