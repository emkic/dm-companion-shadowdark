import { contextBridge, ipcRenderer } from 'electron'
import type { AppState } from '../src/shared/types'

// Inline channel names to avoid shared chunk that breaks sandbox require
const CH = {
  BROADCAST_STATE: 'dm:broadcast-state',
  SAVE_SESSION: 'session:save',
  LOAD_SESSION: 'session:load',
  LIST_SESSIONS: 'session:list',
  DELETE_SESSION: 'session:delete',
  OPEN_FOLDER_DIALOG: 'dialog:open-folder',
  OPEN_IMAGE_DIALOG: 'dialog:open-image',
  READ_MEDIA_FOLDER: 'media:read-folder',
  GET_DISPLAYS: 'display:get-all',
  MOVE_PLAYER_TO_DISPLAY: 'display:move-player',
  LOAD_MOOD_PRESETS: 'ambiance:load-presets',
  SAVE_MOOD_PRESETS: 'ambiance:save-presets',
  LOAD_AMBIANCE_VOLUME: 'ambiance:load-volume',
  SAVE_AMBIANCE_VOLUME: 'ambiance:save-volume',
  OPEN_AUDIO_DIALOG: 'dialog:open-audio',
  LOAD_PARTIES: 'parties:load',
  SAVE_PARTIES: 'parties:save',
  LOAD_SAVED_LOCATIONS: 'saved-locations:load',
  SAVE_SAVED_LOCATIONS: 'saved-locations:save',
  LOAD_PLAYER_FONT_SCALE: 'player-font-scale:load',
  SAVE_PLAYER_FONT_SCALE: 'player-font-scale:save',
  SHELL_OPEN_EXTERNAL: 'shell:open-external',
  LOAD_TABLE_OVERLAY_ENABLED: 'table-overlay:load-enabled',
  SET_TABLE_OVERLAY_ENABLED: 'table-overlay:set-enabled',
  LOAD_TABLE_LAYOUT: 'table-overlay:load-layout',
  SAVE_TABLE_LAYOUT: 'table-overlay:save-layout',
  LOAD_OVERLAY_DISPLAY_ID: 'table-overlay:load-display-id',
  SET_OVERLAY_DISPLAY_ID: 'table-overlay:set-display-id'
}

contextBridge.exposeInMainWorld('electronAPI', {
  broadcastState: (state: AppState) => {
    ipcRenderer.send(CH.BROADCAST_STATE, state)
  },
  saveSession: (name: string, appState: AppState) =>
    ipcRenderer.invoke(CH.SAVE_SESSION, name, appState),
  loadSession: (name: string) =>
    ipcRenderer.invoke(CH.LOAD_SESSION, name),
  listSessions: () =>
    ipcRenderer.invoke(CH.LIST_SESSIONS),
  deleteSession: (name: string) =>
    ipcRenderer.invoke(CH.DELETE_SESSION, name),
  openFolderDialog: () =>
    ipcRenderer.invoke(CH.OPEN_FOLDER_DIALOG),
  readMediaFolder: (folderPath: string) =>
    ipcRenderer.invoke(CH.READ_MEDIA_FOLDER, folderPath),
  openImageDialog: () =>
    ipcRenderer.invoke(CH.OPEN_IMAGE_DIALOG),
  getDisplays: () =>
    ipcRenderer.invoke(CH.GET_DISPLAYS),
  movePlayerToDisplay: (displayId: number) =>
    ipcRenderer.invoke(CH.MOVE_PLAYER_TO_DISPLAY, displayId),
  loadMoodPresets: () =>
    ipcRenderer.invoke(CH.LOAD_MOOD_PRESETS),
  saveMoodPresets: (presets: unknown[]) =>
    ipcRenderer.invoke(CH.SAVE_MOOD_PRESETS, presets),
  loadAmbianceVolume: () =>
    ipcRenderer.invoke(CH.LOAD_AMBIANCE_VOLUME),
  saveAmbianceVolume: (volume: number) =>
    ipcRenderer.invoke(CH.SAVE_AMBIANCE_VOLUME, volume),
  openAudioDialog: () =>
    ipcRenderer.invoke(CH.OPEN_AUDIO_DIALOG),
  loadParties: () =>
    ipcRenderer.invoke(CH.LOAD_PARTIES),
  saveParties: (parties: unknown[]) =>
    ipcRenderer.invoke(CH.SAVE_PARTIES, parties),
  loadSavedLocations: () =>
    ipcRenderer.invoke(CH.LOAD_SAVED_LOCATIONS),
  saveSavedLocations: (locations: unknown[]) =>
    ipcRenderer.invoke(CH.SAVE_SAVED_LOCATIONS, locations),
  loadPlayerFontScale: () =>
    ipcRenderer.invoke(CH.LOAD_PLAYER_FONT_SCALE),
  savePlayerFontScale: (scale: number) =>
    ipcRenderer.invoke(CH.SAVE_PLAYER_FONT_SCALE, scale),
  openExternal: (url: string) =>
    ipcRenderer.invoke(CH.SHELL_OPEN_EXTERNAL, url),
  loadTableOverlayEnabled: () =>
    ipcRenderer.invoke(CH.LOAD_TABLE_OVERLAY_ENABLED),
  setTableOverlayEnabled: (enabled: boolean) =>
    ipcRenderer.invoke(CH.SET_TABLE_OVERLAY_ENABLED, enabled),
  loadTableLayout: () =>
    ipcRenderer.invoke(CH.LOAD_TABLE_LAYOUT),
  saveTableLayout: (layout: unknown) =>
    ipcRenderer.invoke(CH.SAVE_TABLE_LAYOUT, layout),
  loadOverlayDisplayId: () =>
    ipcRenderer.invoke(CH.LOAD_OVERLAY_DISPLAY_ID),
  setOverlayDisplayId: (displayId: number) =>
    ipcRenderer.invoke(CH.SET_OVERLAY_DISPLAY_ID, displayId)
})
