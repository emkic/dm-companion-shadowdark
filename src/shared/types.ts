export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type DangerLevel = 'safe' | 'unsafe' | 'risky' | 'deadly'
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

export interface EncounterCheckEntry {
  round: number
  checked: boolean   // was this round an encounter-check round?
  encounter: boolean // did the DM mark an encounter?
}

export interface CrawlingTurnSlot {
  name: string
  emoji?: string
}

export interface CrawlingState {
  isActive: boolean
  round: number
  currentTurnIndex: number
  turnOrder: CrawlingTurnSlot[]
  inTotalDarkness: boolean
  encounterLog: EncounterCheckEntry[]
  pendingEncounterCheck: boolean  // true = round ended, waiting for DM to resolve encounter check
  encounterFlash: boolean  // triggers the player-screen encounter flash
}

export type ActivityState = 'traveling' | 'city'
export type TravelMethod = 'walking' | 'mounted' | 'sailing'

export const HEXES_PER_DAY: Record<TravelMethod, number> = {
  walking: 4,
  mounted: 6,
  sailing: 8
}

export const ACTIVITY_LABELS: Record<ActivityState, string> = {
  traveling: 'Traveling',
  city: 'In City / Village'
}

export interface WatchSlot {
  name: string
  encounter: boolean
  interruption: boolean
  emoji?: string
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

export interface AnnouncementState {
  text: string
  isShowing: boolean
  timer: number | null  // seconds remaining, null = no auto-dismiss
}

export interface SavedLocation {
  id: string
  name: string
  imagePath: string
  dangerLevel: DangerLevel
}

export interface RosterPlayer {
  id: string
  name: string
  maxHP: number
  emoji: string
}

export interface Party {
  id: string
  name: string
  players: RosterPlayer[]
}

export interface AppState {
  torch: TorchState
  combat: CombatState
  crawling: CrawlingState
  location: LocationState
  media: MediaState
  announcement: AnnouncementState
  playerFontScale: number
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

// Ambiance / Music
export type AmbianceSource = 'youtube' | 'local'

export interface MoodPreset {
  id: string
  name: string            // e.g. "Combat", "Dungeon"
  color: string           // hex color for the mood button
  source: AmbianceSource  // 'youtube' or 'local' audio files
  youtubeUrl: string      // YouTube playlist or video URL (when source = 'youtube')
  audioFiles: string[]    // local audio file paths (when source = 'local')
  volume: number          // 0–100
  shuffle: boolean
  favorite: boolean       // show as shortcut in mini-player bar
}

export interface AmbianceState {
  isPlaying: boolean
  currentMoodId: string | null
  currentTrackTitle: string
  volume: number      // 0–100 master volume
}
