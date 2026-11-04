<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { imageUrl, type Collection } from '@/types/content'
import { dayAnchor } from './dayAnchors'
import { dateLabel, locationNote } from './memoryDisplay'
import './journey-menu.css'

const props = defineProps<{
  collection: Collection
  selectedId: string | null
  shareMessage: string
}>()
const emit = defineEmits<{ select: [id: string]; open: [id: string]; overview: []; share: [] }>()
const dialog = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const heading = ref<HTMLHeadingElement>()
const content = ref<HTMLElement>()
const expanded = ref(false)
const view = ref<'days' | 'memories'>('days')
const selected = computed(() => props.collection.days.find((day) => day.id === props.selectedId))

async function show(target?: 'days' | 'memories') {
  view.value = target ?? (selected.value ? 'memories' : 'days')
  if (!dialog.value?.open) dialog.value?.showModal()
  expanded.value = true
  await focusContent()
}
async function focusContent() {
  await nextTick()
  content.value?.scrollTo({ top: 0 })
  heading.value?.focus()
}
function close() {
  dialog.value?.close()
  expanded.value = false
  trigger.value?.focus()
}
async function choose(id: string) {
  emit('select', id)
  view.value = 'memories'
  await focusContent()
}
async function showDays() {
  view.value = 'days'
  await focusContent()
}
function open(id: string) {
  close()
  emit('open', id)
}
function overview() {
  close()
  emit('overview')
}
function backdrop(event: MouseEvent) {
  if (event.target !== dialog.value) return
  const box = dialog.value.getBoundingClientRect()
  if (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
    close()
}
defineExpose({ show })
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <button
    ref="trigger"
    class="journey-menu-trigger"
    aria-label="開啟旅程與回憶"
    aria-haspopup="dialog"
    :aria-expanded="expanded"
    @click="show()"
  >
    <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
      <path d="M3 5h14M3 10h14M3 15h14" fill="none" stroke="currentColor" stroke-width="1.5" />
    </svg>
    <span>
      <strong>旅程與回憶</strong>
      <small>{{
        selected
          ? `第 ${selected.number} 天 · ${selected.memories.length} 段回憶`
          : `${collection.totalDays} 天，沿途的我們`
      }}</small>
    </span>
    <span aria-hidden="true">⌃</span>
  </button>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="journey-menu"
      aria-label="旅程與回憶"
      @click="backdrop"
      @cancel.prevent="close"
      @close="expanded = false"
    >
      <header
        class="journey-menu-header"
        :class="{ 'is-memory-view': view === 'memories' && selected }"
      >
        <div>
          <button v-if="view === 'memories'" class="journey-back" @click="showDays">
            ← 全部旅行日
          </button>
          <h2 ref="heading" tabindex="-1">
            {{
              view === 'memories' && selected ? `${dateLabel(selected.date)}的回憶` : '全部旅行日'
            }}
          </h2>
          <p>
            {{
              view === 'memories' && selected
                ? `第 ${selected.number} 天 · ${selected.memories.length} 段回憶`
                : '2026 年 9 月 23 日 — 10 月 10 日'
            }}
          </p>
        </div>
        <button class="journey-menu-close" aria-label="關閉旅程與回憶" @click="close">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <path
              d="m6 6 12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>
      <div ref="content" class="journey-menu-content">
        <nav v-if="view === 'days'" aria-label="全部旅行日">
          <button
            v-for="day in collection.days"
            :key="day.id"
            class="journey-day-option"
            :aria-label="`選擇 Day ${day.number}：${day.date.slice(5)} · ${day.title}`"
            :aria-current="selectedId === day.id ? 'date' : undefined"
            @click="choose(day.id)"
          >
            <span class="journey-day-date">
              <time :datetime="day.date.replaceAll('/', '-')">{{ day.date.slice(5) }}</time>
              <small>第 {{ day.number }} 天</small>
            </span>
            <span class="journey-day-copy">
              <strong>{{ dayAnchor(day, collection)?.label ?? '航程與返家故事' }}</strong>
              <span>{{ day.title }}</span>
              <small>{{ day.memories.length }} 段回憶</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        </nav>
        <section v-else-if="selected" class="journey-memories" aria-label="當日回憶清單">
          <p class="journey-day-title">{{ selected.title }}</p>
          <ol>
            <li v-for="(memory, index) in selected.memories" :key="memory.id">
              <button class="journey-memory-option" @click="open(memory.id)">
                <b class="journey-memory-number" aria-hidden="true">{{ index + 1 }}</b>
                <span v-if="memory.photos.length" class="journey-photo-set" aria-hidden="true">
                  <img
                    v-for="photo in memory.photos.slice(0, 3)"
                    :key="photo.id"
                    :src="imageUrl(photo.thumbnail)"
                    alt=""
                    loading="lazy"
                  />
                </span>
                <span class="journey-memory-copy">
                  <strong>{{ memory.title }}</strong>
                  <small v-if="locationNote(memory)">{{ locationNote(memory) }}</small>
                  <small v-if="memory.photos.length" class="journey-photo-count">
                    {{ memory.photos.length }} 張精選照片
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            </li>
          </ol>
          <p v-if="!selected.memories.length" class="journey-empty">這一天的回憶還在整理中。</p>
        </section>
      </div>
      <footer class="journey-menu-footer">
        <div>
          <button class="journey-overview" @click="overview">全島總覽</button>
          <button @click="emit('share')">{{ selected ? '分享這一天' : '分享旅程' }} ↗</button>
        </div>
        <p v-if="shareMessage" role="status">{{ shareMessage }}</p>
      </footer>
    </dialog>
  </Teleport>
</template>
