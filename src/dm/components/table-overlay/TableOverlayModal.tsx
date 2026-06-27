import { useState, useEffect } from 'react'
import type { TableLayout, DisplayInfo } from '@shared/types'
import { TableLayoutEditor } from './TableLayoutEditor'
import './TableOverlayModal.css'

interface Props {
  enabled: boolean
  onToggle: () => void
  layout: TableLayout
  onLayoutChange: (layout: TableLayout) => void
  overlayDisplayId: number
  onDisplayChange: (displayId: number) => void
  partyNames: string[]
  onClose: () => void
}

export function TableOverlayModal({ enabled, onToggle, layout, onLayoutChange, overlayDisplayId, onDisplayChange, partyNames, onClose }: Props) {
  const [displays, setDisplays] = useState<DisplayInfo[]>([])

  useEffect(() => {
    window.electronAPI.getDisplays().then(setDisplays)
  }, [])

  function set(patch: Partial<TableLayout>) {
    onLayoutChange({ ...layout, ...patch })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog tl-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Table Overlay</h2>
          <span className="tl-modal__experimental">experimental</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Main enable toggle */}
        <div className="tl-modal__toggle-row">
          <label className="tl-modal__toggle-label">Show player zones on TV</label>
          <button
            className={`btn btn-small ${enabled ? 'btn-primary' : 'btn-ghost'}`}
            onClick={onToggle}
          >
            {enabled ? 'On' : 'Off'}
          </button>
          <p className="tl-modal__hint">
            Creates a transparent overlay on your table TV. Zones light up on each player's turn.
            Foundry or any other app shows through the center.
          </p>
        </div>

        {/* Display selector */}
        {displays.length > 1 && (
          <div className="tl-modal__display-row">
            <label className="tl-modal__toggle-label">Table TV display</label>
            <select
              className="form-select"
              value={overlayDisplayId || ''}
              onChange={e => onDisplayChange(Number(e.target.value))}
            >
              <option value="">Auto (third display)</option>
              {displays.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Zone display options */}
        <div className="tl-modal__section-label">Zone display</div>

        <div className="tl-modal__option-row">
          <label className="tl-modal__toggle-label">Show player names</label>
          <button
            className={`btn btn-small ${layout.showName ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => set({ showName: !layout.showName })}
          >
            {layout.showName ? 'On' : 'Off'}
          </button>
        </div>

        <div className="tl-modal__option-row">
          <label className="tl-modal__toggle-label">Show health estimate</label>
          <button
            className={`btn btn-small ${layout.showHealth ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => set({ showHealth: !layout.showHealth })}
          >
            {layout.showHealth ? 'On' : 'Off'}
          </button>
          <span className="tl-modal__option-hint">Uninjured → Injured → Bloodied → Near Death → Dying</span>
        </div>

        {layout.dmZone && (
          <div className="tl-modal__option-row">
            <label className="tl-modal__toggle-label">Show DM zone (red glow)</label>
            <button
              className={`btn btn-small ${layout.dmZoneActive ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => set({ dmZoneActive: !layout.dmZoneActive })}
            >
              {layout.dmZoneActive ? 'On' : 'Off'}
            </button>
          </div>
        )}

        {/* Layout canvas editor */}
        <TableLayoutEditor
          layout={layout}
          onChange={onLayoutChange}
          partyNames={partyNames}
        />
      </div>
    </div>
  )
}
