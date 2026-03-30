import React from 'react'
import type { TravelState } from '@shared/types'
import './PlayerTravel.css'

interface Props {
  travel: TravelState
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

const METHOD_LABELS: Record<string, string> = {
  walking: 'Walking',
  mounted: 'Mounted',
  sailing: 'Sailing'
}

export function PlayerTravel({ travel }: Props) {
  if (!travel.showToPlayer) return null

  return (
    <div className="player-travel">
      <div className="travel-bar">
        <div className="travel-info-left">
          <span className="travel-date">{formatDate(travel.date)}</span>
          <span className="travel-meta">
            {travel.weather}
            {travel.mode === 'wilderness' && (
              <> · {METHOD_LABELS[travel.travelMethod]}</>
            )}
            {travel.mode === 'city' && <> · Resting in Town</>}
          </span>
        </div>
      </div>
    </div>
  )
}
