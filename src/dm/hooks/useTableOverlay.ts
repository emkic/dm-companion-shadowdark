import { useState, useEffect, useCallback } from 'react'
import type { TableLayout } from '@shared/types'

export function useTableOverlay() {
  const [enabled, setEnabled] = useState(false)
  const [layout, setLayout] = useState<TableLayout>({ zones: [] })
  const [overlayDisplayId, setOverlayDisplayId] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      window.electronAPI.loadTableOverlayEnabled(),
      window.electronAPI.loadTableLayout(),
      window.electronAPI.loadOverlayDisplayId()
    ]).then(([en, lay, dispId]) => {
      setEnabled(en)
      setLayout(lay)
      setOverlayDisplayId(dispId)
      setLoaded(true)
    })
  }, [])

  const toggleEnabled = useCallback(async () => {
    const next = !enabled
    setEnabled(next)
    await window.electronAPI.setTableOverlayEnabled(next)
  }, [enabled])

  const saveLayout = useCallback(async (newLayout: TableLayout) => {
    setLayout(newLayout)
    await window.electronAPI.saveTableLayout(newLayout)
  }, [])

  const changeDisplay = useCallback(async (displayId: number) => {
    setOverlayDisplayId(displayId)
    await window.electronAPI.setOverlayDisplayId(displayId)
  }, [])

  return { enabled, toggleEnabled, layout, saveLayout, overlayDisplayId, changeDisplay, loaded }
}
