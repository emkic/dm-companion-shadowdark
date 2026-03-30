import { contextBridge, ipcRenderer } from 'electron'
import type { AppState } from '../src/shared/types'

const PLAYER_STATE_UPDATE = 'player:state-update'

contextBridge.exposeInMainWorld('playerAPI', {
  onStateUpdate: (callback: (state: AppState) => void) => {
    ipcRenderer.removeAllListeners(PLAYER_STATE_UPDATE)
    ipcRenderer.on(PLAYER_STATE_UPDATE, (_event, state: AppState) => {
      callback(state)
    })
    return () => {
      ipcRenderer.removeAllListeners(PLAYER_STATE_UPDATE)
    }
  }
})
