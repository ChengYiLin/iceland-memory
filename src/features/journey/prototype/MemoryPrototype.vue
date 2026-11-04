<script setup lang="ts">
// THROWAWAY: three structurally different layouts on /?variant=A|B|C.
// A revision: full-screen map, brief route transition, user-led photo stories.
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import PrototypeMap from './PrototypeMap.vue'
import PrototypeSwitcher from './PrototypeSwitcher.vue'
import PrototypeAlbum from './PrototypeAlbum.vue'
import VariantB from './VariantB.vue'
import VariantC from './VariantC.vue'
import { days, type Variant } from './demo'
import './prototype.css'
const query = new URLSearchParams(location.search).get('variant')
const variant = ref<Variant>(query === 'B' || query === 'C' ? query : 'A')
const overview = ref(true)
const dayIndex = ref(0)
const day = computed(() => days[dayIndex.value]!)
const memories = computed(() => day.value.memories)
const progress = ref(0)
const moving = ref(false)
const mapReady = ref(false)
const scene = ref(0)
const selected = ref<number | null>(null)
const mapPreview = ref<number | null>(null)
const photo = ref(0)
const initialPhoto = ref(0)
const showPreview = ref(true)
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const seconds = ref(28)
const activeIndex = computed(() =>
  Math.min(memories.value.length - 1, Math.floor(progress.value * (memories.value.length - 1))),
)
const memory = computed(() =>
  variant.value !== 'A' && !overview.value && !moving.value && showPreview.value
    ? memories.value[activeIndex.value]
    : undefined,
)
const selectedMemory = computed(() =>
  selected.value === null ? undefined : memories.value[selected.value],
)
const phase = computed(() =>
  overview.value
    ? '總覽'
    : selected.value !== null
      ? variant.value === 'A'
        ? '看照片故事'
        : '看回憶 · 路線暫停'
      : moving.value
        ? '移動到這一天'
        : progress.value === 1
          ? '自由探索'
          : '沿著路線前進',
)
const state = computed(() => ({
  variant: variant.value,
  day: overview.value ? null : day.value.number,
  phase: phase.value,
  progress: Number(progress.value.toFixed(3)),
  arrived: overview.value ? [] : Array.from({ length: activeIndex.value + 1 }, (_, i) => i + 1),
  preview:
    variant.value === 'A'
      ? mapPreview.value === null
        ? null
        : mapPreview.value + 1
      : memory.value?.id === undefined
        ? null
        : memory.value.id + 1,
  selectedMemory: selected.value === null ? null : selected.value + 1,
  photo: selected.value === null ? null : photo.value + 1,
  durationSeconds: variant.value === 'A' ? 1.85 : seconds.value,
  reducedMotion: reduced,
  route: 'illustrative',
  content: 'invented',
}))
function changeVariant(value: Variant) {
  variant.value = value
  if (value === 'A' && !overview.value) skip()
  const url = new URL(location.href)
  url.searchParams.set('variant', value)
  history.replaceState({}, '', url)
  console.info('[PROTOTYPE] variant changed', state.value)
}
function start(index = dayIndex.value) {
  if (!days[index]) return
  dayIndex.value = index
  selected.value = null
  overview.value = false
  progress.value = 0
  moving.value = true
  showPreview.value = true
  scene.value++
}
function chooseDay(index: number, event: MouseEvent) {
  const menu = (event.currentTarget as HTMLElement).closest('details')
  if (menu) menu.open = false
  start(index)
}
function arrived() {
  moving.value = false
  if (reduced && !overview.value) skip()
}
function home() {
  selected.value = null
  overview.value = true
  progress.value = 0
  moving.value = false
  scene.value++
}
function skip() {
  progress.value = 1
  moving.value = false
  showPreview.value = false
}
function open(index: number, startPhoto = 0) {
  if (variant.value === 'A') skip()
  selected.value = index
  initialPhoto.value = startPhoto
  photo.value = startPhoto
}
let frame = 0
let previous = 0
function tick(now: number) {
  const elapsed = previous ? now - previous : 0
  previous = now
  if (
    !document.hidden &&
    !overview.value &&
    !moving.value &&
    selected.value === null &&
    progress.value < 1
  )
    progress.value = Math.min(
      1,
      progress.value + elapsed / (variant.value === 'A' ? 1850 : seconds.value * 1000),
    )
  frame = requestAnimationFrame(tick)
}
onMounted(() => {
  frame = requestAnimationFrame(tick)
  console.info('[PROTOTYPE] initial state', state.value)
})
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>
<template>
  <main class="memory-prototype" :class="[`variant-${variant}`, { 'is-overview': overview }]">
    <header class="proto-header">
      <button class="proto-brand" @click="home">ICELAND <i>in memory</i></button
      ><span>可拋棄原型 · 插畫與故事皆為示範</span>
    </header>
    <section class="proto-map-panel">
      <PrototypeMap
        :day="day"
        :progress="progress"
        :overview="overview"
        :scene="scene"
        :camera-duration="variant === 'A' ? 650 : 1100"
        :floating-controls="variant === 'A'"
        @preview="mapPreview = $event"
        @open="open"
        @start="start"
        @ready="mapReady = true"
        @arrived="arrived"
      />
      <p v-if="!mapReady" class="proto-map-loading">地圖準備中，先從下方開始也可以。</p>
      <div v-if="!overview" class="proto-map-label">
        <span>DAY {{ String(day.number).padStart(2, '0') }} / 18</span
        ><strong>{{ day.title }}</strong
        ><small>示意連線，非實際駕車軌跡</small>
      </div>
    </section>
    <section v-if="overview" class="proto-welcome">
      <p class="proto-kicker">EIGHTEEN DAYS, OUR LITTLE STORIES</p>
      <h1>沿著地圖，<br />再走一次。</h1>
      <p>有些記憶是遼闊的風景。<br />有些，只是我們一起笑的那一刻。</p>
      <button class="proto-primary" @click="start(0)">走進第 1 天 <span>→</span></button
      ><small>原型開放兩天 · 7 + 5 個示範回憶點</small>
    </section>
    <template v-else>
      <component
        v-if="variant !== 'A'"
        :is="variant === 'B' ? VariantB : VariantC"
        :memory="memory"
        :memories="memories"
        :complete="progress === 1"
        @open="open"
      />
      <nav v-if="variant === 'A'" class="proto-explore-nav" aria-label="旅行日選單">
        <button @click="home">↖ 全島總覽</button>
        <button :disabled="dayIndex === 0" aria-label="上一天" @click="start(dayIndex - 1)">
          ←
        </button>
        <details class="proto-day-picker">
          <summary>
            <strong>DAY {{ String(day.number).padStart(2, '0') }} ▾</strong
            ><small>{{ memories.length }} 段回憶</small>
          </summary>
          <div>
            <button
              v-for="(item, index) in days"
              :key="item.number"
              :aria-pressed="dayIndex === index"
              @click="chooseDay(index, $event)"
            >
              DAY {{ String(item.number).padStart(2, '0') }} · {{ item.title }}
            </button>
          </div>
        </details>
        <button
          :disabled="dayIndex === days.length - 1"
          aria-label="下一天"
          @click="start(dayIndex + 1)"
        >
          →
        </button>
      </nav>
      <div v-else class="proto-controls">
        <span role="status">{{ phase }}</span
        ><button v-if="progress < 1" @click="skip">直接探索 ↗</button
        ><button v-else @click="start()">↻ 重走這一天</button
        ><button @click="home">全島總覽</button>
        <details>
          <summary>節奏</summary>
          <label
            >走完一天
            <select v-model.number="seconds">
              <option :value="16">16 秒</option>
              <option :value="28">28 秒</option>
              <option :value="42">42 秒</option>
            </select></label
          >
        </details>
      </div>
    </template>
    <PrototypeAlbum
      v-if="selectedMemory"
      :key="`${day.number}-${selectedMemory.id}`"
      :memory="selectedMemory"
      :day-number="day.number"
      :initial-photo="initialPhoto"
      :will-resume="progress < 1"
      :next-memory="memories[selectedMemory.id + 1]"
      :previous-memory="memories[selectedMemory.id - 1]"
      :total-memories="memories.length"
      @navigate="open"
      @close="selected = null"
      @photo="photo = $event"
    />
    <PrototypeSwitcher
      :variant="variant"
      :disabled="selected !== null"
      :state="state"
      :compact="variant === 'A'"
      @change="changeVariant"
    />
  </main>
</template>
