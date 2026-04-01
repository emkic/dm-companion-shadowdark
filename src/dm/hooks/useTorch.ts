import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_TORCH_SECONDS, LOW_TORCH_THRESHOLD, createDefaultTimer } from '@shared/constants'
import type { TorchState, TimerState, LightMode } from '@shared/types'

export interface UseTorchReturn {
  torchState: TorchState
  isTimerLow: (id: string) => boolean
  allExtinguished: boolean
  addTimer: () => void
  removeTimer: (id: string) => void
  renameTimer: (id: string, label: string) => void
  start: (id: string) => void
  stop: (id: string) => void
  reset: (id: string) => void
  adjustMinutes: (id: string, delta: number) => void
  extinguish: (id: string) => void
  relight: (id: string) => void
  setLightMode: (id: string, mode: LightMode) => void
  toggleHideTimer: (id: string) => void
  setTorchState: (state: TorchState) => void
}

function updateTimer(timers: TimerState[], id: string, updater: (t: TimerState) => TimerState): TimerState[] {
  return timers.map(t => t.id === id ? updater(t) : t)
}

export function useTorch(): UseTorchReturn {
  const [timers, setTimers] = useState<TimerState[]>([createDefaultTimer()])

  // Single interval ticks all running timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const hasRunning = prev.some(t => t.isRunning)
        if (!hasRunning) return prev
        return prev.map(t => {
          if (!t.isRunning || t.timeLeft <= 0) return t
          if (t.timeLeft <= 1) return { ...t, timeLeft: 0, isRunning: false, isExtinguished: true }
          return { ...t, timeLeft: t.timeLeft - 1 }
        })
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const isTimerLow = useCallback((id: string): boolean => {
    const timer = timers.find(t => t.id === id)
    if (!timer) return false
    return timer.timeLeft / DEFAULT_TORCH_SECONDS < LOW_TORCH_THRESHOLD
  }, [timers])

  const nonNaturalTimers = timers.filter(t => t.lightMode !== 'natural')
  const allExtinguished = nonNaturalTimers.length > 0 && nonNaturalTimers.every(t => t.isExtinguished)

  const addTimer = useCallback(() => {
    setTimers(prev => [...prev, createDefaultTimer()])
  }, [])

  const removeTimer = useCallback((id: string) => {
    setTimers(prev => prev.length <= 1 ? prev : prev.filter(t => t.id !== id))
  }, [])

  const renameTimer = useCallback((id: string, label: string) => {
    setTimers(prev => updateTimer(prev, id, t => ({ ...t, label })))
  }, [])

  const start = useCallback((id: string) => {
    setTimers(prev => updateTimer(prev, id, t =>
      t.timeLeft > 0 ? { ...t, isRunning: true, isExtinguished: false } : t
    ))
  }, [])

  const stop = useCallback((id: string) => {
    setTimers(prev => updateTimer(prev, id, t => ({ ...t, isRunning: false })))
  }, [])

  const reset = useCallback((id: string) => {
    setTimers(prev => updateTimer(prev, id, t => ({
      ...t, timeLeft: DEFAULT_TORCH_SECONDS, isRunning: false, isExtinguished: false
    })))
  }, [])

  const adjustMinutes = useCallback((id: string, delta: number) => {
    setTimers(prev => updateTimer(prev, id, t => ({
      ...t, timeLeft: Math.max(0, t.timeLeft + delta * 60)
    })))
  }, [])

  const extinguish = useCallback((id: string) => {
    setTimers(prev => updateTimer(prev, id, t => ({ ...t, isRunning: false, isExtinguished: true })))
  }, [])

  const relight = useCallback((id: string) => {
    setTimers(prev => updateTimer(prev, id, t =>
      t.timeLeft > 0 ? { ...t, isRunning: true, isExtinguished: false } : t
    ))
  }, [])

  const setLightMode = useCallback((id: string, mode: LightMode) => {
    setTimers(prev => updateTimer(prev, id, t => ({
      ...t,
      lightMode: mode,
      isRunning: mode === 'natural' ? false : t.isRunning,
      isExtinguished: mode === 'natural' ? false : t.isExtinguished
    })))
  }, [])

  const toggleHideTimer = useCallback((id: string) => {
    setTimers(prev => updateTimer(prev, id, t => ({ ...t, hideTimerFromPlayer: !t.hideTimerFromPlayer })))
  }, [])

  const setTorchState = useCallback((state: TorchState) => {
    setTimers(state.timers.map(t => ({ ...t, isRunning: false })))
  }, [])

  const torchState: TorchState = { timers }

  return {
    torchState, isTimerLow, allExtinguished,
    addTimer, removeTimer, renameTimer,
    start, stop, reset, adjustMinutes,
    extinguish, relight, setLightMode, toggleHideTimer,
    setTorchState
  }
}
