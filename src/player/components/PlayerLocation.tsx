import React from 'react'
import type { LocationState } from '@shared/types'
import './PlayerLocation.css'

const DANGER_LABELS: Record<string, string> = {
  unsafe: 'Unsafe',
  risky: 'Risky',
  deadly: 'Deadly'
}

interface Props {
  location: LocationState
}

export function PlayerLocation({ location }: Props) {
  if (!location.showToPlayer) return null

  return (
    <div className="player-location">
      <div className="location-bar">
        <div className="location-left">
          {location.name && (
            <span className="location-name">{location.name}</span>
          )}
          <span className="location-meta">
            {location.season.charAt(0).toUpperCase() + location.season.slice(1)}
            {location.weather && <> · {location.weather}</>}
          </span>
        </div>
        <div className="location-right">
          <span className={`danger-badge danger-${location.dangerLevel}`}>
            {DANGER_LABELS[location.dangerLevel]}
          </span>
        </div>
      </div>
    </div>
  )
}
