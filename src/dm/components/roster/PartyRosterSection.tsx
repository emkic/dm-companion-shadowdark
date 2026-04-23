import { useState } from 'react'
import type { UseRosterReturn } from '../../hooks/useRoster'
import type { Party, RosterPlayer } from '@shared/types'
import './PartyRosterSection.css'

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

interface Props {
  rosterHook: UseRosterReturn
  actionLabel?: string
  onAction?: (party: Party) => void
  defaultOpen?: boolean
}

export function PartyRosterSection({ rosterHook, actionLabel, onAction, defaultOpen = false }: Props) {
  const { parties, activePartyId, activeParty, setActivePartyId, addParty, renameParty, deleteParty, addToRoster, removeFromRoster, updateRosterPlayer } = rosterHook

  const [showRoster, setShowRoster] = useState(defaultOpen)
  const [rosterName, setRosterName] = useState('')
  const [rosterHP, setRosterHP] = useState('10')
  const [newPartyName, setNewPartyName] = useState('')
  const [editingPartyName, setEditingPartyName] = useState(false)

  const canAction = actionLabel && onAction && activeParty && activeParty.players.length > 0

  return (
    <div className="roster-section">
      <div className="roster-header">
        <button
          className="btn btn-ghost btn-small"
          onClick={() => setShowRoster(p => !p)}
        >
          {showRoster ? '▾' : '▸'} Party Roster
          {activeParty && !showRoster && ` (${activeParty.players.length})`}
        </button>
        {canAction && (
          <button
            className="btn btn-primary btn-small"
            onClick={() => onAction!(activeParty!)}
          >
            {actionLabel}
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
  )
}
