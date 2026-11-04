<script setup lang="ts">
import type { DemoMemory } from './demo'
defineProps<{ memory: DemoMemory | undefined; complete: boolean }>()
defineEmits<{ open: [index: number] }>()
</script>
<template>
  <aside class="proto-floating">
    <button v-if="memory" class="proto-arrival" @click="$emit('open', memory.id)">
      <img :src="memory.photos[0]!.src" alt="代表照片的示範插畫" />
      <span
        ><small>停靠 {{ String(memory.id + 1).padStart(2, '0') }} / 07</small
        ><strong>{{ memory.title }}</strong
        ><em>打開這段回憶 ↗</em></span
      >
    </button>
    <p v-else class="proto-explore-note">
      {{
        complete
          ? '七段回憶都在這裡。點一個數字，慢慢回味。'
          : '路線會慢慢展開。隨時點一個回憶，停下來。'
      }}
    </p>
  </aside>
</template>
