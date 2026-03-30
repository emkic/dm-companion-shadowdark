import { screen } from 'electron'
import type { DisplayInfo } from '../../src/shared/types'

export function getPlayerDisplayBounds(): Electron.Rectangle {
  const displays = screen.getAllDisplays()
  if (displays.length > 1) {
    return displays[1].bounds
  }
  // Fallback: use primary display dimensions
  const primary = displays[0].bounds
  return { x: primary.x, y: primary.y, width: primary.width, height: primary.height }
}

export function getAllDisplays(): DisplayInfo[] {
  const primary = screen.getPrimaryDisplay()
  return screen.getAllDisplays().map((d, i) => ({
    id: d.id,
    label: `Display ${i + 1} (${d.bounds.width}×${d.bounds.height})${d.id === primary.id ? ' — Primary' : ''}`,
    width: d.bounds.width,
    height: d.bounds.height,
    isPrimary: d.id === primary.id
  }))
}

export function getDisplayBoundsById(displayId: number): Electron.Rectangle | null {
  const display = screen.getAllDisplays().find(d => d.id === displayId)
  return display ? display.bounds : null
}
