import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import type { AppState, TableLayout } from '../../src/shared/types'
import { IpcChannel } from '../../src/shared/ipcChannels'
import { getDisplayBoundsById } from '../utils/display'

let overlayWindow: BrowserWindow | null = null
let _isDev = false
let _rendererUrl: string | undefined

export function initOverlayBridge(isDev: boolean, rendererUrl: string | undefined): void {
  _isDev = isDev
  _rendererUrl = rendererUrl
}

// Resolves which display the overlay should go on.
// Prefers a saved displayId, then the third display, then the second, then primary.
function getOverlayBounds(displayId: number): Electron.Rectangle {
  if (displayId !== 0) {
    const saved = getDisplayBoundsById(displayId)
    if (saved) return saved
  }
  const displays = screen.getAllDisplays()
  if (displays.length >= 3) return displays[2].bounds
  if (displays.length >= 2) return displays[1].bounds
  return displays[0].bounds
}

export function createOverlayWindow(displayId = 0): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) return
  const bounds = getOverlayBounds(displayId)
  overlayWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    title: 'Table Overlay',
    webPreferences: {
      preload: join(__dirname, '../preload/overlay.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  overlayWindow.setIgnoreMouseEvents(true, { forward: true })

  if (_isDev && _rendererUrl) {
    overlayWindow.loadURL(`${_rendererUrl}/overlay/index.html`)
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/overlay/index.html'))
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null
  })
}

export function moveOverlayToDisplay(displayId: number): void {
  if (!overlayWindow || overlayWindow.isDestroyed()) return
  const bounds = getOverlayBounds(displayId)
  overlayWindow.setBounds(bounds)
}

export function destroyOverlayWindow(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close()
  }
  overlayWindow = null
}

export function broadcastToOverlay(state: AppState): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send(IpcChannel.OVERLAY_STATE_UPDATE, state)
  }
}

export function sendLayoutToOverlay(layout: TableLayout): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send(IpcChannel.OVERLAY_LAYOUT_UPDATE, layout)
  }
}
