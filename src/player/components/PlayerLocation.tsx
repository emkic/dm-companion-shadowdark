import React from 'react'
import type { LocationState } from '@shared/types'
import { ACTIVITY_LABELS } from '@shared/types'
import './PlayerLocation.css'

const DANGER_LABELS: Record<string, string> = {
  unsafe: 'Unsafe',
  risky: 'Risky',
  deadly: 'Deadly'
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
            {location.activity && <> · {ACTIVITY_LABELS[location.activity]}</>}
          </span>
        </div>
        <div className="location-right">
          {location.showDate && location.date && (
            <span className="location-date">{formatDate(location.date)}</span>
          )}
          <span className={`danger-badge danger-${location.dangerLevel}`}>
            {DANGER_LABELS[location.dangerLevel]}
          </span>
        </div>
      </div>
    </div>
  )
}
