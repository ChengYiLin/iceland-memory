<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue'
import type { DemoMemory } from './demo'
const props = defineProps<{
  dayNumber: number
  memory: DemoMemory
  willResume: boolean
  nextMemory?: DemoMemory
  previousMemory?: DemoMemory
  totalMemories: number
  initialPhoto?: number
}>()
const emit = defineEmits<{
  close: []
  photo: [index: number]
  navigate: [id: number, photo: number]
}>()
const dialog = ref<HTMLDialogElement>()
const track = ref<HTMLDivElement>()
const content = ref<HTMLDivElement>()
const storyOpen = ref(false)
const index = ref(props.initialPhoto ?? 0)
const dragging = ref(false)
const last = computed(() => index.value === props.memory.photos.length - 1)
const first = computed(() => index.value === 0)
const previousLabel = computed(() =>
  first.value && props.previousMemory ? '上一段回憶' : '上一張照片',
)
const nextLabel = computed(() =>
  last.value ? (props.nextMemory ? '下一段回憶' : '關閉') : '下一張照片',
)
function previous() {
  if (first.value && props.previousMemory)
    emit('navigate', props.previousMemory.id, props.previousMemory.photos.length - 1)
  else go(index.value - 1)
}
function next() {
  if (!last.value) go(index.value + 1)
  else if (props.nextMemory) emit('navigate', props.nextMemory.id, 0)
  else emit('close')
}
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
let startX = 0
let startScroll = 0
let resize: ResizeObserver
watch(index, (value) => emit('photo', value))
function go(value: number) {
  if (!track.value) return
  const next = Math.max(0, Math.min(props.memory.photos.length - 1, value))
  track.value.scrollTo({
    left: next * track.value.clientWidth,
    behavior: reduced ? 'instant' : 'smooth',
  })
}
function scrolled() {
  if (!track.value || dragging.value) return
  index.value = Math.max(
    0,
    Math.min(
      props.memory.photos.length - 1,
      Math.round(track.value.scrollLeft / track.value.clientWidth),
    ),
  )
}
function pointerDown(event: PointerEvent) {
  // Touch and trackpads retain native scrolling. A mouse can drag the same strip.
  if (event.pointerType !== 'mouse' || event.button !== 0 || !track.value) return
  dragging.value = true
  startX = event.clientX
  startScroll = track.value.scrollLeft
  track.value.setPointerCapture(event.pointerId)
}
function pointerMove(event: PointerEvent) {
  if (dragging.value && track.value) track.value.scrollLeft = startScroll + startX - event.clientX
}
function pointerUp() {
  if (!dragging.value || !track.value) return
  dragging.value = false
  const delta = track.value.scrollLeft - startScroll
  const origin = Math.round(startScroll / track.value.clientWidth)
  go(Math.abs(delta) > 45 ? origin + Math.sign(delta) : origin)
}
async function toggleStory() {
  storyOpen.value = !storyOpen.value
  await nextTick()
  content.value?.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })
}
function key(event: KeyboardEvent) {
  if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable]')) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    go(index.value + (event.key === 'ArrowLeft' ? -1 : 1))
  }
}
onMounted(() => {
  dialog.value?.showModal()
  emit('photo', index.value)
  resize = new ResizeObserver(() => {
    if (track.value)
      track.value.scrollTo({ left: index.value * track.value.clientWidth, behavior: 'instant' })
  })
  if (track.value) resize.observe(track.value)
})
onBeforeUnmount(() => resize?.disconnect())
</script>
<template>
  <dialog
    ref="dialog"
    class="proto-album"
    aria-labelledby="proto-album-title"
    @cancel.prevent="emit('close')"
    @keydown="key"
  >
    <header>
      <div>
        <small
          >DAY {{ String(dayNumber).padStart(2, '0') }} · 回憶 {{ memory.id + 1 }} /
          {{ totalMemories }} · {{ memory.place }}</small
        >
        <h2 id="proto-album-title">{{ memory.title }}</h2>
      </div>
      <button
        class="proto-album-close"
        autofocus
        aria-label="關閉照片故事"
        title="關閉"
        @click="emit('close')"
      >
        ×
      </button>
    </header>
    <button
      class="proto-story-entry"
      :aria-expanded="storyOpen"
      aria-controls="proto-story-content"
      @click="toggleStory"
    >
      <span class="proto-story-symbol" aria-hidden="true">❝</span>
      <span class="proto-story-entry-copy"
        ><strong>那時候，我們在想什麼</strong><small>{{ memory.story }}</small></span
      >
      <span class="proto-story-action">{{ storyOpen ? '收起故事 ↑' : '讀故事 ↓' }}</span>
    </button>
    <div ref="content" class="proto-album-content">
      <section
        v-show="storyOpen"
        id="proto-story-content"
        class="proto-album-story"
        aria-label="共同短文"
      >
        <p>{{ memory.story }}</p>
        <p>我：「現在想起來，還是會笑。」<br />旅伴：「我記得你當時的表情。」</p>
        <small>{{ memory.place }} · 以上為虛構示範短文</small>
      </section>
      <p class="proto-swipe-hint">左右滑動照片 · 桌機也能拖曳</p>
      <div class="proto-photo-window" :class="{ 'has-before': index > 0, 'has-after': !last }">
        <div
          ref="track"
          class="proto-photo-track"
          :class="{ dragging }"
          tabindex="0"
          role="region"
          aria-label="可左右滑動的精選照片"
          @scroll="scrolled"
          @pointerdown="pointerDown"
          @pointermove="pointerMove"
          @pointerup="pointerUp"
          @pointercancel="pointerUp"
          @lostpointercapture="pointerUp"
        >
          <figure
            v-for="(photo, number) in memory.photos"
            :key="number"
            :aria-label="`第 ${number + 1} 張，共 ${memory.photos.length} 張`"
          >
            <img
              :src="photo.src"
              :alt="`回憶 ${memory.id + 1} 的示範插畫，第 ${number + 1} 張`"
              draggable="false"
            />
            <figcaption>{{ photo.caption }}</figcaption>
          </figure>
        </div>
      </div>
      <nav class="proto-unified-nav" aria-label="照片與回憶導覽">
        <button
          :disabled="first && !previousMemory"
          :aria-label="previousLabel"
          :title="first && previousMemory ? previousMemory.title : previousLabel"
          :class="{ 'chapter-step': first && previousMemory }"
          @click="previous"
        >
          <span aria-hidden="true">{{ first && previousMemory ? '«' : '←' }}</span
          ><small>{{ first && previousMemory ? '上一段回憶' : '上一張' }}</small>
        </button>
        <span class="proto-photo-position" aria-live="polite"
          ><strong>{{ index + 1 }} / {{ memory.photos.length }}</strong
          ><small>回憶 {{ memory.id + 1 }} / {{ totalMemories }}</small></span
        >
        <button
          :aria-label="nextLabel"
          :title="last && nextMemory ? nextMemory.title : nextLabel"
          :class="{ 'chapter-step': last && nextMemory, 'close-step': last && !nextMemory }"
          @click="next"
        >
          <small>{{ last ? (nextMemory ? '下一段回憶' : '關閉') : '下一張' }}</small
          ><span aria-hidden="true">{{ last ? (nextMemory ? '»' : '×') : '→' }}</span>
        </button>
      </nav>
    </div>
    <footer>
      {{ willResume ? '關閉後，從剛才的路線繼續。' : '關閉後，留在地圖自由探索。' }}
      照片以插畫佔位。
    </footer>
  </dialog>
</template>
