import { app, BrowserWindow, protocol, powerSaveBlocker, session } from 'electron'
import { join } from 'path'
import { getPlayerDisplayBounds } from './utils/display'
import { setPlayerWindow } from './ipc/state-bridge'
import { registerIpcHandlers } from './ipc/ipc-handlers'

const isDev = !!process.env['ELECTRON_RENDERER_URL']

// Vite HMR needs eval + ws connections to localhost; production gets a strict policy.
if (isDev) process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

function setupCSP(): void {
  // Dev needs 'unsafe-inline' for Vite's React Fast Refresh preamble and
  // 'unsafe-eval' for HMR module evaluation. Production gets neither.
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com`
    : `'self' https://www.youtube.com`
  const connectSrc = isDev
    ? `'self' ws://localhost:* http://localhost:*`
    : `'self'`

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: media:`,
    `media-src 'self' blob: media:`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc}`,
    `frame-src https://www.youtube.com https://www.youtube-nocookie.com`,
    `object-src 'none'`,
    `base-uri 'self'`
  ].join('; ')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })
}

let dmWindow: BrowserWindow | null = null
let playerWindow: BrowserWindow | null = null

function createWindows(): void {
  const playerBounds = getPlayerDisplayBounds()

  // DM Window
  dmWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'DM Companion for Shadowdark',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Player Window
  playerWindow = new BrowserWindow({
    x: playerBounds.x,
    y: playerBounds.y,
    width: playerBounds.width,
    height: playerBounds.height,
    fullscreen: true,
    frame: false,
    title: 'Shadowdark Player',
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, '../preload/player.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  setPlayerWindow(playerWindow)

  // Open DevTools in dev mode to diagnose renderer errors
  if (process.env['ELECTRON_RENDERER_URL']) {
    dmWindow.webContents.openDevTools()
  }

  if (process.env['ELECTRON_RENDERER_URL']) {
    dmWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/dm/index.html`)
    playerWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/player/index.html`)
  } else {
    dmWindow.loadFile(join(__dirname, '../renderer/dm/index.html'))
    playerWindow.loadFile(join(__dirname, '../renderer/player/index.html'))
  }

  dmWindow.on('closed', () => {
    if (playerWindow && !playerWindow.isDestroyed()) {
      playerWindow.close()
    }
    dmWindow = null
  })

  playerWindow.on('closed', () => {
    playerWindow = null
  })
}

function registerMediaProtocol(): void {
  protocol.registerFileProtocol('media', (request, callback) => {
    // URL format: media:///G:/path/to/file  →  filePath: G:/path/to/file
    const filePath = decodeURIComponent(request.url.slice('media:///'.length))
    try {
      callback({ path: filePath })
    } catch {
      callback({ error: -6 })
    }
  })
}

app.whenReady().then(() => {
  powerSaveBlocker.start('prevent-display-sleep')
  setupCSP()
  registerMediaProtocol()
  registerIpcHandlers()
  createWindows()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
