<script setup lang="ts">
import { watch, nextTick, ref } from 'vue'
import type { DemoMemory } from './demo'
const props = defineProps<{
  memory: DemoMemory | undefined
  complete: boolean
  memories: DemoMemory[]
}>()
defineEmits<{ open: [index: number] }>()
const strip = ref<HTMLElement>()
watch(
  () => props.memory?.id,
  async (id) => {
    await nextTick()
    const child = strip.value?.children[id ?? 0] as HTMLElement | undefined
    if (child && strip.value)
      strip.value.scrollTo({
        left: child.offsetLeft - strip.value.offsetLeft - 16,
        behavior: 'smooth',
      })
  },
)
</script>
<template>
  <section class="proto-contact-sheet">
    <div class="proto-strip-heading">
      <h2>沿途的 {{ memories.length }} 個片刻</h2>
      <span>選一張照片，回到那時候</span>
    </div>
    <div ref="strip" class="proto-filmstrip">
      <button
        v-for="item in memories"
        :key="item.id"
        :class="{
          current: item.id === memory?.id,
          future: !complete && item.id > (memory?.id ?? -1),
        }"
        @click="$emit('open', item.id)"
      >
        <img :src="item.photos[0]!.src" alt="代表照片的示範插畫" /><span
          ><small>{{ String(item.id + 1).padStart(2, '0') }}</small
          >{{ item.title }}</span
        >
      </button>
    </div>
  </section>
</template>
