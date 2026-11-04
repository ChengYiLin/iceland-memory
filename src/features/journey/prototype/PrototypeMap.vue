<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, computed } from 'vue'
import {
  Map,
  Marker,
  LngLatBounds,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { days, type DemoDay } from './demo'
const props = defineProps<{
  day: DemoDay
  progress: number
  overview: boolean
  scene: number
  cameraDuration: number
  floatingControls: boolean
}>()
const emit = defineEmits<{
  open: [index: number]
  preview: [index: number | null]
  start: [index: number]
  ready: []
  arrived: []
}>()
const container = ref<HTMLDivElement>()
const compact = ref(matchMedia('(max-width:767px)').matches)
const preview = ref<number | null>(null)
const previewMemory = computed(() =>
  preview.value === null ? undefined : props.day.memories[preview.value],
)
function showMemory(index: number) {
  if (compact.value && preview.value !== index) {
    preview.value = index
    emit('preview', index)
    markers.forEach((marker, number) =>
      marker.getElement().classList.toggle('is-previewed', number === index),
    )
  } else emit('open', index)
}
function dismissPreview() {
  preview.value = null
  emit('preview', null)
  markers.forEach((marker) => marker.getElement().classList.remove('is-previewed'))
}
let map: Map
let markers: Marker[] = []
let resize: ResizeObserver
let ready = false
let cameraDone: (() => void) | undefined
function clearMarkerLeaders() {
  if (!ready) return
  markers.forEach((marker) => marker.setOffset([0, 0]))
  ;(map.getSource('leaders') as GeoJSONSource).setData({ type: 'FeatureCollection', features: [] })
}
// Prototype-only collision treatment: fan nearby labels vertically, with location leaders.
function spreadMarkers() {
  if (!ready) return
  const occupied: { x: number; y: number }[] = []
  const coordinates: number[][][] = []
  if (!props.overview)
    markers.forEach((marker) => {
      const anchor = marker.getLngLat()
      const point = map.project(anchor)
      const offset =
        (compact.value ? [0, -52, 52, -104, 104] : [0, -64, 64, -128, 128]).find((dy) =>
          occupied.every(
            (other) =>
              Math.hypot(point.x - other.x, point.y + dy - other.y) >= (compact.value ? 50 : 62),
          ),
        ) ?? 0
      marker.setOffset([0, offset])
      occupied.push({ x: point.x, y: point.y + offset })
      if (offset)
        coordinates.push([anchor.toArray(), map.unproject([point.x, point.y + offset]).toArray()])
    })
  ;(map.getSource('leaders') as GeoJSONSource).setData({
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiLineString', coordinates },
  })
}
function line(progress: number) {
  const route = props.day.memories.map((memory) => memory.coordinate)
  const position = progress * (route.length - 1)
  const index = Math.min(Math.floor(position), route.length - 2)
  const fraction = position - index
  const a = route[index]!,
    b = route[index + 1]!
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        ...route.slice(0, index + 1),
        [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction],
      ],
    },
  }
}
function draw() {
  if (!ready) return
  ;(map.getSource('progress') as GeoJSONSource).setData(line(props.overview ? 0 : props.progress))
  markers.forEach((marker, index) =>
    marker
      .getElement()
      .classList.toggle(
        'lit',
        !props.overview && index <= props.progress * (props.day.memories.length - 1),
      ),
  )
}
function refreshScene() {
  if (!ready) return
  dismissPreview()
  if (cameraDone) map.off('moveend', cameraDone)
  map.stop()
  clearMarkerLeaders()
  markers.forEach((marker) => marker.remove())
  markers = []
  ;(map.getSource('whole') as GeoJSONSource).setData(line(1))
  map.setLayoutProperty('route-base', 'visibility', props.overview ? 'none' : 'visible')
  map.setLayoutProperty('route-active', 'visibility', props.overview ? 'none' : 'visible')
  if (props.overview) {
    days.forEach((day, index) => {
      const button = document.createElement('button')
      button.className = 'proto-pin proto-day'
      button.textContent = `DAY ${String(day.number).padStart(2, '0')}`
      button.setAttribute('aria-label', `走進第 ${day.number} 天`)
      button.onclick = () => emit('start', index)
      markers.push(new Marker({ element: button }).setLngLat(day.anchor).addTo(map))
    })
  } else {
    props.day.memories.forEach((memory, index) => {
      const button = document.createElement('button')
      button.className = `proto-pin proto-memory-pin${index >= props.day.memories.length * 0.6 ? ' label-left' : ''}`
      const image = document.createElement('img')
      image.src = memory.photos[0]!.src
      image.alt = ''
      image.draggable = false
      const number = document.createElement('span')
      number.className = 'proto-pin-number'
      number.textContent = String(index + 1)
      const label = document.createElement('span')
      label.className = 'proto-pin-label'
      const title = document.createElement('strong')
      title.textContent = memory.title
      const place = document.createElement('small')
      place.textContent = memory.place
      label.append(title, place)
      button.append(image, number, label)
      button.setAttribute('aria-label', `回憶 ${index + 1}：${memory.title}`)
      button.onclick = () => showMemory(index)
      markers.push(new Marker({ element: button }).setLngLat(memory.coordinate).addTo(map))
    })
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  cameraDone = () => {
    emit('arrived')
    cameraDone = undefined
  }
  map.once('moveend', cameraDone)
  map.fitBounds(
    props.overview
      ? [
          [-24.7, 63.2],
          [-13.1, 66.65],
        ]
      : props.day.memories.reduce(
          (bounds, memory) => bounds.extend(memory.coordinate),
          new LngLatBounds(),
        ),
    {
      padding: {
        top: props.floatingControls && map.getContainer().clientWidth > 767 ? 210 : 70,
        bottom: props.floatingControls ? (compact.value ? 180 : 120) : 65,
        left: 42,
        right: 42,
      },
      duration: reduced ? 0 : props.cameraDuration,
    },
  )
  draw()
}
watch(() => [props.overview, props.scene], refreshScene)
watch(() => props.progress, draw)
onMounted(() => {
  setWorkerUrl(workerUrl)
  map = new Map({
    container: container.value!,
    style: undefined,
    bounds: [
      [-24.7, 63.2],
      [-13.1, 66.65],
    ],
    fitBoundsOptions: { padding: 40 },
    renderWorldCopies: false,
    maxZoom: 12,
    attributionControl: { compact: true },
  })
  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  let attributionWasMobile = false
  function compactMobileAttribution() {
    const attribution = map.getContainer().querySelector('.maplibregl-ctrl-attrib')
    if (!attribution?.querySelector('.maplibregl-ctrl-attrib-inner')?.textContent?.trim()) return
    const mobile = map.getContainer().clientWidth <= 767
    if (
      mobile &&
      !attributionWasMobile &&
      attribution.classList.contains('maplibregl-compact-show')
    ) {
      attribution.querySelector<HTMLElement>('.maplibregl-ctrl-attrib-button')?.click()
    }
    attributionWasMobile = mobile
  }
  map.on('styledata', compactMobileAttribution)
  map.on('resize', compactMobileAttribution)
  map.once('style.load', () => {
    map.addSource('whole', { type: 'geojson', data: line(1) })
    map.addSource('progress', { type: 'geojson', data: line(0) })
    map.addSource('leaders', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({
      id: 'marker-leaders',
      type: 'line',
      source: 'leaders',
      paint: { 'line-color': '#617367', 'line-width': 1.5 },
    })
    map.addLayer({
      id: 'route-base',
      type: 'line',
      source: 'whole',
      paint: { 'line-color': '#71867b', 'line-width': 2, 'line-dasharray': [2, 3] },
    })
    map.addLayer({
      id: 'route-active',
      type: 'line',
      source: 'progress',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#bc6b43', 'line-width': 4 },
    })
    ready = true
    emit('ready')
    refreshScene()
  })
  map.on('moveend', spreadMarkers)
  map.on('movestart', clearMarkerLeaders)
  resize = new ResizeObserver(() => {
    compact.value = map.getContainer().clientWidth <= 767
    if (!compact.value) dismissPreview()
    map.resize()
  })
  resize.observe(container.value!)
  map.setStyle(
    import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/positron',
    {
      transformStyle: (_previous, style) => {
        // OpenFreeMap permits omitting its brand; retain the required data credits.
        for (const source of Object.values(style.sources)) {
          if (
            source.type === 'vector' &&
            source.url?.startsWith('https://tiles.openfreemap.org/')
          ) {
            source.attribution =
              '<a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          }
        }
        return style
      },
    },
  )
})
onBeforeUnmount(() => {
  resize?.disconnect()
  map?.remove()
})
</script>
<template>
  <div class="proto-map-root">
    <div ref="container" class="proto-map" aria-label="冰島示範回憶地圖" />
    <aside v-if="compact && previewMemory" class="proto-mobile-preview" aria-label="回憶預覽">
      <button class="proto-preview-open" @click="emit('open', previewMemory.id)">
        <img :src="previewMemory.photos[0]!.src" alt="這段回憶的示範封面" />
        <span
          ><small>回憶 {{ previewMemory.id + 1 }} · {{ previewMemory.place }}</small
          ><strong>{{ previewMemory.title }}</strong
          ><em>看 {{ previewMemory.photos.length }} 張照片與故事 ↗</em></span
        >
      </button>
      <button class="proto-preview-close" aria-label="收起回憶預覽" @click="dismissPreview">
        ×
      </button>
    </aside>
  </div>
</template>
