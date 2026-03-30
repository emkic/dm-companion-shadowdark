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
  MOVE_PLAYER_TO_DISPLAY: 'display:move-player'
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
    ipcRenderer.invoke(CH.MOVE_PLAYER_TO_DISPLAY, displayId)
})
