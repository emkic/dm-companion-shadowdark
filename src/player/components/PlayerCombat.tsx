import React from 'react'
import { getHealthEstimate, HEALTH_ESTIMATE_COLORS } from '@shared/healthEstimate'
import type { CombatState, Combatant } from '@shared/types'
import './PlayerCombat.css'

interface Props {
  combat: CombatState
}

function CombatantEntry({ combatant: c, isCurrentTurn }: { combatant: Combatant, isCurrentTurn: boolean }) {
  const estimate = getHealthEstimate(c.currentHP, c.maxHP)
  const color = HEALTH_ESTIMATE_COLORS[estimate]
  const displayEmoji = c.emoji || (c.type === 'player' ? '🛡️' : '💀')

  return (
    <div className={`player-combatant ${isCurrentTurn ? 'active-turn' : ''} ${c.isDying ? 'is-dying' : ''} ${c.isDead ? 'is-dead' : ''}`}>
      <span className="pc-emoji">{displayEmoji}</span>
      <div className="pc-name">{c.name}</div>
      <div className="pc-estimate" style={{ color: c.isDead ? '#aa6666' : color }}>
        {c.isDead ? 'Dead' : estimate}
      </div>
    </div>
  )
}

export function PlayerCombat({ combat }: Props) {
  if (!combat.isActive || combat.combatants.length === 0) return null

  const visible = combat.combatants.filter(c => c.type === 'player' || !c.isDead)

  return (
    <div className="player-combat">
      <div className="pc-header">
        <span className="pc-round">Round {combat.round}</span>
      </div>
      <div className="pc-list">
        {visible.map(c => (
          <CombatantEntry
            key={c.id}
            combatant={c}
            isCurrentTurn={combat.isActive && combat.combatants[combat.currentTurnIndex]?.id === c.id}
          />
        ))}
      </div>
    </div>
  )
}
