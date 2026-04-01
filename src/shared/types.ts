export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type DangerLevel = 'unsafe' | 'risky' | 'deadly'
export type HealthEstimate = 'Uninjured' | 'Injured' | 'Bloodied' | 'Near Death' | 'Dying' | 'Dead'

export type LightMode = 'torch' | 'natural' | 'magical'

export interface TimerState {
  id: string
  label: string
  lightMode: LightMode
  timeLeft: number   // seconds
  isRunning: boolean
  isExtinguished: boolean
  hideTimerFromPlayer: boolean
}

export interface TorchState {
  timers: TimerState[]
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

export type ActivityState = 'traveling' | 'crawling' | 'city'
export type TravelMethod = 'walking' | 'mounted' | 'sailing'

export const HEXES_PER_DAY: Record<TravelMethod, number> = {
  walking: 4,
  mounted: 6,
  sailing: 8
}

export const ACTIVITY_LABELS: Record<ActivityState, string> = {
  traveling: 'Traveling',
  crawling: 'Dungeon Crawling',
  city: 'In City / Village'
}

export interface WatchSlot {
  name: string
  encounter: boolean
  interruption: boolean
}

export interface LocationState {
  name: string
  season: Season
  weather: string
  dangerLevel: DangerLevel
  imagePath: string
  showToPlayer: boolean
  activity: ActivityState
  date: string
  showDate: boolean
  travelMethod: TravelMethod
  isPushing: boolean
  hexesRemaining: number
  isCamping: boolean
  hasCampfire: boolean
  watches: [WatchSlot, WatchSlot, WatchSlot, WatchSlot]
  checklist: {
    weatherRolled: boolean
    rationsConsumed: boolean
    foragingAttempt: boolean
    encounterDay1: boolean
    encounterDay2: boolean
    encounterNight1: boolean
    encounterNight2: boolean
  }
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

export interface DisplayInfo {
  id: number
  label: string
  width: number
  height: number
  isPrimary: boolean
}
