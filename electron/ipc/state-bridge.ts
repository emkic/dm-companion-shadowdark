import type { BrowserWindow } from 'electron'
import type { AppState } from '../../src/shared/types'
import { IpcChannel } from '../../src/shared/ipcChannels'

let playerWindow: BrowserWindow | null = null

export function setPlayerWindow(win: BrowserWindow): void {
  playerWindow = win
}

export function broadcastToPlayer(state: AppState): void {
  if (playerWindow && !playerWindow.isDestroyed()) {
    playerWindow.webContents.send(IpcChannel.PLAYER_STATE_UPDATE, state)
  }
}
