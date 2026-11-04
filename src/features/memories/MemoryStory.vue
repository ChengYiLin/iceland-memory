<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TravelMemory } from '@/types/journey'

defineProps<{ memory: TravelMemory; dayNumber: number }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
const expanded = ref(false)

onMounted(() => dialog.value?.showModal())
</script>

<template>
  <dialog
    ref="dialog"
    class="memory-dialog"
    aria-labelledby="memory-title"
    @close="emit('close')"
    @click="
      (event) => {
        if (event.target === dialog) dialog?.close()
      }
    "
  >
    <article class="memory-story">
      <button autofocus class="close-button" aria-label="關閉回憶" @click="dialog?.close()">
        ×
      </button>
      <p class="eyebrow">
        DAY {{ String(dayNumber).padStart(2, '0') }} · {{ memory.locationName }}
      </p>
      <h2 id="memory-title">{{ memory.title }}</h2>
      <p class="story-copy">{{ memory.story }}</p>
      <figure v-if="memory.photos[0]" class="story-photo">
        <img
          :src="memory.photos[0].src"
          :alt="memory.photos[0].alt"
          :width="memory.photos[0].width"
          :height="memory.photos[0].height"
        />
        <figcaption>{{ memory.photos[0].caption }}</figcaption>
      </figure>
      <p v-else class="empty-photos">這段回憶的照片正在整理中。</p>
      <button
        v-if="!expanded && memory.photos.length > 1"
        class="primary-button"
        @click="expanded = true"
      >
        展開這段回憶的 {{ memory.photos.length }} 張照片 <span aria-hidden="true">↓</span>
      </button>
      <template v-if="expanded">
        <figure v-for="photo in memory.photos.slice(1)" :key="photo.id" class="story-photo">
          <img
            :src="photo.src"
            :alt="photo.alt"
            :width="photo.width"
            :height="photo.height"
            loading="lazy"
            decoding="async"
          />
          <figcaption>{{ photo.caption }}</figcaption>
        </figure>
      </template>
      <p class="story-end">把這一刻，留在路上。</p>
    </article>
  </dialog>
</template>
