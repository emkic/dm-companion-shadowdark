import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getHealthEstimate, HEALTH_ESTIMATE_COLORS } from '@shared/healthEstimate'
import type { Combatant } from '@shared/types'
import type { UseCombatReturn } from '../../hooks/useCombat'
import './CombatantRow.css'

const EMOJI_OPTIONS = [
  '⚔️', '🛡️', '🗡️', '🏹', '🔮', '🪄', '💀', '🐉', '🧙', '🧝',
  '🧛', '🐺', '👹', '🦇', '🕷️', '🐍', '🧟', '👻', '🔥', '❄️',
  '⚡', '🌿', '💎', '🪓', '🗝️', '👑', '🎭', '🦴', '🐻', '🦅'
]

interface Props {
  combatant: Combatant
  isCurrentTurn: boolean
  updateHP: UseCombatReturn['updateHP']
  setHP: UseCombatReturn['setHP']
  setInitiative: UseCombatReturn['setInitiative']
  removeCombatant: UseCombatReturn['removeCombatant']
  setDeathTimer: UseCombatReturn['setDeathTimer']
  rollDeathSave: UseCombatReturn['rollDeathSave']
  setEmoji: UseCombatReturn['setEmoji']
  reviveCombatant: UseCombatReturn['reviveCombatant']
  duplicateCombatant: UseCombatReturn['duplicateCombatant']
}

export function CombatantRow({
  combatant: c,
  isCurrentTurn,
  updateHP,
  setHP,
  setInitiative,
  removeCombatant,
  setDeathTimer,
  rollDeathSave,
  setEmoji,
  reviveCombatant,
  duplicateCombatant
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id, disabled: c.isDead })
  const [editingHP, setEditingHP] = useState(false)
  const [hpInput, setHpInput] = useState(String(c.currentHP))
  const [deathRollInput, setDeathRollInput] = useState('')
  const [deathTimerInput, setDeathTimerInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [reviveHP, setReviveHP] = useState('1')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const estimate = getHealthEstimate(c.currentHP, c.maxHP)
  const estimateColor = HEALTH_ESTIMATE_COLORS[estimate]

  function handleHPCommit() {
    const val = parseInt(hpInput)
    if (!isNaN(val)) setHP(c.id, val)
    setEditingHP(false)
  }

  function handleDeathSave() {
    const roll = parseInt(deathRollInput)
    if (!isNaN(roll) && roll >= 1 && roll <= 20) {
      rollDeathSave(c.id, roll)
      setDeathRollInput('')
    }
  }

  function handleRevive() {
    const hp = parseInt(reviveHP)
    if (!isNaN(hp) && hp >= 1) {
      reviveCombatant(c.id, hp)
      setReviveHP('1')
    }
  }

  const rowClass = [
    'combatant-row',
    isCurrentTurn ? 'current-turn' : '',
    c.isDying ? 'dying' : '',
    c.isDead ? 'dead' : '',
    isDragging ? 'dragging' : ''
  ].filter(Boolean).join(' ')

  return (
    <div ref={setNodeRef} style={style} className={rowClass}>
      <div className="row-main">
        {!c.isDead && (
          <div className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
            &#x2807;
          </div>
        )}

        <div
          className="combatant-emoji"
          onClick={() => setShowEmojiPicker(p => !p)}
          title="Pick emoji"
        >
          {c.emoji || (c.type === 'player' ? '🛡️' : '💀')}
        </div>

        <div className="combatant-name">{c.name}</div>

        <div className="initiative-cell">
          <input
            type="number"
            value={c.initiative}
            onChange={e => setInitiative(c.id, parseInt(e.target.value) || 0)}
            className="initiative-input"
            title="Initiative"
          />
        </div>

        <div className="hp-cell">
          <div className="hp-buttons">
            <button className="btn-tiny" onClick={() => updateHP(c.id, 1)} title="+1 HP">+</button>
            <button className="btn-tiny" onClick={() => updateHP(c.id, -1)} title="-1 HP">-</button>
          </div>
          {editingHP ? (
            <input
              type="number"
              value={hpInput}
              min={0}
              max={c.maxHP}
              onChange={e => setHpInput(e.target.value)}
              onBlur={handleHPCommit}
              onKeyDown={e => e.key === 'Enter' && handleHPCommit()}
              className="hp-edit-input"
              autoFocus
            />
          ) : (
            <span
              className="hp-display"
              onClick={() => { setHpInput(String(c.currentHP)); setEditingHP(true) }}
              title="Click to edit HP"
            >
              {c.currentHP}/{c.maxHP}
            </span>
          )}
        </div>

        <div className="estimate-badge" style={{ color: estimateColor, borderColor: estimateColor }}>
          {c.isDead ? 'Dead' : estimate}
        </div>

        {!c.isDead && (
          <>
            <button
              className="btn btn-ghost btn-tiny"
              onClick={() => duplicateCombatant(c.id)}
              title="Duplicate"
            >
              &#x2398;
            </button>
            <button
              className="btn btn-danger btn-tiny"
              onClick={() => removeCombatant(c.id)}
              title="Remove"
            >
              &#x2715;
            </button>
          </>
        )}

        {c.isDead && (
          <div className="revive-row">
            <input
              type="number"
              min={1}
              max={c.maxHP}
              value={reviveHP}
              onChange={e => setReviveHP(e.target.value)}
              className="revive-input"
              placeholder="HP"
            />
            <button className="btn btn-small btn-primary" onClick={handleRevive} title="Revive">
              Revive
            </button>
          </div>
        )}
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              className="emoji-btn"
              onClick={() => { setEmoji(c.id, e); setShowEmojiPicker(false) }}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {c.awaitingDeathTimer && (
        <div className="death-timer-prompt">
          <span className="death-prompt-text">{c.name} is dying! Rounds until dead (1d4 + CON):</span>
          <div className="death-roll-row">
            <input
              type="number"
              min={1}
              placeholder="Rounds"
              value={deathTimerInput}
              onChange={e => setDeathTimerInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = parseInt(deathTimerInput)
                  if (!isNaN(val) && val >= 1) {
                    setDeathTimer(c.id, val)
                    setDeathTimerInput('')
                  }
                }
              }}
              className="death-roll-input"
              autoFocus
            />
            <button
              className="btn btn-small btn-danger"
              onClick={() => {
                const val = parseInt(deathTimerInput)
                if (!isNaN(val) && val >= 1) {
                  setDeathTimer(c.id, val)
                  setDeathTimerInput('')
                }
              }}
            >
              Set
            </button>
          </div>
        </div>
      )}

      {c.isDying && !c.awaitingDeathTimer && !c.isDead && (
        <div className="death-save-prompt">
          <div className="death-timer-info">
            Round {c.deathRoundsElapsed}/{c.deathTimer} — dies after round {c.deathTimer}
          </div>
          <span className="death-prompt-text">Death save (natural 20 = arise at 1 HP):</span>
          <div className="death-roll-row">
            <input
              type="number"
              min={1}
              max={20}
              placeholder="d20"
              value={deathRollInput}
              onChange={e => setDeathRollInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeathSave()}
              className="death-roll-input"
            />
            <button className="btn btn-small btn-primary" onClick={handleDeathSave}>
              Roll
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
