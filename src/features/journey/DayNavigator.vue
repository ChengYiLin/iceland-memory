<script setup lang="ts">
import type { JourneyDay } from '@/types/journey'

defineProps<{ days: JourneyDay[]; selectedDayId: string | null; dayIndex: number }>()
defineEmits<{ select: [id: string]; overview: [] }>()
</script>

<template>
  <nav class="day-navigator" aria-label="選擇旅行日">
    <button
      class="overview-button"
      :aria-pressed="selectedDayId === null"
      @click="$emit('overview')"
    >
      <span aria-hidden="true">◈</span> 全島總覽
    </button>
    <div class="day-tabs">
      <button
        v-for="day in days"
        :key="day.id"
        :aria-pressed="selectedDayId === day.id"
        :aria-label="`第 ${day.number} 天：${day.title}`"
        @click="$emit('select', day.id)"
      >
        <small>DAY</small>{{ String(day.number).padStart(2, '0') }}
      </button>
    </div>
    <div class="day-arrows">
      <button
        aria-label="上一天"
        :disabled="dayIndex <= 0"
        @click="$emit('select', days[dayIndex - 1]!.id)"
      >
        ←
      </button>
      <button
        aria-label="下一天"
        :disabled="dayIndex < 0 || dayIndex >= days.length - 1"
        @click="$emit('select', days[dayIndex + 1]!.id)"
      >
        →
      </button>
    </div>
  </nav>
</template>
