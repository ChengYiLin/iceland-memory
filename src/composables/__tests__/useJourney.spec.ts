import { describe, expect, it } from 'vitest'
import { journey } from '@/data/journey'
import { useJourney } from '../useJourney'

describe('journey navigation', () => {
  it('finishes on the chosen day and preserves it while opening and closing memories', () => {
    const state = useJourney(journey)
    expect(state.selectedDay.value).toBeNull()
    state.selectDay('day-01')
    state.setPhase('drawing')
    state.setPhase('exploring')
    expect(state.selectedDay.value?.id).toBe('day-01')
    state.selectMemory('first-stop')
    const replayKey = state.replayKey.value
    expect(state.selectedMemory.value?.id).toBe('first-stop')
    state.closeMemory()
    expect(state.selectedMemory.value).toBeNull()
    expect(state.selectedDay.value?.id).toBe('day-01')
    expect(state.replayKey.value).toBe(replayKey)
    expect(state.phase.value).toBe('exploring')
  })

  it('clears the old memory when switching days and rejects unrelated selections', () => {
    const state = useJourney(journey)
    state.selectDay('day-01')
    state.selectMemory('first-stop')
    state.selectDay('day-02')
    expect(state.selectedMemory.value).toBeNull()
    expect(state.phase.value).toBe('moving')
    state.selectMemory('first-stop')
    expect(state.selectedMemory.value).toBeNull()
    state.selectDay('unknown')
    expect(state.selectedDay.value?.id).toBe('day-02')
    state.overview()
    expect(state.selectedDay.value).toBeNull()
    expect(state.phase.value).toBe('idle')
  })
})
