import { useState, useEffect, useRef, useCallback } from 'react'
import { DEFAULT_TORCH_SECONDS, LOW_TORCH_THRESHOLD } from '@shared/constants'
import type { TorchState, LightMode } from '@shared/types'

export interface UseTorchReturn {
  torch: TorchState
  lowAlert: boolean
  start: () => void
  stop: () => void
  reset: () => void
  adjustMinutes: (delta: number) => void
  extinguish: () => void
  relight: () => void
  setLightMode: (mode: LightMode) => void
  setTorchState: (state: TorchState) => void
}

export function useTorch(): UseTorchReturn {
  const [torch, setTorch] = useState<TorchState>({
    timeLeft: DEFAULT_TORCH_SECONDS,
    isRunning: false,
    isExtinguished: false,
    lightMode: 'torch'
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (torch.isRunning) {
      intervalRef.current = setInterval(() => {
        setTorch(prev => {
          if (prev.timeLeft <= 0) {
            return { ...prev, timeLeft: 0, isRunning: false }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 }
        })
      }, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [torch.isRunning, clearTimer])

  const start = useCallback(() => {
    setTorch(prev => prev.timeLeft > 0 ? { ...prev, isRunning: true, isExtinguished: false } : prev)
  }, [])

  const stop = useCallback(() => {
    setTorch(prev => ({ ...prev, isRunning: false }))
  }, [])

  const reset = useCallback(() => {
    setTorch(prev => ({ timeLeft: DEFAULT_TORCH_SECONDS, isRunning: false, isExtinguished: false, lightMode: prev.lightMode }))
  }, [])

  const extinguish = useCallback(() => {
    setTorch(prev => ({ ...prev, isRunning: false, isExtinguished: true }))
  }, [])

  const relight = useCallback(() => {
    setTorch(prev => prev.timeLeft > 0 ? { ...prev, isExtinguished: false } : prev)
  }, [])

  const setLightMode = useCallback((mode: LightMode) => {
    setTorch(prev => ({
      ...prev,
      lightMode: mode,
      isRunning: mode === 'natural' ? false : prev.isRunning,
      isExtinguished: mode === 'natural' ? false : prev.isExtinguished
    }))
  }, [])

  const adjustMinutes = useCallback((delta: number) => {
    setTorch(prev => ({
      ...prev,
      timeLeft: Math.max(0, prev.timeLeft + delta * 60)
    }))
  }, [])

  const setTorchState = useCallback((state: TorchState) => {
    setTorch({ ...state, isRunning: false }) // always restore as paused
  }, [])

  const lowAlert = torch.timeLeft / DEFAULT_TORCH_SECONDS < LOW_TORCH_THRESHOLD

  return { torch, lowAlert, start, stop, reset, adjustMinutes, extinguish, relight, setLightMode, setTorchState }
}
