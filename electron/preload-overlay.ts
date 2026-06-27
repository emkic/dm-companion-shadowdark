import { contextBridge, ipcRenderer } from 'electron'
import type { AppState, TableLayout } from '../src/shared/types'

// Inline channel names — same reason as preload.ts and preload-player.ts
const CH = {
  OVERLAY_STATE_UPDATE: 'overlay:state-update',
  OVERLAY_LAYOUT_UPDATE: 'overlay:layout-update',
  LOAD_TABLE_LAYOUT: 'table-overlay:load-layout'
}

contextBridge.exposeInMainWorld('overlayAPI', {
  onStateUpdate: (callback: (state: AppState) => void) => {
    ipcRenderer.removeAllListeners(CH.OVERLAY_STATE_UPDATE)
    ipcRenderer.on(CH.OVERLAY_STATE_UPDATE, (_event, state: AppState) => callback(state))
    return () => ipcRenderer.removeAllListeners(CH.OVERLAY_STATE_UPDATE)
  },
  onLayoutUpdate: (callback: (layout: TableLayout) => void) => {
    ipcRenderer.removeAllListeners(CH.OVERLAY_LAYOUT_UPDATE)
    ipcRenderer.on(CH.OVERLAY_LAYOUT_UPDATE, (_event, layout: TableLayout) => callback(layout))
    return () => ipcRenderer.removeAllListeners(CH.OVERLAY_LAYOUT_UPDATE)
  },
  loadLayout: (): Promise<TableLayout> => ipcRenderer.invoke(CH.LOAD_TABLE_LAYOUT)
})
