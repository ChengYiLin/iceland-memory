<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { Collection } from '@/types/content'
import { dayAnchor } from './dayAnchors'
const props = defineProps<{ collection: Collection; selectedId: string | null }>()
const emit = defineEmits<{ select: [id: string]; overview: [] }>()
const dialog = ref<HTMLDialogElement>(),
  expanded = ref(false),
  trigger = ref<HTMLButtonElement>()
const selected = computed(() => props.collection.days.find((d) => d.id === props.selectedId))
function show() {
  dialog.value?.showModal()
  expanded.value = true
}
function close() {
  dialog.value?.close()
  expanded.value = false
  trigger.value?.focus()
}
function choose(id: string) {
  close()
  emit('select', id)
}
function overview() {
  close()
  emit('overview')
}
function backdrop(event: MouseEvent) {
  if (event.target === dialog.value) {
    const box = dialog.value.getBoundingClientRect()
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      close()
  }
}
onBeforeUnmount(() => dialog.value?.close())
</script>
<template>
  <button
    ref="trigger"
    class="day-menu-trigger"
    aria-label="開啟行程選單"
    aria-haspopup="dialog"
    :aria-expanded="expanded"
    @click="show"
  >
    <span class="day-menu-icon" aria-hidden="true">☰</span
    ><span
      ><strong>{{
        selected ? `DAY ${String(selected.number).padStart(2, '0')}` : '18 天旅程'
      }}</strong
      ><small>{{ selected ? selected.date.slice(5) : '選一天，走回那時候' }}</small></span
    ><span aria-hidden="true">⌃</span>
  </button>
  <Teleport to="body"
    ><dialog
      ref="dialog"
      class="day-menu-dialog"
      aria-labelledby="day-menu-title"
      @click="backdrop"
      @cancel.prevent="close"
      @close="expanded = false"
    >
      <header>
        <div>
          <p class="viewer-eyebrow">OUR ICELAND JOURNAL · 18 DAYS</p>
          <h2 id="day-menu-title">選一天，走回那時候。</h2>
          <p>2026.09.23 — 10.10</p>
        </div>
        <button class="day-menu-close" aria-label="關閉行程選單" @click="close">×</button>
      </header>
      <button class="menu-overview" @click="overview">
        <span aria-hidden="true">⌂</span> 返回全島總覽 <span aria-hidden="true">↗</span>
      </button>
      <nav aria-label="全部旅行日">
        <button
          v-for="day in collection.days"
          :key="day.id"
          class="day-menu-option"
          :aria-label="`選擇 Day ${day.number}：${day.title}`"
          :class="{ 'is-selected': selectedId === day.id }"
          :aria-current="selectedId === day.id ? 'date' : undefined"
          @click="choose(day.id)"
        >
          <span class="menu-day-number"
            ><small>DAY</small><strong>{{ String(day.number).padStart(2, '0') }}</strong></span
          ><span class="menu-day-copy"
            ><small
              >{{ day.date.slice(5) }} ·
              {{ dayAnchor(day, collection)?.label ?? '航程與返家故事' }}</small
            ><strong>{{ day.title }}</strong></span
          ><span aria-hidden="true">{{ selectedId === day.id ? '●' : '↗' }}</span>
        </button>
      </nav>
    </dialog></Teleport
  >
</template>
