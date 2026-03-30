import Store from 'electron-store'
import type { AppState, SessionData } from '../../src/shared/types'

interface StoreSchema {
  sessions: Record<string, SessionData>
}

const store = new Store<StoreSchema>({
  schema: {
    sessions: {
      type: 'object',
      default: {}
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
