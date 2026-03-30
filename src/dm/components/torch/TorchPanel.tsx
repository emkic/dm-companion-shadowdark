import React, { useState } from 'react'
import type { UseTorchReturn } from '../../hooks/useTorch'
import './TorchPanel.css'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface Props extends UseTorchReturn {}

export function TorchPanel({ torch, lowAlert, start, stop, reset, adjustMinutes, extinguish, relight, setLightMode, toggleHideTimer }: Props) {
  const [customMinutes, setCustomMinutes] = useState('1')
  const hasTimer = torch.lightMode === 'torch' || torch.lightMode === 'magical'

  return (
    <div className={`torch-panel ${lowAlert && hasTimer ? 'low-alert' : ''}`}>
      <h2 className="panel-title">Light Source</h2>

      <div className="light-mode-toggle">
        <button
          className={`btn btn-small ${torch.lightMode === 'torch' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setLightMode('torch')}
        >
          🔥 Torch
        </button>
        <button
          className={`btn btn-small ${torch.lightMode === 'magical' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setLightMode('magical')}
        >
          🔮 Magical
        </button>
        <button
          className={`btn btn-small ${torch.lightMode === 'natural' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setLightMode('natural')}
        >
          ☀️ Natural
        </button>
      </div>

      {!hasTimer ? (
        <div className="natural-light-info">
          Daylight — no timer needed
        </div>
      ) : (
        <>
          <div className="torch-display">
            <div className={`torch-icon ${torch.isRunning ? 'burning' : ''} ${lowAlert ? 'dim' : ''}`}>
              🔥
            </div>
            <div className={`torch-time ${lowAlert ? 'low' : ''}`}>
              {formatTime(torch.timeLeft)}
            </div>
          </div>

          <button
            className={`btn btn-small ${torch.hideTimerFromPlayer ? 'btn-accent' : 'btn-ghost'}`}
            onClick={toggleHideTimer}
            title={torch.hideTimerFromPlayer ? 'Timer is hidden from players' : 'Timer is visible to players'}
          >
            {torch.hideTimerFromPlayer ? '🙈 Timer Hidden from Players' : '👁 Timer Visible to Players'}
          </button>

          <div className="torch-controls">
            {!torch.isRunning ? (
              <button className="btn btn-primary" onClick={start} disabled={torch.timeLeft <= 0}>
                Start
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={stop}>
                Pause
              </button>
            )}
            <button className="btn btn-ghost" onClick={reset}>Reset</button>
            {!torch.isExtinguished ? (
              <button className="btn btn-danger" onClick={extinguish} disabled={torch.timeLeft <= 0}>
                Extinguish
              </button>
            ) : (
              <button className="btn btn-accent" onClick={relight} disabled={torch.timeLeft <= 0}>
                Relight
              </button>
            )}
          </div>

          <div className="torch-adjust">
            <button className="btn btn-small" onClick={() => adjustMinutes(-5)}>-5m</button>
            <button className="btn btn-small" onClick={() => adjustMinutes(-1)}>-1m</button>
            <div className="custom-adjust">
              <input
                type="number"
                min="1"
                max="60"
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                className="minutes-input"
              />
              <button className="btn btn-small" onClick={() => adjustMinutes(parseInt(customMinutes) || 1)}>
                +{customMinutes}m
              </button>
            </div>
            <button className="btn btn-small" onClick={() => adjustMinutes(5)}>+5m</button>
          </div>

          {lowAlert && (
            <div className="torch-warning">⚠ Torch burning low!</div>
          )}
        </>
      )}
    </div>
  )
}
