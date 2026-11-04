<script setup lang="ts">
import type { DemoMemory } from './demo'
defineProps<{ memory: DemoMemory | undefined; complete: boolean; memories: DemoMemory[] }>()
defineEmits<{ open: [index: number] }>()
</script>
<template>
  <aside class="proto-journal">
    <p class="proto-kicker">A PAGE FROM OUR JOURNEY</p>
    <template v-if="memory">
      <span class="proto-big-number">{{ String(memory.id + 1).padStart(2, '0') }}</span>
      <h2>{{ memory.title }}</h2>
      <button class="proto-journal-photo" @click="$emit('open', memory.id)">
        <img :src="memory.photos[0]!.src" alt="代表照片的示範插畫" /><span
          >翻開 {{ memory.photos.length }} 張精選 →</span
        >
      </button>
      <p class="proto-story-teaser">{{ memory.story }}</p>
      <small>{{ memory.place }}</small>
    </template>
    <template v-else
      ><h2>{{ complete ? '這一天，留在這裡。' : '等下一個片刻，慢慢靠近。' }}</h2>
      <p>地圖留住方向，照片留住當時的我們。</p></template
    >
    <nav class="proto-number-nav" aria-label="這一天的回憶">
      <button
        v-for="item in memories"
        :key="item.id"
        :aria-label="`翻開回憶 ${item.id + 1}`"
        :aria-pressed="item.id === memory?.id"
        @click="$emit('open', item.id)"
      >
        {{ String(item.id + 1).padStart(2, '0') }}
      </button>
    </nav>
  </aside>
</template>
