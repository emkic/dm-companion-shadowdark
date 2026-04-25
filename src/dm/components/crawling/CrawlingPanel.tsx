import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { UseCrawlingReturn } from '../../hooks/useCrawling'
import type { UseRosterReturn } from '../../hooks/useRoster'
import type { DangerLevel, CrawlingTurnSlot, Party } from '@shared/types'
import { DANGER_LABELS, ENCOUNTER_INTERVAL, getEffectiveDanger } from '@shared/constants'
import { PartyRosterSection } from '../roster/PartyRosterSection'
import './CrawlingPanel.css'

interface Props {
  crawlingHook: UseCrawlingReturn
  rosterHook: UseRosterReturn
  dangerLevel: DangerLevel
}

// ── Sortable turn slot (drag-and-drop) ──

function SortableTurnSlot({ id, index, slot, onNameChange, onRemove }: {
  id: string
  index: number
  slot: CrawlingTurnSlot
  onNameChange: (index: number, name: string) => void
  onRemove: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="turn-slot">
      <div className="turn-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        &#x2807;
      </div>
      <span className="turn-number">{index + 1}</span>
      {slot.emoji && <span className="turn-emoji">{slot.emoji}</span>}
      <input
        type="text"
        value={slot.name}
        onChange={e => onNameChange(index, e.target.value)}
        placeholder="Player name..."
        className="form-input turn-name-input"
      />
      <button
        className="btn btn-ghost btn-small turn-remove"
        onClick={() => onRemove(index)}
        title="Remove"
      >
        ✕
      </button>
    </div>
  )
}

// ── Sortable active-crawl turn entry (read-only row, drag handle) ──

function SortableTurnEntry({ id, index, name, emoji, isActive }: {
  id: string
  index: number
  name: string
  emoji?: string
  isActive: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className={`turn-order-entry ${isActive ? 'active-entry' : ''}`}>
      <div className="turn-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        &#x2807;
      </div>
      <span className="turn-order-num">{index + 1}</span>
      {emoji && <span className="turn-emoji">{emoji}</span>}
      <span className="turn-order-name">{name}</span>
      {isActive && <span className="turn-arrow">◀</span>}
    </div>
  )
}

// ── Setup phase: input turn order before starting ──

function CrawlSetup({ onStart, activeParty }: {
  onStart: (turnOrder: CrawlingTurnSlot[]) => void
  activeParty: Party | null
}) {
  const [slots, setSlots] = useState<CrawlingTurnSlot[]>([
    { name: '' }, { name: '' }, { name: '' }, { name: '' }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const slotIds = slots.map((_, i) => `setup-slot-${i}`)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slotIds.indexOf(active.id as string)
    const newIndex = slotIds.indexOf(over.id as string)
    setSlots(arrayMove(slots, oldIndex, newIndex))
  }

  function setName(index: number, name: string) {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, name } : s))
  }

  function addSlot() {
    setSlots(prev => [...prev, { name: '' }])
  }

  function removeSlot(index: number) {
    setSlots(prev => prev.filter((_, i) => i !== index))
  }

  function useParty() {
    if (!activeParty || activeParty.players.length === 0) return
    setSlots(activeParty.players.map(p => ({ name: p.name, emoji: p.emoji || '🛡️' })))
  }

  function handleStart() {
    // Filter out empty names, but allow starting with no names (no turn tracking)
    const filled = slots.filter(s => s.name.trim() !== '')
    onStart(filled)
  }

  const canUseParty = activeParty && activeParty.players.length > 0

  return (
    <div className="crawl-setup">
      <div className="setup-header">
        <label className="field-label">Turn Order (drag to reorder)</label>
        {canUseParty && (
          <button className="btn btn-ghost btn-small" onClick={useParty} title="Replace slots with active party">
            Use Party Roster
          </button>
        )}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slotIds} strategy={verticalListSortingStrategy}>
          {slots.map((slot, i) => (
            <SortableTurnSlot
              key={slotIds[i]}
              id={slotIds[i]}
              index={i}
              slot={slot}
              onNameChange={setName}
              onRemove={removeSlot}
            />
          ))}
        </SortableContext>
      </DndContext>
      <div className="setup-actions">
        <button className="btn btn-ghost btn-small" onClick={addSlot}>+ Add Slot</button>
        <button className="btn btn-primary btn-small" onClick={handleStart}>Start Crawl</button>
      </div>
    </div>
  )
}

