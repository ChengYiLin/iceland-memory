<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import type { Variant } from './demo'
const props = defineProps<{
  variant: Variant
  disabled: boolean
  state: object
  compact: boolean
}>()
const emit = defineEmits<{ change: [variant: Variant] }>()
const variants: Variant[] = ['A', 'B', 'C']
const labels = { A: '全螢幕・自由探索', B: '攤開旅行手帳', C: '沿途照片帶' }
function cycle(delta: number) {
  emit('change', variants[(variants.indexOf(props.variant) + delta + 3) % 3]!)
}
function key(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (props.disabled || target.closest('input,textarea,select,[contenteditable]')) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    cycle(event.key === 'ArrowLeft' ? -1 : 1)
  }
}
onMounted(() => window.addEventListener('keydown', key))
onBeforeUnmount(() => window.removeEventListener('keydown', key))
</script>
<template>
  <details v-show="!disabled" class="proto-tools" :class="{ compact }" :open="!compact">
    <summary v-if="compact" class="proto-tools-toggle" aria-label="原型比較工具">⋯</summary>
    <div class="proto-lab">
      <details>
        <summary>原型狀態</summary>
        <pre>{{ JSON.stringify(state, null, 2) }}</pre>
      </details>
      <nav class="proto-switcher" aria-label="比較原型版本">
        <button aria-label="上一個版本" @click="cycle(-1)">←</button
        ><span
          ><small>PROTOTYPE · {{ variant }} / C</small>{{ labels[variant] }}</span
        ><button aria-label="下一個版本" @click="cycle(1)">→</button>
      </nav>
    </div>
  </details>
</template>
