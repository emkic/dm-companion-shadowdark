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
import type { UseCombatReturn } from '../../hooks/useCombat'
import type { UseRosterReturn } from '../../hooks/useRoster'
import type { Combatant, RosterPlayer } from '@shared/types'
import './CombatPanel.css'

const ROSTER_EMOJI_OPTIONS = [
  '⚔️', '🛡️', '🗡️', '🏹', '🔮', '🪄', '🧙', '🧝',
  '🐉', '💀', '🔥', '❄️', '⚡', '🌿', '💎', '🪓',
  '🗝️', '👑', '🎭', '🦴', '🐻', '🦅', '🐺', '👹'
]

function RosterPlayerRow({ player, updateRosterPlayer, removeFromRoster }: {
  player: RosterPlayer
  updateRosterPlayer: UseRosterReturn['updateRosterPlayer']
  removeFromRoster: UseRosterReturn['removeFromRoster']
}) {
  const [showEmoji, setShowEmoji] = useState(false)

  return (
    <div className="roster-row">
      <span
        className="roster-emoji roster-emoji-clickable"
        onClick={() => setShowEmoji(p => !p)}
        title="Change icon"
      >
        {player.emoji || '🛡️'}
      </span>
      <input
        type="text"
        value={player.name}
        onChange={e => updateRosterPlayer(player.id, { name: e.target.value })}
        className="form-input roster-name-input"
      />
      <input
        type="number"
        value={player.maxHP}
        min={1}
        onChange={e => updateRosterPlayer(player.id, { maxHP: parseInt(e.target.value) || 1 })}
        className="form-input roster-hp-input"
        title="Max HP"
      />
      <button
        className="btn btn-danger btn-tiny"
        onClick={() => removeFromRoster(player.id)}
        title="Remove from roster"
      >
        ✕
      </button>
      {showEmoji && (
        <div className="roster-emoji-picker">
          {ROSTER_EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              className="emoji-btn"
              onClick={() => { updateRosterPlayer(player.id, { emoji: e }); setShowEmoji(false) }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

type Props = UseCombatReturn & { rosterHook: UseRosterReturn }

export function CombatPanel(props: Props) {
  const { combat, addCombatant, sortByInitiative, reorderCombatants, nextTurn, prevTurn, startCombat, endCombat, rosterHook } = props
  const { parties, activePartyId, activeParty, setActivePartyId, addParty, renameParty, deleteParty, addToRoster, removeFromRoster, updateRosterPlayer } = rosterHook

  const [newName, setNewName] = useState('')
  const [newMaxHP, setNewMaxHP] = useState('10')
  const [newInitiative, setNewInitiative] = useState('0')
  const [newType, setNewType] = useState<'player' | 'monster'>('monster')
  const [showRoster, setShowRoster] = useState(false)
  const [rosterName, setRosterName] = useState('')
  const [rosterHP, setRosterHP] = useState('10')
  const [newPartyName, setNewPartyName] = useState('')
  const [editingPartyName, setEditingPartyName] = useState(false)

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
            {activeCombatants.map((c, idx) => (
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

      <div className="roster-section">
        <div className="roster-header">
          <button
            className="btn btn-ghost btn-small"
            onClick={() => setShowRoster(p => !p)}
          >
            {showRoster ? '▾' : '▸'} Party Roster
          </button>
          {activeParty && activeParty.players.length > 0 && (
            <button
              className="btn btn-primary btn-small"
              onClick={() => {
                activeParty.players.forEach(p => {
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
            >
              Add Party to Combat
            </button>
          )}
        </div>

        {showRoster && (
          <div className="roster-content">
            <div className="party-tabs">
              {parties.map(p => (
                <button
                  key={p.id}
                  className={`party-tab ${p.id === activePartyId ? 'party-tab-active' : ''}`}
                  onClick={() => setActivePartyId(p.id)}
                >
                  {editingPartyName && p.id === activePartyId ? (
                    <input
                      type="text"
                      defaultValue={p.name}
                      onBlur={e => { renameParty(p.id, e.target.value || p.name); setEditingPartyName(false) }}
                      onKeyDown={e => { if (e.key === 'Enter') { renameParty(p.id, (e.target as HTMLInputElement).value || p.name); setEditingPartyName(false) } }}
                      className="party-tab-rename"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span onDoubleClick={e => { e.stopPropagation(); setEditingPartyName(true) }}>
                      {p.name} ({p.players.length})
                    </span>
                  )}
                  {p.id === activePartyId && parties.length > 1 && !editingPartyName && (
                    <span
                      className="party-tab-delete"
                      onClick={e => { e.stopPropagation(); deleteParty(p.id) }}
                      title="Delete party"
                    >
                      ✕
                    </span>
                  )}
                </button>
              ))}
              <form className="party-tab-add" onSubmit={e => {
                e.preventDefault()
                if (!newPartyName.trim()) return
                addParty(newPartyName.trim())
                setNewPartyName('')
              }}>
                <input
                  type="text"
                  placeholder="New party..."
                  value={newPartyName}
                  onChange={e => setNewPartyName(e.target.value)}
                  className="party-tab-add-input"
                />
                <button type="submit" className="party-tab party-tab-new" disabled={!newPartyName.trim()}>+</button>
              </form>
            </div>

            {activeParty && (
              <>
                {activeParty.players.map(p => (
                  <RosterPlayerRow
                    key={p.id}
                    player={p}
                    updateRosterPlayer={updateRosterPlayer}
                    removeFromRoster={removeFromRoster}
                  />
                ))}
                {activeParty.players.length === 0 && (
                  <div className="empty-list">No players in this party. Add some below.</div>
                )}
                <form className="roster-add-form" onSubmit={e => {
                  e.preventDefault()
                  const hp = parseInt(rosterHP) || 10
                  if (!rosterName.trim()) return
                  addToRoster({ name: rosterName.trim(), maxHP: hp, emoji: '' })
                  setRosterName('')
                  setRosterHP('10')
                }}>
                  <input
                    type="text"
                    placeholder="Player name"
                    value={rosterName}
                    onChange={e => setRosterName(e.target.value)}
                    className="form-input name-input"
                  />
                  <div className="labeled-input">
                    <label className="input-label">HP</label>
                    <input
                      type="number"
                      value={rosterHP}
                      onChange={e => setRosterHP(e.target.value)}
                      className="form-input hp-input"
                      min="1"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-small">+ Save</button>
                </form>
              </>
            )}

            {!activeParty && parties.length === 0 && (
              <div className="empty-list">Create a party to get started.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
