import { useState, useEffect } from 'react'

// Returns whole seconds remaining until `endsAt` (epoch ms). Re-renders ~4x/sec
// so the displayed value updates close to each second boundary. Returns null
// when `endsAt` is null (no timer).
export function useRemainingSeconds(endsAt: number | null): number | null {
  const [, force] = useState(0)
  useEffect(() => {
    if (endsAt === null) return
    const id = setInterval(() => force(n => n + 1), 250)
    return () => clearInterval(id)
  }, [endsAt])
  if (endsAt === null) return null
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
}
