import type { AppState, SessionData } from './types'

declare global {
  interface Window {
    electronAPI: {
      broadcastState: (state: AppState) => void
      saveSession: (name: string, appState: AppState) => Promise<boolean>
      loadSession: (name: string) => Promise<SessionData | null>
      listSessions: () => Promise<Array<{ name: string; savedAt: number }>>
      deleteSession: (name: string) => Promise<boolean>
      openFolderDialog: () => Promise<string | null>
      readMediaFolder: (folderPath: string) => Promise<string[]>
      openImageDialog: () => Promise<string | null>
    }
    playerAPI: {
      onStateUpdate: (callback: (state: AppState) => void) => () => void
    }
  }
}

export {}
