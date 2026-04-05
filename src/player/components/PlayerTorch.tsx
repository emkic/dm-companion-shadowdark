import React from 'react'
import type { TorchState, TimerState } from '@shared/types'
import { DEFAULT_TORCH_SECONDS, LOW_TORCH_THRESHOLD } from '@shared/constants'
import './PlayerTorch.css'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface Props {
  torch: TorchState
  hasCampfire?: boolean
  isCamping?: boolean
}

function PlayerTimerItem({ timer }: { timer: TimerState }) {
  const fraction = DEFAULT_TORCH_SECONDS > 0 ? timer.timeLeft / DEFAULT_TORCH_SECONDS : 0
  const lowAlert = fraction < LOW_TORCH_THRESHOLD
  const dimLevel = Math.max(0, Math.min(1, fraction))
  const brightness = 0.2 + dimLevel * 0.8
  const isMagical = timer.lightMode === 'magical'

  return (
    <div className={`player-torch-item ${lowAlert ? 'low' : ''} ${!timer.isRunning ? 'paused' : ''} ${isMagical ? 'magical' : ''}`}>
      {isMagical ? (
        <div className="sprite-magical-wrap">
          <div className={`sprite-magical-glow ${lowAlert ? 'dim' : ''}`} />
          <div
            className={`sprite-fire sprite-magical ${!timer.isRunning ? 'paused' : ''} ${lowAlert ? 'dim' : ''}`}
            style={{ filter: `hue-rotate(180deg) brightness(${brightness * 1.3}) saturate(1.4) drop-shadow(0 0 16px rgba(140, 180, 255, ${brightness * 0.5}))` }}
          />
        </div>
      ) : (
        <div className="sprite-torch-wrap">
          <div className={`sprite-torch-glow ${lowAlert ? 'dim' : ''}`} />
          <div
            className={`sprite-fire sprite-torch ${!timer.isRunning ? 'paused' : ''} ${lowAlert ? 'dim' : ''}`}
            style={{ filter: `brightness(${brightness})` }}
          />
        </div>
      )}
      {!timer.hideTimerFromPlayer && (
        <>
          <div className={`torch-countdown ${isMagical ? 'countdown-magical' : ''} ${lowAlert ? 'countdown-low' : ''}`}>
            {formatTime(timer.timeLeft)}
          </div>
          {!timer.isRunning && timer.timeLeft > 0 && (
            <div className="torch-paused-label">PAUSED</div>
          )}
          {timer.timeLeft === 0 && (
            <div className="torch-out-label">OUT</div>
          )}
        </>
      )}
      {timer.label && (
        <div className={`timer-label ${isMagical ? 'timer-label-magical' : ''}`}>{timer.label}</div>
      )}
    </div>
  )
}

export function PlayerTorch({ torch, hasCampfire, isCamping }: Props) {
  const timers = torch.timers ?? []
  const nonNaturalTimers = timers.filter(t => t.lightMode !== 'natural')
  const allExtinguished = nonNaturalTimers.length > 0 && nonNaturalTimers.every(t => t.isExtinguished)
  const visibleTimers = nonNaturalTimers.filter(t => !t.isExtinguished)

  // Camping with no campfire — show dark camp text
  if (isCamping && !hasCampfire) {
    return (
      <div className="player-torches">
        <div className="player-torch-item">
          <div className="camp-dark-text">
            <p>The camp is dark.</p>
          </div>
        </div>
      </div>
    )
  }

  // Camping with campfire — show campfire only
  if (isCamping && hasCampfire) {
    return (
      <div className="player-torches">
        <div className="player-torch-item">
          <div className="campfire-lit-text">Campfire is lit!</div>
          <div className="sprite-campfire-wrap">
            <div className="sprite-fire sprite-campfire" />
            <div className="sprite-campfire-glow" />
          </div>
        </div>
      </div>
    )
  }

  // All torches extinguished — darkness overlay
  if (allExtinguished) {
    return (
      <div className="darkness-overlay">
        <div className="darkness-vignette" />
        <div className="darkness-text">
          <p className="darkness-line darkness-line-1">There is no light.</p>
          <p className="darkness-line darkness-line-2">You do not see anything.</p>
          <p className="darkness-line darkness-line-3">The living darkness closes in on you.</p>
        </div>
      </div>
    )
  }

  // No visible timers (all natural or none)
  if (visibleTimers.length === 0) return null

  return (
    <div className="player-torches">
      {visibleTimers.map(timer => (
        <PlayerTimerItem key={timer.id} timer={timer} />
      ))}
    </div>
  )
}