// ── Active crawl: turn display + encounter checks ──

export function CrawlingPanel({ crawlingHook, rosterHook, dangerLevel }: Props) {
  const { crawling, startCrawl, endCrawl, nextTurn, prevTurn, toggleTotalDarkness, resolveEncounterCheck, reorderTurns } = crawlingHook
  const effectiveDanger = getEffectiveDanger(dangerLevel, crawling.inTotalDarkness)
  const interval = ENCOUNTER_INTERVAL[effectiveDanger]

  const checksDisabled = !isFinite(interval)
  const roundsUntilCheck = crawling.isActive && !checksDisabled
    ? (crawling.pendingEncounterCheck ? 0 : interval - (crawling.round % interval || interval))
    : 0

  // Active turn tracking
  const currentTurn = crawling.turnOrder.length > 0
    ? crawling.turnOrder[crawling.currentTurnIndex]
    : null

  // Drag-and-drop for reordering turns during a crawl
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const turnIds = crawling.turnOrder.map((_, i) => `turn-${i}`)

  function handleTurnDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = turnIds.indexOf(active.id as string)
    const newIndex = turnIds.indexOf(over.id as string)
    reorderTurns(arrayMove([...crawling.turnOrder], oldIndex, newIndex))
  }

  // Not started — show setup
  if (!crawling.isActive) {
    return (
      <div className="crawling-panel">
        <div className="crawling-header">
          <h2 className="panel-title">Crawling Rounds</h2>
        </div>
        <CrawlSetup onStart={startCrawl} activeParty={rosterHook.activeParty} />
        <PartyRosterSection rosterHook={rosterHook} />
      </div>
    )
  }

  return (
    <div className="crawling-panel">
      <div className="crawling-header">
        <h2 className="panel-title">Crawling Rounds</h2>
        <div className="crawling-header-controls">
          <span className="round-badge">Round {crawling.round}</span>
          <button
            className="btn btn-ghost btn-small"
            onClick={prevTurn}
            disabled={crawling.round <= 1 && crawling.currentTurnIndex === 0 && !crawling.pendingEncounterCheck}
          >
            ← Prev
          </button>
          <button
            className="btn btn-accent btn-small"
            onClick={() => nextTurn(dangerLevel)}
          >
            Next Turn →
          </button>
          <button className="btn btn-ghost btn-small" onClick={endCrawl}>
            End Crawl
          </button>
        </div>
      </div>

      {/* Current turn indicator */}
      {currentTurn && (
        <div className="current-turn-banner">
          <span className="current-turn-label">Current Turn</span>
          {currentTurn.emoji && <span className="current-turn-emoji">{currentTurn.emoji}</span>}
          <span className="current-turn-name">{currentTurn.name}</span>
        </div>
      )}

      {/* Danger & encounter info */}
      <div className="crawling-info-bar">
        <div className="crawling-info-item">
          <span className="info-label">Danger</span>
          <span className={`info-value danger-${effectiveDanger}`}>
            {DANGER_LABELS[effectiveDanger]}
          </span>
        </div>
        <div className="crawling-info-item">
          <span className="info-label">Check every</span>
          <span className="info-value">
            {checksDisabled ? '—' : `${interval} round${interval > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="crawling-info-item">
          <span className="info-label">Next check in</span>
          <span className="info-value">
            {checksDisabled
              ? 'Never'
              : crawling.pendingEncounterCheck ? 'NOW' : `${roundsUntilCheck} round${roundsUntilCheck > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Total darkness toggle */}
      <button
        className={`btn btn-small darkness-toggle ${crawling.inTotalDarkness ? 'btn-danger active' : 'btn-ghost'}`}
        onClick={toggleTotalDarkness}
      >
        {crawling.inTotalDarkness ? '🌑 Total Darkness (Deadly)' : '🌑 Total Darkness'}
      </button>

      {/* Encounter alert — shown after last player in the round */}
      {crawling.pendingEncounterCheck && (
        <div className="encounter-alert">
          <div className="encounter-alert-title">⚠ Random Encounter Check!</div>
          <div className="encounter-alert-body">
            Round {crawling.round} complete — Roll <strong>1d6</strong> — encounter on a <strong>1</strong>
          </div>
          <div className="encounter-alert-actions">
            <button
              className="btn btn-danger btn-small"
              onClick={() => resolveEncounterCheck(true)}
            >
              Encounter!
            </button>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => resolveEncounterCheck(false)}
            >
              No Encounter
            </button>
          </div>
        </div>
      )}

      {/* Reference tables on encounter */}
      {crawling.encounterLog.some(e => e.round === crawling.round && e.encounter) && (
        <div className="encounter-tables">
          <div className="ref-table">
            <div className="ref-table-title">Starting Distance (1d6)</div>
            <div className="ref-table-row"><span className="ref-roll">1</span><span>Close (5 ft)</span></div>
            <div className="ref-table-row"><span className="ref-roll">2–4</span><span>Near (up to 30 ft)</span></div>
            <div className="ref-table-row"><span className="ref-roll">5–6</span><span>Far (within sight)</span></div>
          </div>
          <div className="ref-table">
            <div className="ref-table-title">Activity (2d6)</div>
            <div className="ref-table-row"><span className="ref-roll">2–4</span><span>Hunting</span></div>
            <div className="ref-table-row"><span className="ref-roll">5–6</span><span>Eating</span></div>
            <div className="ref-table-row"><span className="ref-roll">7–8</span><span>Building/nesting</span></div>
            <div className="ref-table-row"><span className="ref-roll">9–10</span><span>Socializing</span></div>
            <div className="ref-table-row"><span className="ref-roll">11</span><span>Guarding</span></div>
            <div className="ref-table-row"><span className="ref-roll">12</span><span>Sleeping</span></div>
          </div>
        </div>
      )}

      {/* Turn order list (reorderable during crawl) */}
      {crawling.turnOrder.length > 0 && (
        <div className="crawling-turn-order">
          <div className="turn-order-label">Turn Order</div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTurnDragEnd}>
            <SortableContext items={turnIds} strategy={verticalListSortingStrategy}>
              {crawling.turnOrder.map((slot, i) => (
                <SortableTurnEntry
                  key={turnIds[i]}
                  id={turnIds[i]}
                  index={i}
                  name={slot.name}
                  emoji={slot.emoji}
                  isActive={i === crawling.currentTurnIndex}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Round log */}
      {crawling.encounterLog.length > 0 && (
        <div className="crawling-log">
          <div className="log-label">Round Log</div>
          <div className="log-entries">
            {[...crawling.encounterLog].reverse().map(entry => (
              <div
                key={entry.round}
                className={`log-entry ${entry.encounter ? 'log-encounter' : ''} ${entry.checked ? 'log-checked' : ''}`}
              >
                <span className="log-round">R{entry.round}</span>
                {entry.checked && (
                  <span className={`log-result ${entry.encounter ? 'encounter' : 'clear'}`}>
                    {entry.encounter ? '⚔ Encounter' : '✓ Clear'}
                  </span>
                )}
                {!entry.checked && (
                  <span className="log-result no-check">—</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <PartyRosterSection rosterHook={rosterHook} />
    </div>
  )
}
