import { ipcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { IpcChannel } from '../../src/shared/ipcChannels'
import { saveSession, loadSession, listSessions, deleteSession, loadMoodPresets, saveMoodPresets, loadAmbianceVolume, saveAmbianceVolume, loadParties, saveParties } from '../store/store'
import { broadcastToPlayer, movePlayerToDisplay } from './state-bridge'
import { getAllDisplays } from '../utils/display'
import type { AppState, MoodPreset, Party } from '../../src/shared/types'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'])
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.mkv'])

export function registerIpcHandlers(): void {
  ipcMain.on(IpcChannel.BROADCAST_STATE, (_event, state: AppState) => {
    broadcastToPlayer(state)
  })

  ipcMain.handle(IpcChannel.SAVE_SESSION, (_event, name: string, appState: AppState) => {
    saveSession(name, appState)
    return true
  })

  ipcMain.handle(IpcChannel.LOAD_SESSION, (_event, name: string) => {
    return loadSession(name)
  })

  ipcMain.handle(IpcChannel.LIST_SESSIONS, () => {
    return listSessions()
  })

  ipcMain.handle(IpcChannel.DELETE_SESSION, (_event, name: string) => {
    deleteSession(name)
    return true
  })

  ipcMain.handle(IpcChannel.OPEN_FOLDER_DIALOG, async (event) => {
    const win = require('electron').BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:open-image', async (event) => {
    const win = require('electron').BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }
      ]
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle(IpcChannel.GET_DISPLAYS, () => {
    return getAllDisplays()
  })

  ipcMain.handle(IpcChannel.MOVE_PLAYER_TO_DISPLAY, (_event, displayId: number) => {
    return movePlayerToDisplay(displayId)
  })

  ipcMain.handle(IpcChannel.LOAD_MOOD_PRESETS, () => {
    return loadMoodPresets()
  })

  ipcMain.handle(IpcChannel.SAVE_MOOD_PRESETS, (_event, presets: MoodPreset[]) => {
    saveMoodPresets(presets)
  })

  ipcMain.handle(IpcChannel.LOAD_AMBIANCE_VOLUME, () => {
    return loadAmbianceVolume()
  })

  ipcMain.handle(IpcChannel.SAVE_AMBIANCE_VOLUME, (_event, volume: number) => {
    saveAmbianceVolume(volume)
  })

  ipcMain.handle(IpcChannel.OPEN_AUDIO_DIALOG, async (event) => {
    const win = require('electron').BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'webm'] }
      ]
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle(IpcChannel.LOAD_PARTIES, () => {
    return loadParties()
  })

  ipcMain.handle(IpcChannel.SAVE_PARTIES, (_event, parties: Party[]) => {
    saveParties(parties)
  })

  ipcMain.handle(IpcChannel.READ_MEDIA_FOLDER, async (_event, folderPath: string) => {
    try {
      const entries = await fs.promises.readdir(folderPath, { recursive: true }) as string[]
      return entries.filter(entry => {
        const ext = path.extname(entry).toLowerCase()
        return IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext)
      }).map(entry => path.join(folderPath, entry))
    } catch {
      return []
    }
  })
}
