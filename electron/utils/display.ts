import { screen } from 'electron'

export function getPlayerDisplayBounds(): Electron.Rectangle {
  const displays = screen.getAllDisplays()
  if (displays.length > 1) {
    return displays[1].bounds
  }
  // Fallback: use primary display dimensions
  const primary = displays[0].bounds
  return { x: primary.x, y: primary.y, width: primary.width, height: primary.height }
}
