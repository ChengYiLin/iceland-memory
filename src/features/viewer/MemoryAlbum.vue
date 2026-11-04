<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ContentMemory } from '@/types/content'
import { dateLabel, locationNote } from './memoryDisplay'
import MemoryPhotos from './MemoryPhotos.vue'
const props = defineProps<{
  memory: ContentMemory
  dayNumber: number
  dayDate: string
  dayHasPhotos: boolean
  arrivedVia?: 'previous' | 'next' | null
  previous?: ContentMemory
  next?: ContentMemory
  initialPhoto?: number
  shareMessage?: string
}>()
const emit = defineEmits<{
  close: []
  overview: []
  share: []
  navigate: [id: string, photo: number, via: 'previous' | 'next']
}>()
const dialog = ref<HTMLDialogElement>()
const heading = ref<HTMLHeadingElement>()
const previousButton = ref<HTMLButtonElement>()
const nextButton = ref<HTMLButtonElement>()
const subtitle = computed(() =>
  [
    `第 ${props.dayNumber} 天`,
    dateLabel(props.dayDate),
    locationNote(props.memory),
    props.memory.photos.length ? `${props.memory.photos.length} 張精選照片` : null,
  ]
    .filter(Boolean)
    .join(' · '),
)
onMounted(() => {
  dialog.value?.showModal()
  const stepping =
    props.arrivedVia === 'next'
      ? nextButton.value
      : props.arrivedVia === 'previous' && props.previous
        ? previousButton.value
        : null
  ;(stepping ?? heading.value)?.focus()
})
onBeforeUnmount(() => dialog.value?.close())
</script>
<template>
  <Teleport to="body"
    ><dialog
      ref="dialog"
      class="memory-album"
      :class="dayHasPhotos ? 'has-day-photos' : 'is-text-day'"
      aria-labelledby="album-title"
      @cancel.prevent="emit('close')"
    >
      <header>
        <div>
          <h2 id="album-title" ref="heading" tabindex="-1">{{ memory.title }}</h2>
          <small>{{ subtitle }}</small>
        </div>
        <button class="album-home" aria-label="返回全島總覽" @click="emit('overview')">⌂</button
        ><button class="album-close" aria-label="關閉照片故事" @click="emit('close')">×</button>
      </header>
      <div class="album-content" tabindex="0" aria-label="回憶內容">
        <MemoryPhotos
          v-if="memory.photos.length"
          :photos="memory.photos"
          :initial-photo="initialPhoto"
        />
        <section class="full-story" :class="{ 'is-story-only': !memory.photos.length }">
          <p>{{ memory.story || '共同短文待補。' }}</p>
          <p v-if="memory.remarks" class="traveler-remarks">{{ memory.remarks }}</p>
        </section>
        <p v-if="!memory.photos.length" class="album-empty">這一刻，等照片回來。</p>
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
        </p>
      </div>
      <nav class="album-memory-navigation" aria-label="切換回憶">
        <button
          ref="previousButton"
          :disabled="!props.previous"
          @click="props.previous && emit('navigate', props.previous.id, 0, 'previous')"
        >
          <small>← 上一段回憶</small>
          <strong>{{ props.previous?.title ?? '這是第一段回憶' }}</strong>
        </button>
        <button
          ref="nextButton"
          @click="props.next ? emit('navigate', props.next.id, 0, 'next') : emit('close')"
        >
          <small>{{ props.next ? '下一段回憶 →' : '回到地圖 →' }}</small>
          <strong>{{ props.next?.title ?? '繼續探索沿途的回憶' }}</strong>
        </button>
      </nav>
    </dialog></Teleport
  >
</template>
