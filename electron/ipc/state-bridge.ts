import type { BrowserWindow } from 'electron'
import type { AppState } from '../../src/shared/types'
import { IpcChannel } from '../../src/shared/ipcChannels'
import { getDisplayBoundsById } from '../utils/display'

let playerWindow: BrowserWindow | null = null

export function setPlayerWindow(win: BrowserWindow): void {
  playerWindow = win
}

export function broadcastToPlayer(state: AppState): void {
  if (playerWindow && !playerWindow.isDestroyed()) {
    playerWindow.webContents.send(IpcChannel.PLAYER_STATE_UPDATE, state)
  }
}

export function movePlayerToDisplay(displayId: number): boolean {
  if (!playerWindow || playerWindow.isDestroyed()) return false
  const bounds = getDisplayBoundsById(displayId)
  if (!bounds) return false

  playerWindow.setFullScreen(false)
  playerWindow.setBounds(bounds)
  playerWindow.setFullScreen(true)
  return true
}
