import type { AppState, SessionData, DisplayInfo, MoodPreset, Party } from './types'

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
      getDisplays: () => Promise<DisplayInfo[]>
      movePlayerToDisplay: (displayId: number) => Promise<boolean>
      loadMoodPresets: () => Promise<MoodPreset[]>
      saveMoodPresets: (presets: MoodPreset[]) => Promise<void>
      loadAmbianceVolume: () => Promise<number>
      saveAmbianceVolume: (volume: number) => Promise<void>
      openAudioDialog: () => Promise<string[]>
      loadParties: () => Promise<Party[]>
      saveParties: (parties: Party[]) => Promise<void>
    }
    playerAPI: {
      onStateUpdate: (callback: (state: AppState) => void) => () => void
    }
  }
}

export {}
