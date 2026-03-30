import { useState, useCallback } from 'react'
import type { AppState } from '@shared/types'

export interface SessionMeta {
  name: string
  savedAt: number
}

export interface UseSessionReturn {
  sessions: SessionMeta[]
  loadSessions: () => Promise<void>
  saveSession: (name: string, appState: AppState) => Promise<void>
  loadSession: (name: string) => Promise<AppState | null>
  deleteSession: (name: string) => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [sessions, setSessions] = useState<SessionMeta[]>([])

  const loadSessions = useCallback(async () => {
    const list = await window.electronAPI.listSessions()
    setSessions(list.sort((a: SessionMeta, b: SessionMeta) => b.savedAt - a.savedAt))
  }, [])

  const saveSession = useCallback(async (name: string, appState: AppState) => {
    await window.electronAPI.saveSession(name, appState)
    await loadSessions()
  }, [loadSessions])

  const loadSession = useCallback(async (name: string): Promise<AppState | null> => {
    const data = await window.electronAPI.loadSession(name)
    return data?.appState ?? null
  }, [])

  const deleteSession = useCallback(async (name: string) => {
    await window.electronAPI.deleteSession(name)
    await loadSessions()
  }, [loadSessions])

  return { sessions, loadSessions, saveSession, loadSession, deleteSession }
}
