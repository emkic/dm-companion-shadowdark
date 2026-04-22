import type { LocationState } from '@shared/types'
import './PlayerWatchOrder.css'

interface Props {
  location: LocationState
}

export function PlayerWatchOrder({ location }: Props) {
  if (!location.isCamping || !location.watches) return null

  const hasAnyName = location.watches.some(w => w.name.trim() !== '')
  if (!hasAnyName) return null

  return (
    <div className="player-watch-order">
      <div className="pw-header">Watch Order</div>
      <div className="pw-list">
        {location.watches.map((watch, i) => {
          if (!watch.name.trim()) return null
          return (
            <div key={i} className="pw-slot">
              <span className="pw-number">Watch {i + 1}</span>
              <span className="pw-name">{watch.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
