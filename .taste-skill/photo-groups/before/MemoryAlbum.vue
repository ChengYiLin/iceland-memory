<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ContentMemory } from '@/types/content'
import { imageUrl } from '@/types/content'
const props = defineProps<{
  memory: ContentMemory
  dayNumber: number
  previous?: ContentMemory
  next?: ContentMemory
  initialPhoto?: number
  shareMessage?: string
}>()
const emit = defineEmits<{
  close: []
  overview: []
  share: []
  navigate: [id: string, photo: number]
}>()
const dialog = ref<HTMLDialogElement>(),
  track = ref<HTMLDivElement>(),
  content = ref<HTMLDivElement>()
const index = ref(Math.max(0, Math.min(props.initialPhoto ?? 0, props.memory.photos.length - 1))),
  expanded = ref(false)
const first = computed(() => index.value === 0),
  last = computed(() => index.value >= props.memory.photos.length - 1)
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
let startX = 0,
  startScroll = 0,
  dragging = false
function go(value: number) {
  track.value?.scrollTo({
    left: Math.max(0, Math.min(value, props.memory.photos.length - 1)) * track.value.clientWidth,
    behavior: reduced ? 'instant' : 'smooth',
  })
}
function previousMemoryOrPhoto() {
  if (first.value && props.previous)
    emit('navigate', props.previous.id, Math.max(0, props.previous.photos.length - 1))
  else go(index.value - 1)
}
function nextMemoryOrPhoto() {
  if (!last.value) go(index.value + 1)
  else if (props.next) emit('navigate', props.next.id, 0)
  else emit('close')
}
function scroll() {
  if (track.value && !dragging)
    index.value = Math.max(
      0,
      Math.min(
        props.memory.photos.length - 1,
        Math.round(track.value.scrollLeft / track.value.clientWidth),
      ),
    )
}
function down(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !track.value) return
  dragging = true
  startX = event.clientX
  startScroll = track.value.scrollLeft
  track.value.setPointerCapture(event.pointerId)
}
function move(event: PointerEvent) {
  if (dragging && track.value) track.value.scrollLeft = startScroll + startX - event.clientX
}
function up() {
  if (!dragging || !track.value) return
  dragging = false
  const delta = track.value.scrollLeft - startScroll
  go(
    Math.round(startScroll / track.value.clientWidth) +
      (Math.abs(delta) > 45 ? Math.sign(delta) : 0),
  )
}
function key(event: KeyboardEvent) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    go(index.value + (event.key === 'ArrowRight' ? 1 : -1))
  }
}
async function story() {
  expanded.value = !expanded.value
  await nextTick()
  content.value?.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })
}
function failed(event: Event) {
  const image = event.target as HTMLImageElement
  image.hidden = true
  image.parentElement?.classList.add('image-failed')
}
onMounted(async () => {
  dialog.value?.showModal()
  await nextTick()
  if (track.value) track.value.scrollLeft = index.value * track.value.clientWidth
})
onBeforeUnmount(() => dialog.value?.close())
</script>
<template>
  <Teleport to="body"
    ><dialog
      ref="dialog"
      class="memory-album"
      aria-labelledby="album-title"
      @cancel.prevent="emit('close')"
      @keydown="key"
    >
      <header>
        <div>
          <h2 id="album-title">{{ memory.title }}</h2>
          <small>第 {{ dayNumber }} 天 · {{ memory.locationName }}</small>
        </div>
        <button class="album-home" aria-label="返回全島總覽" @click="emit('overview')">⌂</button
        ><button class="album-close" aria-label="關閉照片故事" @click="emit('close')">×</button>
      </header>
      <button class="story-entrance" :aria-expanded="expanded" @click="story">
        <span aria-hidden="true">“</span
        ><span
          ><small>我們留下的故事</small
          ><strong>{{
            memory.story.split(/[。！\n]/)[0] || '這段共同短文，等你們一起補上。'
          }}</strong></span
        ><em>{{ expanded ? '收起' : '讀故事' }} ↗</em>
      </button>
      <div ref="content" class="album-content">
        <section v-if="expanded" class="full-story">
          <p>{{ memory.story || '共同短文待補。' }}</p>
          <p v-if="memory.remarks" class="traveler-remarks">{{ memory.remarks }}</p>
        </section>
        <div
          v-if="memory.photos.length"
          ref="track"
          class="album-track"
          tabindex="0"
          aria-label="橫向翻閱照片"
          @scroll="scroll"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
        >
          <figure v-for="(photo, i) in memory.photos" :key="photo.id">
            <img
              :src="imageUrl(photo.src)"
              :alt="photo.alt"
              :loading="i === index ? 'eager' : 'lazy'"
              draggable="false"
              @error="failed"
            />
            <figcaption>{{ photo.caption }}</figcaption>
            <span class="failed-photo">照片暫時無法顯示，故事仍在這裡。</span>
          </figure>
        </div>
        <div v-else class="album-empty">
          <span aria-hidden="true">＋</span>
          <p>這一刻，等照片回來。</p>
          <small>照片待加入，故事可以先讀。</small>
        </div>
        <nav class="album-navigation" aria-label="照片與回憶導覽">
          <button
            :class="{ 'cross-memory': first && props.previous }"
            :disabled="first && !props.previous"
            @click="previousMemoryOrPhoto"
          >
            <span aria-hidden="true">{{ first && props.previous ? '≪' : '←' }}</span>
            {{ first && props.previous ? '上一段回憶' : '上一張' }}</button
          ><span>{{
            memory.photos.length ? `${index + 1} / ${memory.photos.length}` : '照片待補'
          }}</span
          ><button :class="{ 'cross-memory': last }" @click="nextMemoryOrPhoto">
            {{ last ? (props.next ? '下一段回憶' : '關閉') : '下一張' }}
            <span aria-hidden="true">{{ last && props.next ? '≫' : '→' }}</span>
          </button>
        </nav>
        <div class="album-share">
          <button @click="emit('share')">分享這段回憶 ↗</button>
          <p v-if="shareMessage" role="status">{{ shareMessage }}</p>
        </div>
        <p class="album-footnote">
          {{
            memory.locationStatus === 'pending'
              ? '位置待確認 · 這段回憶仍完整保留'
              : memory.locationStatus === 'flight'
                ? '航程與返家 · 地圖留在冰島'
                : memory.coordinateSource
                  ? '景點參考位置，非實際拍照座標'
                  : '沿途的我們'
          }}
          · 手動翻閱，慢慢回味。
        </p>
      </div>
    </dialog></Teleport
  >
</template>
