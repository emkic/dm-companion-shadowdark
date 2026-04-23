import React, { useState } from 'react'
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
  arrayMove
} from '@dnd-kit/sortable'
import { CombatantRow } from './CombatantRow'
import { PartyRosterSection } from '../roster/PartyRosterSection'
import type { UseCombatReturn } from '../../hooks/useCombat'
import type { UseRosterReturn } from '../../hooks/useRoster'
import './CombatPanel.css'

type Props = UseCombatReturn & { rosterHook: UseRosterReturn }

export function CombatPanel(props: Props) {
  const { combat, addCombatant, sortByInitiative, reorderCombatants, nextTurn, prevTurn, startCombat, endCombat, rosterHook } = props

  const [newName, setNewName] = useState('')
  const [newMaxHP, setNewMaxHP] = useState('10')
  const [newInitiative, setNewInitiative] = useState('0')
  const [newType, setNewType] = useState<'player' | 'monster'>('monster')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = combat.combatants.findIndex(c => c.id === active.id)
    const newIndex = combat.combatants.findIndex(c => c.id === over.id)
    reorderCombatants(arrayMove(combat.combatants, oldIndex, newIndex))
  }

  function handleAddCombatant(e: React.FormEvent) {
    e.preventDefault()
    const hp = parseInt(newMaxHP) || 1
    addCombatant({
      name: newName || (newType === 'monster' ? 'Monster' : 'Player'),
      emoji: '',
      maxHP: hp,
      currentHP: hp,
      initiative: parseInt(newInitiative) || 0,
      type: newType
    })
    setNewName('')
    setNewMaxHP('10')
    setNewInitiative('0')
  }

  const activeCombatants = combat.combatants.filter(c => !c.isDead)
  const deadCombatants = combat.combatants.filter(c => c.isDead)

  return (
    <div className="combat-panel">
      <div className="combat-header">
        <h2 className="panel-title">Combat Tracker</h2>
        <div className="combat-header-controls">
          {combat.isActive && (
            <span className="round-badge">Round {combat.round}</span>
          )}
          {!combat.isActive ? (
            <button className="btn btn-primary btn-small" onClick={startCombat}>
              Start Combat
            </button>
          ) : (
            <>
              <button className="btn btn-ghost btn-small" onClick={prevTurn}>
                ← Prev
              </button>
              <button className="btn btn-accent btn-small" onClick={nextTurn}>
                Next Turn →
              </button>
              <button className="btn btn-ghost btn-small" onClick={endCombat}>
                End Combat
              </button>
            </>
          )}
          <button className="btn btn-ghost btn-small" onClick={sortByInitiative} title="Sort by initiative">
            ⬆ Init
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activeCombatants.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="combatants-list">
            {activeCombatants.map(c => (
              <CombatantRow
                key={c.id}
                combatant={c}
                isCurrentTurn={combat.isActive && combat.currentTurnIndex === combat.combatants.indexOf(c)}
                {...props}
              />
            ))}
            {activeCombatants.length === 0 && (
              <div className="empty-list">No combatants. Add some below.</div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {deadCombatants.length > 0 && (
        <div className="dead-section">
          <div className="dead-label">Slain</div>
          {deadCombatants.map(c => (
            <CombatantRow
              key={c.id}
              combatant={c}
              isCurrentTurn={false}
              {...props}
            />
          ))}
        </div>
      )}

      <form className="add-combatant-form" onSubmit={handleAddCombatant}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="form-input name-input"
          />
          <div className="labeled-input">
            <label className="input-label">HP</label>
            <input
              type="number"
              value={newMaxHP}
              onChange={e => setNewMaxHP(e.target.value)}
              className="form-input hp-input"
              min="1"
            />
          </div>
          <div className="labeled-input">
            <label className="input-label">Init</label>
            <input
              type="number"
              value={newInitiative}
              onChange={e => setNewInitiative(e.target.value)}
              className="form-input init-input"
            />
          </div>
          <select
            value={newType}
            onChange={e => setNewType(e.target.value as 'player' | 'monster')}
            className="form-select"
          >
            <option value="monster">Monster</option>
            <option value="player">Player</option>
          </select>
          <button type="submit" className="btn btn-primary btn-small">+ Add</button>
        </div>
      </form>

      <PartyRosterSection
        rosterHook={rosterHook}
        actionLabel="Add Party to Combat"
        onAction={party => {
          party.players.forEach(p => {
            addCombatant({
              name: p.name,
              emoji: p.emoji,
              maxHP: p.maxHP,
              currentHP: p.maxHP,
              initiative: 0,
              type: 'player'
            })
          })
        }}
      />
    </div>
  )
}
