import { useState, useEffect } from 'react'
import type { DisplayInfo } from '@shared/types'
import './DisplaySelector.css'

export function DisplaySelector() {
  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    window.electronAPI.getDisplays().then(list => {
      setDisplays(list)
      // Default to first non-primary display, or primary if only one
      const nonPrimary = list.find(d => !d.isPrimary)
      setSelectedId(nonPrimary?.id ?? list[0]?.id ?? null)
    })
  }, [])

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value)
    setSelectedId(id)
    await window.electronAPI.movePlayerToDisplay(id)
  }

  async function handleRefresh() {
    const list = await window.electronAPI.getDisplays()
    setDisplays(list)
  }

  if (displays.length <= 1) return null

  return (
    <div className="display-selector">
      <label className="display-label">Player Screen:</label>
      <select
        className="form-select display-select"
        value={selectedId ?? ''}
        onChange={handleChange}
      >
        {displays.map(d => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      <button
        className="btn btn-ghost btn-small"
        onClick={handleRefresh}
        title="Refresh display list"
      >
        ↻
      </button>
    </div>
  )
}
