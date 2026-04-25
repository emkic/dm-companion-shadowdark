import { useState, useEffect, useCallback } from 'react'

const MIN_SCALE = 0.8
const MAX_SCALE = 1.6
const STEP = 0.1

function clamp(value: number): number {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, value))
}

// Floats accumulate rounding error after a few +0.1 steps. Round to 2 decimals.
function round(value: number): number {
  return Math.round(value * 100) / 100
}

export interface UsePlayerFontScaleReturn {
  scale: number
  increase: () => void
  decrease: () => void
  canIncrease: boolean
  canDecrease: boolean
}

export function usePlayerFontScale(): UsePlayerFontScaleReturn {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    window.electronAPI.loadPlayerFontScale().then(setScale)
  }, [])

  const update = useCallback((next: number) => {
    const clamped = round(clamp(next))
    setScale(clamped)
    window.electronAPI.savePlayerFontScale(clamped)
  }, [])

  const increase = useCallback(() => update(scale + STEP), [scale, update])
  const decrease = useCallback(() => update(scale - STEP), [scale, update])

  return {
    scale,
    increase,
    decrease,
    canIncrease: scale < MAX_SCALE - 0.001,
    canDecrease: scale > MIN_SCALE + 0.001
  }
}
