export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type DangerLevel = 'unsafe' | 'risky' | 'deadly'
export type HealthEstimate = 'Uninjured' | 'Injured' | 'Bloodied' | 'Near Death' | 'Dying' | 'Dead'

export type LightMode = 'torch' | 'natural' | 'magical'

export interface TorchState {
  timeLeft: number   // seconds
  isRunning: boolean
  isExtinguished: boolean
  lightMode: LightMode
}

export interface Combatant {
  id: string
  name: string
  emoji: string
  maxHP: number
  currentHP: number
  initiative: number
  type: 'player' | 'monster'
  isDying: boolean
  isDead: boolean
  deathTimer: number           // d4 result: rounds until permanent death (0 = not set yet)
  deathRoundsElapsed: number   // how many rounds have passed since death timer started
  awaitingDeathTimer: boolean  // first time at 0: show d4 prompt
}

export interface CombatState {
  isActive: boolean
  round: number
  currentTurnIndex: number
  combatants: Combatant[]
}

export interface LocationState {
  name: string
  season: Season
  weather: string
  dangerLevel: DangerLevel
  imagePath: string
  showToPlayer: boolean
}

export interface MediaState {
  currentFile: string | null
  fileType: 'image' | 'video' | null
  isShowing: boolean
  folderPath: string
  files: string[]
}

export interface AppState {
  torch: TorchState
  combat: CombatState
  location: LocationState
  media: MediaState
}

export interface SessionData {
  appState: AppState
  savedAt: number
}
