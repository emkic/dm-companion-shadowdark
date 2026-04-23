import type { CrawlingState } from '@shared/types'
import './PlayerCrawling.css'

interface Props {
  crawling: CrawlingState
  combatIsActive: boolean
}

export function PlayerCrawling({ crawling, combatIsActive }: Props) {
  if (!crawling.isActive) return null

  const currentName = crawling.turnOrder.length > 0
    ? crawling.turnOrder[crawling.currentTurnIndex]?.name
    : null

  return (
    <>
      {/* Encounter flash overlay */}
      {crawling.encounterFlash && (
        <div className="encounter-flash-overlay">
          <div className="encounter-flash-vignette" />
          <div className="encounter-flash-text">
            <p className="encounter-flash-line encounter-flash-line-1">Encounter!</p>
            <p className="encounter-flash-line encounter-flash-line-2">Something crawls from the Shadowdark...</p>
          </div>
        </div>
      )}

      {/* Turn order display — hidden during combat */}
      {crawling.turnOrder.length > 0 && !combatIsActive && (
        <div className="player-crawling">
          <div className="pcr-header">
            <span className="pcr-round">Round {crawling.round}</span>
          </div>
          <div className="pcr-list">
            {crawling.turnOrder.map((slot, i) => (
              <div
                key={i}
                className={`pcr-slot ${i === crawling.currentTurnIndex ? 'pcr-active' : ''}`}
              >
                <span className="pcr-number">{i + 1}</span>
                {slot.emoji && <span className="pcr-emoji">{slot.emoji}</span>}
                <span className="pcr-name">{slot.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
