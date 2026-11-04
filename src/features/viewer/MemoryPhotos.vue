<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MemoryPhoto } from '@/types/journey'
import { imageUrl } from '@/types/content'
import './memory-photos.css'

const props = defineProps<{ photos: MemoryPhoto[]; initialPhoto?: number }>()
const track = ref<HTMLDivElement>()
const thumbnails = ref<HTMLOListElement>()
const index = ref(clamp(props.initialPhoto ?? 0))
const dragging = ref(false)
const first = computed(() => index.value === 0)
const last = computed(() => index.value >= props.photos.length - 1)
let requested: number | null = null
let startX = 0
let startScroll = 0
let startIndex = 0
let previousWidth = 0
let resize: ResizeObserver | undefined

function clamp(value: number) {
  return Math.max(0, Math.min(value, props.photos.length - 1))
}
function revealThumbnail() {
  const strip = thumbnails.value
  const button = strip?.querySelectorAll('button')[index.value]
  if (!strip || !button) return
  const frame = strip.getBoundingClientRect()
  const item = button.getBoundingClientRect()
  if (item.left < frame.left) strip.scrollLeft += item.left - frame.left
  else if (item.right > frame.right) strip.scrollLeft += item.right - frame.right
}
function go(value: number, behavior?: ScrollBehavior) {
  const focused = document.activeElement
  const focusPhoto =
    focused instanceof HTMLButtonElement &&
    focused.closest('.album-photo-controls') &&
    (clamp(value) === 0 || clamp(value) === props.photos.length - 1)
  index.value = clamp(value)
  requested = index.value
  track.value?.scrollTo({
    left: index.value * track.value.clientWidth,
    behavior:
      behavior ?? (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'),
  })
  nextTick(() => {
    revealThumbnail()
    if (focusPhoto) track.value?.focus({ preventScroll: true })
  })
}
function scroll() {
  const element = track.value
  if (!element || dragging.value) return
  if (previousWidth && element.clientWidth !== previousWidth) return
  if (requested !== null) {
    if (Math.abs(element.scrollLeft - requested * element.clientWidth) < 1) requested = null
    return
  }
  index.value = clamp(Math.round(element.scrollLeft / element.clientWidth))
  revealThumbnail()
}
function settled() {
  requested = null
  scroll()
}
function down(event: PointerEvent) {
  if (
    event.pointerType !== 'mouse' ||
    event.button !== 0 ||
    !track.value ||
    props.photos.length < 2
  )
    return
  event.preventDefault()
  requested = null
  track.value.scrollTo({ left: track.value.scrollLeft, behavior: 'instant' })
  dragging.value = true
  startX = event.clientX
  startScroll = track.value.scrollLeft
  startIndex = clamp(Math.round(startScroll / track.value.clientWidth))
  track.value.focus({ preventScroll: true })
  track.value.setPointerCapture(event.pointerId)
}
function move(event: PointerEvent) {
  if (dragging.value && track.value) track.value.scrollLeft = startScroll + startX - event.clientX
}
function up() {
  if (!dragging.value || !track.value) return
  const delta = track.value.scrollLeft - startScroll
  const step = Math.abs(delta) > Math.min(60, track.value.clientWidth * 0.15) ? Math.sign(delta) : 0
  dragging.value = false
  nextTick(() => go(startIndex + step))
}
function key(event: KeyboardEvent) {
  const target =
    event.key === 'ArrowRight'
      ? index.value + 1
      : event.key === 'ArrowLeft'
        ? index.value - 1
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? props.photos.length - 1
            : null
  if (target === null) return
  event.preventDefault()
  go(target)
  if (event.target instanceof Element && event.target.closest('.album-thumbnails'))
    thumbnails.value?.querySelectorAll('button')[index.value]?.focus({ preventScroll: true })
}
function failed(event: Event) {
  const image = event.target as HTMLImageElement
  image.hidden = true
  image.parentElement?.classList.add('image-failed')
}
watch(
  () => props.photos.length,
  () => nextTick(() => go(index.value, 'instant')),
)
onMounted(() => {
  go(index.value, 'instant')
  resize = new ResizeObserver(() => {
    const width = track.value?.clientWidth ?? 0
    if (!width || width === previousWidth) return
    previousWidth = width
    go(index.value, 'instant')
  })
  if (track.value) resize.observe(track.value)
})
onBeforeUnmount(() => resize?.disconnect())
</script>

<template>
  <section class="memory-photo-set" aria-label="精選照片組" @keydown="key">
    <div class="album-photo-controls">
      <button v-if="photos.length > 1" :disabled="first" @click="go(index - 1)">← 上一張</button>
      <p class="album-photo-count" aria-live="polite" aria-atomic="true">
        <strong>{{ index + 1 }} / {{ photos.length }}</strong>
        <span>張精選照片</span>
      </p>
      <button v-if="photos.length > 1" :disabled="last" @click="go(index + 1)">下一張 →</button>
    </div>
    <div
      ref="track"
      class="album-track"
      :class="{ 'is-dragging': dragging }"
      tabindex="0"
      role="group"
      aria-label="左右翻閱這段回憶的照片"
      @scroll="scroll"
      @scrollend="settled"
      @wheel="requested = null"
      @touchstart.passive="requested = null"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
    >
      <figure v-for="(photo, i) in photos" :key="photo.id" :aria-hidden="i !== index">
        <div class="album-photo-frame">
          <img
            :src="imageUrl(photo.src)"
            :alt="photo.alt"
            :loading="Math.abs(i - index) <= 1 ? 'eager' : 'lazy'"
            draggable="false"
            @error="failed"
          />
          <span class="failed-photo">這張照片暫時無法顯示，仍可繼續翻閱。</span>
        </div>
        <figcaption v-if="photo.caption">{{ photo.caption }}</figcaption>
      </figure>
    </div>
    <ol v-if="photos.length > 1" ref="thumbnails" class="album-thumbnails" aria-label="照片縮圖">
      <li v-for="(photo, i) in photos" :key="photo.id">
        <button
          :aria-label="`查看第 ${i + 1} 張照片：${photo.alt}`"
          :aria-pressed="i === index"
          @click="go(i)"
        >
          <img :src="imageUrl(photo.thumbnail)" alt="" loading="lazy" draggable="false" />
          <span aria-hidden="true">{{ i + 1 }}</span>
        </button>
      </li>
    </ol>
  </section>
</template>
