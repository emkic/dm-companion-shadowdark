import Store from 'electron-store'
import type { AppState, SessionData, MoodPreset, RosterPlayer, Party } from '../../src/shared/types'

interface StoreSchema {
  sessions: Record<string, SessionData>
  moodPresets: MoodPreset[]
  ambianceVolume: number
  roster: RosterPlayer[]  // legacy, migrated to parties on first load
  parties: Party[]
}

const DEFAULT_MOOD_PRESETS: MoodPreset[] = [
  { id: '1', name: 'Combat',   color: '#c84040', source: 'youtube', youtubeUrl: '', audioFiles: [], volume: 70, shuffle: true, favorite: true },
  { id: '2', name: 'Suspense', color: '#8a5ca8', source: 'youtube', youtubeUrl: '', audioFiles: [], volume: 50, shuffle: true, favorite: true },
  { id: '3', name: 'Dungeon',  color: '#6b6b6b', source: 'youtube', youtubeUrl: '', audioFiles: [], volume: 50, shuffle: true, favorite: true },
  { id: '4', name: 'Town',     color: '#6a9955', source: 'youtube', youtubeUrl: '', audioFiles: [], volume: 50, shuffle: true, favorite: false },
  { id: '5', name: 'Forest',   color: '#3d7a3d', source: 'youtube', youtubeUrl: '', audioFiles: [], volume: 45, shuffle: true, favorite: false },
  { id: '6', name: 'Tavern',   color: '#c8a04b', source: 'youtube', youtubeUrl: '', audioFiles: [], volume: 60, shuffle: true, favorite: false },
  { id: '7', name: 'Mystery',  color: '#4a6fa5', source: 'youtube', youtubeUrl: '', audioFiles: [], volume: 40, shuffle: true, favorite: false },
]

const store = new Store<StoreSchema>({
  schema: {
    sessions: {
      type: 'object',
      default: {}
    },
    moodPresets: {
      type: 'array',
      default: DEFAULT_MOOD_PRESETS
    },
    ambianceVolume: {
      type: 'number',
      default: 70
    },
    roster: {
      type: 'array',
      default: []
    },
    parties: {
      type: 'array',
      default: []
    }
  }
})

export function saveSession(name: string, appState: AppState): void {
  const sessions = store.get('sessions', {})
  sessions[name] = { appState, savedAt: Date.now() }
  store.set('sessions', sessions)
}

export function loadSession(name: string): SessionData | null {
  const sessions = store.get('sessions', {})
  return sessions[name] ?? null
}

export function listSessions(): Array<{ name: string; savedAt: number }> {
  const sessions = store.get('sessions', {})
  return Object.entries(sessions).map(([name, data]) => ({
    name,
    savedAt: data.savedAt
  }))
}

export function deleteSession(name: string): void {
  const sessions = store.get('sessions', {})
  delete sessions[name]
  store.set('sessions', sessions)
}

export function loadMoodPresets(): MoodPreset[] {
  return store.get('moodPresets', DEFAULT_MOOD_PRESETS)
}

export function saveMoodPresets(presets: MoodPreset[]): void {
  store.set('moodPresets', presets)
}

export function loadAmbianceVolume(): number {
  return store.get('ambianceVolume', 70)
}

export function saveAmbianceVolume(volume: number): void {
  store.set('ambianceVolume', volume)
}

export function loadParties(): Party[] {
  let parties = store.get('parties', [])

  // Migrate old flat roster to a party if it exists
  const oldRoster = store.get('roster', [])
  if (oldRoster.length > 0 && parties.length === 0) {
    parties = [{ id: '1', name: 'Party', players: oldRoster }]
    store.set('parties', parties)
    store.set('roster', [])
  }

  return parties
}

export function saveParties(parties: Party[]): void {
  store.set('parties', parties)
}
