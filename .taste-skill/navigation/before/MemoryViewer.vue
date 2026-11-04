<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  ref,
  watch,
  onBeforeUnmount,
} from 'vue'
import type { Collection } from '@/types/content'
import MemoryAlbum from './MemoryAlbum.vue'
import DayMenu from './DayMenu.vue'
import './viewer.css'
const JourneyCanvas = defineAsyncComponent(() => import('./JourneyCanvas.vue'))
const collection = ref<Collection>(),
  problem = ref(''),
  dayId = ref<string | null>(null),
  memoryId = ref<string | null>(null),
  photo = ref(0),
  listOpen = ref(false),
  selectionKey = ref(0),
  group = ref<string[]>([]),
  phase = ref('從一個地方，走回那一天。'),
  shareMessage = ref('')
const day = computed(() => collection.value?.days.find((d) => d.id === dayId.value) ?? null)
const memory = computed(() => day.value?.memories.find((m) => m.id === memoryId.value))
const memoryIndex = computed(
  () => day.value?.memories.findIndex((m) => m.id === memoryId.value) ?? -1,
)
const dayIndex = computed(() => collection.value?.days.findIndex((d) => d.id === dayId.value) ?? -1)
function selectDay(id: string) {
  if (!collection.value?.days.some((d) => d.id === id)) return
  dayId.value = id
  selectionKey.value += 1
  memoryId.value = null
  group.value = []
  listOpen.value = !day.value?.memories.some(
    (m) => m.coordinate && m.locationStatus === 'confirmed',
  )
}
let previousFocus: HTMLElement | null = null
function toggleList() {
  listOpen.value = !listOpen.value
}
async function closeMemory() {
  memoryId.value = null
  await nextTick()
  const target = previousFocus?.isConnected
    ? previousFocus
    : document.querySelector<HTMLElement>('.viewer-actions button, .viewer-navigation select')
  target?.focus()
}
function open(id: string, initial = 0) {
  if (!memoryId.value)
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  memoryId.value = id
  photo.value = initial
  group.value = []
}
function overview() {
  dayId.value = null
  selectionKey.value += 1
  memoryId.value = null
  listOpen.value = false
  group.value = []
}
function readUrl() {
  if (!collection.value) return
  const query = new URLSearchParams(location.hash.slice(1) || location.search)
  const id = query.get('day')
  if (id && collection.value.days.some((d) => d.id === id)) {
    selectDay(id)
    const m = query.get('memory')
    if (m && day.value?.memories.some((x) => x.id === m)) open(m)
  } else overview()
}
function syncUrl() {
  const url = new URL(location.href)
  url.search = ''
  url.hash = dayId.value
    ? new URLSearchParams({
        day: dayId.value,
        ...(memoryId.value ? { memory: memoryId.value } : {}),
      }).toString()
    : ''
  history.replaceState(null, '', url)
}
async function share() {
  try {
    await navigator.clipboard.writeText(location.href)
    shareMessage.value = '連結已複製'
  } catch {
    shareMessage.value = '可複製瀏覽器網址分享這段回憶'
  }
}
watch([dayId, memoryId], syncUrl)
onMounted(async () => {
  try {
    const response = await fetch(new URL('journey.json', new URL('./', document.baseURI)))
    if (!response.ok) throw Error()
    collection.value = await response.json()
    readUrl()
  } catch {
    problem.value = '旅程內容暫時無法開啟，請重新整理。'
  }
  window.addEventListener('hashchange', readUrl)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', readUrl))
</script>
<template>
  <main class="viewer-shell">
    <p v-if="!collection" class="viewer-loading" role="status">
      {{ problem || '正在打開我們的冰島手帳…' }}
    </p>
    <template v-else>
      <JourneyCanvas
        :collection="collection"
        :day="day"
        :active-memory="memoryId"
        :selection-key="selectionKey"
        @select-day="selectDay"
        @open="open"
        @group="group = $event"
        @phase="phase = $event"
      />
      <header class="viewer-brand">
        <button aria-label="回到冰島總覽" @click="overview">
          <span class="brand-mountain" aria-hidden="true">△</span
          ><span>Iceland memory<small>18 天・冰島旅行回憶</small></span>
        </button>
      </header>
      <button class="overview-home" aria-label="返回全島總覽" @click="overview">
        <span aria-hidden="true">⌂</span> 全島總覽
      </button>
      <section class="viewer-intro">
        <h1>{{ day?.title ?? collection.title }}</h1>
        <p v-if="day" class="viewer-meta">第 {{ day.number }} 天 · {{ day.date }}</p>
        <p>
          {{
            day?.summary ??
            '十八天，從出發到平安回家。把風景、笑聲，和那些意料之外的片刻，留在這張地圖上。'
          }}
        </p>
        <p class="viewer-status" role="status">{{ phase }}</p>
        <button v-if="!day" class="viewer-primary" @click="selectDay(collection.days[0]!.id)">
          從第一天出發 →
        </button>
      </section>
      <div class="viewer-actions">
        <button v-if="day" :aria-expanded="listOpen" @click="toggleList">
          當日回憶 <small>{{ day.memories.length }}</small></button
        ><button v-if="day" @click="share">分享 ↗</button
        ><span v-if="shareMessage" role="status">{{ shareMessage }}</span>
      </div>
      <aside v-if="day && listOpen" class="daily-panel" aria-label="當日回憶清單">
        <div class="panel-heading">
          <h2>Day {{ day.number }} · 沿途的回憶</h2>
          <button aria-label="收起當日回憶" @click="listOpen = false">×</button>
        </div>
        <ol>
          <li v-for="(m, index) in day.memories" :key="m.id">
            <button @click="open(m.id)">
              <span class="list-index">{{ String(index + 1).padStart(2, '0') }}</span
              ><span
                ><strong>{{ m.title }}</strong
                ><small
                  >{{ m.photos.length ? `${m.photos.length} 張照片` : '照片待補' }} ·
                  {{
                    m.locationStatus === 'flight'
                      ? '航程故事卡'
                      : m.locationStatus === 'pending'
                        ? '位置待確認'
                        : m.locationName
                  }}</small
                ></span
              ><span>↗</span>
            </button>
          </li>
        </ol>
        <p v-for="note in day.notes" :key="note" class="day-note">{{ note }}</p>
      </aside>
      <aside v-if="group.length" class="group-menu" aria-label="選擇同位置的回憶">
        <div class="panel-heading">
          <h2>同一個地方，不同的片刻</h2>
          <button aria-label="收起同位置回憶" @click="group = []">×</button>
        </div>
        <button
          v-for="m in day?.memories.filter((m) => group.includes(m.id))"
          :key="m.id"
          @click="open(m.id)"
        >
          {{ m.title }} ↗
        </button>
      </aside>
      <nav class="viewer-navigation" aria-label="旅行日導覽">
        <button
          :disabled="!day || dayIndex === 0"
          aria-label="前一天"
          @click="selectDay(collection.days[dayIndex - 1]!.id)"
        >
          ←</button
        ><DayMenu
          :collection="collection"
          :selected-id="dayId"
          @select="selectDay"
          @overview="overview"
        />
        <span class="day-count">/ 18</span
        ><button
          :disabled="dayIndex === collection.days.length - 1"
          aria-label="後一天"
          @click="selectDay(collection.days[Math.max(0, dayIndex + 1)]!.id)"
        >
          →
        </button>
      </nav>
      <p class="route-caption">示意連線，非實際軌跡 · 地點為參考位置</p>
      <MemoryAlbum
        v-if="day && memory"
        :key="memory.id"
        :memory="memory"
        :day-number="day.number"
        :previous="day.memories[memoryIndex - 1]"
        :next="day.memories[memoryIndex + 1]"
        :initial-photo="photo"
        @close="closeMemory"
        @overview="overview"
        @navigate="open"
      />
    </template>
  </main>
</template>
