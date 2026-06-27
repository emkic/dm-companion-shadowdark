import { useRef, useState, useCallback } from 'react'
import type { TableLayout, TableZone } from '@shared/types'

interface Props {
  layout: TableLayout
  onChange: (layout: TableLayout) => void
  partyNames: string[]
}

type DragTarget =
  | { kind: 'zone'; id: string; startX: number; startY: number }
  | { kind: 'dm'; startX: number; startY: number }

interface DragState {
  target: DragTarget
  startMouseX: number
  startMouseY: number
}

export function TableLayoutEditor({ layout, onChange, partyNames }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [newName, setNewName] = useState('')

  const addZone = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const zone: TableZone = {
      id: `zone-${Date.now()}`,
      name: trimmed,
      x: 50,
      y: 50
    }
    onChange({ ...layout, zones: [...layout.zones, zone] })
    setNewName('')
  }, [layout, onChange])

  const removeZone = useCallback((id: string) => {
    const removed = layout.zones.find(z => z.id === id)
    const next: TableLayout = { ...layout, zones: layout.zones.filter(z => z.id !== id) }
    if (removed && layout.torchbearerName?.toLowerCase() === removed.name.toLowerCase()) {
      next.torchbearerName = null
    }
    onChange(next)
  }, [layout, onChange])

  const toggleMirror = useCallback((id: string) => {
    onChange({
      ...layout,
      zones: layout.zones.map(z => z.id === id ? { ...z, mirrored: !z.mirrored } : z)
    })
  }, [layout, onChange])

  const toggleDmZone = useCallback(() => {
    onChange({ ...layout, dmZone: layout.dmZone ? null : { x: 50, y: 88 } })
  }, [layout, onChange])

  const setTorchbearer = useCallback((name: string | null) => {
    onChange({ ...layout, torchbearerName: name })
  }, [layout, onChange])

  const startZoneDrag = useCallback((e: React.MouseEvent, zone: TableZone) => {
    e.preventDefault()
    dragRef.current = {
      target: { kind: 'zone', id: zone.id, startX: zone.x, startY: zone.y },
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    }
  }, [])

  const startDmDrag = useCallback((e: React.MouseEvent) => {
    if (!layout.dmZone) return
    e.preventDefault()
    dragRef.current = {
      target: { kind: 'dm', startX: layout.dmZone.x, startY: layout.dmZone.y },
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    }
  }, [layout.dmZone])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current
    if (!drag || !editorRef.current) return
    const rect = editorRef.current.getBoundingClientRect()
    const dx = ((e.clientX - drag.startMouseX) / rect.width) * 100
    const dy = ((e.clientY - drag.startMouseY) / rect.height) * 100

    if (drag.target.kind === 'dm') {
      const newX = Math.max(2, Math.min(98, drag.target.startX + dx))
      const newY = Math.max(2, Math.min(98, drag.target.startY + dy))
      onChange({ ...layout, dmZone: { x: newX, y: newY } })
    } else {
      const newX = Math.max(2, Math.min(98, drag.target.startX + dx))
      const newY = Math.max(2, Math.min(98, drag.target.startY + dy))
      onChange({
        ...layout,
        zones: layout.zones.map(z =>
          z.id === drag.target.id ? { ...z, x: newX, y: newY } : z
        )
      })
    }
  }, [layout, onChange])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const unusedNames = partyNames.filter(n =>
    !layout.zones.some(z => z.name.toLowerCase() === n.toLowerCase())
  )

  const isTorchbearer = (name: string) =>
    layout.torchbearerName?.toLowerCase() === name.toLowerCase()

  return (
    <div className="tl-editor">
      <div
        ref={editorRef}
        className="tl-canvas"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="tl-canvas__label">TV surface — drag zones to match seating</div>

        {layout.dmZone && (
          <div
            className="tl-zone tl-zone--dm"
            style={{ left: `${layout.dmZone.x}%`, top: `${layout.dmZone.y}%` }}
            onMouseDown={startDmDrag}
          >
            <span className="tl-zone__name">DM</span>
          </div>
        )}

        {layout.zones.map(zone => (
          <div
            key={zone.id}
            className={`tl-zone${zone.mirrored ? ' tl-zone--mirrored' : ''}`}
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            onMouseDown={e => startZoneDrag(e, zone)}
          >
            {isTorchbearer(zone.name) && (
              <span className="tl-zone__torch" title="Torchbearer">🔥</span>
            )}
            <span className="tl-zone__name">{zone.name}</span>
            <button
              className={`tl-zone__mirror${zone.mirrored ? ' tl-zone__mirror--active' : ''}`}
              onMouseDown={e => e.stopPropagation()}
              onClick={() => toggleMirror(zone.id)}
              title={zone.mirrored ? 'Remove mirror' : 'Mirror text (for opposite-side players)'}
            >
              ↻
            </button>
            <button
              className="tl-zone__delete"
              onMouseDown={e => e.stopPropagation()}
              onClick={() => removeZone(zone.id)}
              title="Remove zone"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="tl-controls">
        <div className="tl-dm-row">
          <button
            className={`btn btn-small ${layout.dmZone ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={toggleDmZone}
          >
            {layout.dmZone ? '− Remove DM seat' : '+ Add DM seat'}
          </button>
        </div>

        {layout.zones.length > 0 && (
          <div className="tl-torchbearer-row">
            <span className="tl-quick-add__label">Torchbearer:</span>
            {layout.torchbearerName && (
              <button
                className="btn btn-ghost btn-small"
                onClick={() => setTorchbearer(null)}
              >
                None
              </button>
            )}
            {layout.zones
              .filter(z => !isTorchbearer(z.name))
              .map(zone => (
                <button
                  key={zone.id}
                  className="btn btn-ghost btn-small"
                  onClick={() => setTorchbearer(zone.name)}
                >
                  🔥 {zone.name}
                </button>
              ))
            }
          </div>
        )}

        {unusedNames.length > 0 && (
          <div className="tl-quick-add">
            <span className="tl-quick-add__label">Add from party:</span>
            {unusedNames.map(name => (
              <button
                key={name}
                className="btn btn-ghost btn-small"
                onClick={() => addZone(name)}
              >
                + {name}
              </button>
            ))}
          </div>
        )}
        <div className="tl-manual-add">
          <input
            className="form-input"
            placeholder="Player name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addZone(newName)}
          />
          <button
            className="btn btn-secondary btn-small"
            onClick={() => addZone(newName)}
            disabled={!newName.trim()}
          >
            Add zone
          </button>
        </div>
      </div>
    </div>
  )
}
