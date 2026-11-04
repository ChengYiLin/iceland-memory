<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Map, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { JourneyDay, PlaybackPhase } from '@/types/journey'
import { addJourneyLayers, renderJourneyScene } from './mapScene'
import { ICELAND_BOUNDS, overviewPadding } from './viewport'

const props = defineProps<{ days: JourneyDay[]; day: JourneyDay | null; replayKey: number }>()
const emit = defineEmits<{
  selectDay: [id: string]
  selectMemory: [id: string]
  phase: [phase: PlaybackPhase]
}>()
const container = ref<HTMLDivElement>()
const styleReady = ref(false)
const failed = ref(false)
const loading = ref(true)
let map: Map | undefined
let cleanupScene: (() => void) | undefined
let timeout: ReturnType<typeof setTimeout>

function initialize() {
  if (!container.value) return
  cleanupScene?.()
  cleanupScene = undefined
  styleReady.value = false
  failed.value = false
  loading.value = true
  clearTimeout(timeout)
  map?.remove()
  try {
    setWorkerUrl(workerUrl)
    map = new Map({
      container: container.value,
      style: import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/positron',
      bounds: ICELAND_BOUNDS,
      fitBoundsOptions: { padding: overviewPadding() },
      // Leave enough sea around Iceland for the offset camera on portrait screens.
      maxBounds: [
        [-40, 50],
        [0, 75],
      ],
      maxZoom: 12,
      renderWorldCopies: false,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    // Story navigation can become interactive before every basemap tile and glyph arrives.
    map.once('style.load', () => {
      addJourneyLayers(map!, props.days)
      styleReady.value = true
    })
    map.once('load', () => {
      clearTimeout(timeout)
      loading.value = false
      failed.value = false
    })
    map.on('error', () => {
      if (loading.value) {
        loading.value = false
        failed.value = true
      }
    })
    timeout = setTimeout(() => {
      if (loading.value) {
        loading.value = false
        failed.value = true
      }
    }, 15000)
  } catch {
    loading.value = false
    failed.value = true
  }
}

watch(
  () => [styleReady.value, props.day?.id, props.replayKey],
  () => {
    cleanupScene?.()
    cleanupScene = undefined
    if (styleReady.value && map)
      cleanupScene = renderJourneyScene(map, props.days, props.day, {
        selectDay: (id) => emit('selectDay', id),
        selectMemory: (id) => emit('selectMemory', id),
        phase: (phase) => emit('phase', phase),
      })
  },
)

onMounted(initialize)
onBeforeUnmount(() => {
  clearTimeout(timeout)
  cleanupScene?.()
  map?.remove()
})
</script>

<template>
  <section class="journey-map" aria-label="冰島旅行互動地圖" :aria-busy="loading && !styleReady">
    <div ref="container" class="map-canvas" />
    <p v-if="loading" class="map-message" role="status">正在展開冰島地圖…</p>
    <div v-if="failed" class="map-message" role="alert">
      地圖暫時無法載入。<br />仍可從日期與回憶清單探索故事。<br /><button @click="initialize">
        重新載入地圖
      </button>
    </div>
  </section>
</template>
