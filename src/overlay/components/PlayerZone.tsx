import { getHealthEstimate, HEALTH_ESTIMATE_COLORS } from '@shared/healthEstimate'
import type { TableZone, Combatant } from '@shared/types'

interface Props {
  zone: TableZone
  combatant: Combatant | null
  isCurrentTurn: boolean
  isNextTurn: boolean
  combatActive: boolean
  showName: boolean
  showHealth: boolean
  isTorchbearer: boolean
}

function deathCountdownLabel(c: Combatant): string | null {
  if (!c.isDying || c.isDead) return null
  if (c.awaitingDeathTimer) return 'Roll d4'
  const roundsLeft = c.deathTimer - c.deathRoundsElapsed
  return `${roundsLeft} round${roundsLeft === 1 ? '' : 's'} left`
}

export function PlayerZone({ zone, combatant, isCurrentTurn, isNextTurn, combatActive, showName, showHealth, isTorchbearer }: Props) {
  const estimate = combatant ? getHealthEstimate(combatant.currentHP, combatant.maxHP) : null
  const estimateColor = estimate ? HEALTH_ESTIMATE_COLORS[estimate] : undefined
  const deathLabel = combatant ? deathCountdownLabel(combatant) : null

  return (
    <div
      className={[
        'player-zone',
        isCurrentTurn ? 'player-zone--active' : '',
        isNextTurn ? 'player-zone--next' : '',
        zone.mirrored ? 'player-zone--mirrored' : ''
      ].filter(Boolean).join(' ')}
      style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
    >
      {isTorchbearer && (
        <div className="zone-torch-mini-wrap">
          <div className="zone-torch-mini" />
        </div>
      )}
      {showName && <div className="player-zone__name">{zone.name}</div>}
      {showHealth && combatActive && estimate && (
        <div className="player-zone__health" style={{ color: estimateColor }}>
          {estimate}
        </div>
      )}
      {showHealth && combatActive && deathLabel && (
        <div className="player-zone__death">{deathLabel}</div>
      )}
    </div>
  )
}
