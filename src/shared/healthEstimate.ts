import type { HealthEstimate } from './types'

export function getHealthEstimate(currentHP: number, maxHP: number): HealthEstimate {
  if (maxHP <= 0) return 'Dead'
  if (currentHP <= 0) return 'Dying'
  const pct = currentHP / maxHP
  if (pct >= 1.0) return 'Uninjured'
  if (pct > 0.5) return 'Injured'
  if (pct >= 0.2) return 'Bloodied'
  return 'Near Death'
}

export const HEALTH_ESTIMATE_COLORS: Record<HealthEstimate, string> = {
  Uninjured: '#6aaa6a',
  Injured: '#c8a84b',
  Bloodied: '#c87820',
  'Near Death': '#8b2020',
  Dying: '#5a0a8a',
  Dead: '#333333'
}
