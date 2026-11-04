import { computed, ref } from 'vue'
import type { Journey, PlaybackPhase } from '@/types/journey'

export function useJourney(journey: Journey) {
  const dayId = ref<string | null>(null)
  const memoryId = ref<string | null>(null)
  const replayKey = ref(0)
  const phase = ref<PlaybackPhase>('idle')
  const selectedDay = computed(() => journey.days.find((day) => day.id === dayId.value) ?? null)
  const selectedMemory = computed(
    () => selectedDay.value?.memories.find((memory) => memory.id === memoryId.value) ?? null,
  )
  const dayIndex = computed(() => journey.days.findIndex((day) => day.id === dayId.value))

  function selectDay(id: string) {
    if (!journey.days.some((day) => day.id === id)) return
    dayId.value = id
    memoryId.value = null
    phase.value = 'moving'
    replayKey.value += 1
  }

  function selectMemory(id: string) {
    if (selectedDay.value?.memories.some((memory) => memory.id === id)) memoryId.value = id
  }

  function overview() {
    dayId.value = null
    memoryId.value = null
    phase.value = 'idle'
  }

  function setPhase(next: PlaybackPhase) {
    if (selectedDay.value) phase.value = next
  }

  return {
    selectedDay,
    selectedMemory,
    dayIndex,
    replayKey,
    phase,
    selectDay,
    selectMemory,
    overview,
    setPhase,
    closeMemory: () => {
      memoryId.value = null
    },
  }
}
