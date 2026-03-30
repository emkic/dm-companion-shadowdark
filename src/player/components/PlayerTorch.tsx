import React from 'react'
import type { TorchState } from '@shared/types'
import { DEFAULT_TORCH_SECONDS, LOW_TORCH_THRESHOLD } from '@shared/constants'
import './PlayerTorch.css'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface Props {
  torch: TorchState
}

export function PlayerTorch({ torch }: Props) {
  const fraction = DEFAULT_TORCH_SECONDS > 0 ? torch.timeLeft / DEFAULT_TORCH_SECONDS : 0
  const lowAlert = fraction < LOW_TORCH_THRESHOLD
  const critical = torch.timeLeft <= 60

  const dimLevel = Math.max(0, Math.min(1, fraction))
  const brightness = 0.2 + dimLevel * 0.8

  if (torch.lightMode === 'natural') {
    return null
  }

  if (torch.isExtinguished) {
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

  const isMagical = torch.lightMode === 'magical'

  return (
    <div className={`player-torch ${lowAlert ? 'low' : ''} ${critical ? 'critical' : ''} ${!torch.isRunning ? 'paused' : ''} ${isMagical ? 'magical' : ''}`}>
      {isMagical ? (
        <div className="crystal-wrap" style={{ filter: `brightness(${brightness})` }}>
          <div className={`crystal-ball ${torch.isRunning ? 'active' : ''} ${lowAlert ? 'dim-crystal' : ''}`}>
            <div className="crystal-glow" />
            <div className="crystal-core" />
            <div className="crystal-highlight" />
          </div>
          <div className="crystal-base" />
        </div>
      ) : (
        <div className="torch-flame-wrap">
          <div
            className={`torch-flame ${torch.isRunning ? 'burning' : ''} ${lowAlert ? 'dim-flame' : ''}`}
            style={{ filter: `brightness(${brightness})` }}
          >
            <div className="flame-layer flame-outer" />
            <div className="flame-layer flame-mid" />
            <div className="flame-layer flame-inner" />
            <div className="torch-body" />
          </div>
        </div>
      )}
      <div className={`torch-countdown ${isMagical ? 'countdown-magical' : ''} ${lowAlert ? 'countdown-low' : ''}`}>
        {formatTime(torch.timeLeft)}
      </div>
      {!torch.isRunning && torch.timeLeft > 0 && (
        <div className="torch-paused-label">PAUSED</div>
      )}
      {torch.timeLeft === 0 && (
        <div className="torch-out-label">TORCH OUT</div>
      )}
    </div>
  )
}
