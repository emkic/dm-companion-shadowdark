import { useState, useEffect } from 'react'
import type { AppState, TableLayout } from '@shared/types'
import { PlayerZone } from './components/PlayerZone'
import { DmZone } from './components/DmZone'

const DEFAULT_LAYOUT: TableLayout = {
  zones: [],
  dmZone: null,
  dmZoneActive: false,
  showName: true,
  showHealth: true,
  torchbearerName: null,
}

export default function App() {
  const [state, setState] = useState<AppState | null>(null)
  const [layout, setLayout] = useState<TableLayout>(DEFAULT_LAYOUT)

  useEffect(() => {
    window.overlayAPI.loadLayout().then(setLayout)
    const unsubState = window.overlayAPI.onStateUpdate(setState)
    const unsubLayout = window.overlayAPI.onLayoutUpdate(setLayout)
    return () => {
      unsubState()
      unsubLayout()
    }
  }, [])

  if (!state) return null

  const { combat, crawling } = state
  const showDm = layout.dmZone && layout.dmZoneActive

  if (layout.zones.length === 0 && !showDm) return null

  return (
    <div className="overlay-root">
      {showDm && (
        <DmZone x={layout.dmZone!.x} y={layout.dmZone!.y} />
      )}
      {layout.zones.map(zone => {
        const nameLower = zone.name.toLowerCase()

        const combatant = combat.isActive
          ? combat.combatants.find(c => c.name.toLowerCase() === nameLower && c.type === 'player') ?? null
          : null

        let isCurrentTurn = false
        let isNextTurn = false

        if (combat.isActive && combat.combatants.length > 0) {
          isCurrentTurn = combat.combatants[combat.currentTurnIndex]?.name.toLowerCase() === nameLower
          if (combat.combatants.length > 1) {
            const nextIdx = (combat.currentTurnIndex + 1) % combat.combatants.length
            isNextTurn = !isCurrentTurn && combat.combatants[nextIdx]?.name.toLowerCase() === nameLower
          }
        } else if (crawling.isActive && crawling.turnOrder.length > 0) {
          isCurrentTurn = crawling.turnOrder[crawling.currentTurnIndex]?.name.toLowerCase() === nameLower
          if (crawling.turnOrder.length > 1) {
            const nextIdx = (crawling.currentTurnIndex + 1) % crawling.turnOrder.length
            isNextTurn = !isCurrentTurn && crawling.turnOrder[nextIdx]?.name.toLowerCase() === nameLower
          }
        }

        return (
          <PlayerZone
            key={zone.id}
            zone={zone}
            combatant={combatant}
            isCurrentTurn={isCurrentTurn}
            isNextTurn={isNextTurn}
            combatActive={combat.isActive}
            showName={layout.showName}
            showHealth={layout.showHealth}
            isTorchbearer={!!(layout.torchbearerName && layout.torchbearerName.toLowerCase() === nameLower)}
          />
        )
      })}
    </div>
  )
}
