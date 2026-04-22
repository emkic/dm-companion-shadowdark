import { useState } from 'react'
import type { UseTorchReturn } from '../../hooks/useTorch'
import type { TimerState, LightMode } from '@shared/types'
import './TorchPanel.css'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface TimerCardProps {
  timer: TimerState
  lowAlert: boolean
  isOnly: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onAdjustMinutes: (delta: number) => void
  onExtinguish: () => void
  onRelight: () => void
  onSetLightMode: (mode: LightMode) => void
  onToggleHideTimer: () => void
  onRename: (label: string) => void
  onRemove: () => void
}

function TimerCard({
  timer, lowAlert, isOnly,
  onStart, onStop, onReset, onAdjustMinutes,
  onExtinguish, onRelight, onSetLightMode,
  onToggleHideTimer, onRename, onRemove
}: TimerCardProps) {
  const [customMinutes, setCustomMinutes] = useState('1')
  const hasTimer = timer.lightMode === 'torch' || timer.lightMode === 'magical'

  return (
    <div className={`timer-card ${lowAlert && hasTimer ? 'low-alert' : ''}`}>
      <div className="timer-card-header">
        <input
          type="text"
          className="timer-name-input"
          value={timer.label}
          onChange={e => onRename(e.target.value)}
          placeholder="Name..."
        />
        {!isOnly && (
          <button className="btn btn-ghost timer-remove" onClick={onRemove} title="Remove timer">
            ✕
          </button>
        )}
      </div>

      <div className="light-mode-toggle">
        <button
          className={`btn btn-small ${timer.lightMode === 'torch' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onSetLightMode('torch')}
        >
          🔥 Torch
        </button>
        <button
          className={`btn btn-small ${timer.lightMode === 'magical' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onSetLightMode('magical')}
        >
          🔮 Magical
        </button>
        <button
          className={`btn btn-small ${timer.lightMode === 'natural' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onSetLightMode('natural')}
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
            <div className={`torch-icon ${timer.isRunning ? 'burning' : ''} ${lowAlert ? 'dim' : ''}`}>
              {timer.lightMode === 'magical' ? '🔮' : '🔥'}
            </div>
            <div className={`torch-time ${lowAlert ? 'low' : ''}`}>
              {formatTime(timer.timeLeft)}
            </div>
          </div>

          <button
            className={`btn btn-small ${timer.hideTimerFromPlayer ? 'btn-accent' : 'btn-ghost'}`}
            onClick={onToggleHideTimer}
            title={timer.hideTimerFromPlayer ? 'Timer is hidden from players' : 'Timer is visible to players'}
          >
            {timer.hideTimerFromPlayer ? '🙈 Timer Hidden' : '👁 Timer Visible'}
          </button>

          <div className="torch-controls">
            {!timer.isRunning ? (
              <button className="btn btn-primary" onClick={onStart} disabled={timer.timeLeft <= 0}>
                Start
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={onStop}>
                Pause
              </button>
            )}
            <button className="btn btn-ghost" onClick={onReset}>Reset</button>
            {!timer.isExtinguished ? (
              <button className="btn btn-danger" onClick={onExtinguish} disabled={timer.timeLeft <= 0}>
                Extinguish
              </button>
            ) : (
              <button className="btn btn-accent" onClick={onRelight} disabled={timer.timeLeft <= 0}>
                Relight
              </button>
            )}
          </div>

          <div className="torch-adjust">
            <button className="btn btn-small" onClick={() => onAdjustMinutes(-(parseInt(customMinutes) || 1))}>
              -{customMinutes}m
            </button>
            <input
              type="number"
              min="1"
              max="60"
              value={customMinutes}
              onChange={e => setCustomMinutes(e.target.value)}
              className="minutes-input"
            />
            <button className="btn btn-small" onClick={() => onAdjustMinutes(parseInt(customMinutes) || 1)}>
              +{customMinutes}m
            </button>
          </div>

          {lowAlert && (
            <div className="torch-warning">⚠ Burning low!</div>
          )}
        </>
      )}
    </div>
  )
}

interface Props {
  torchHook: UseTorchReturn
}

export function TorchPanel({ torchHook }: Props) {
  const { torchState, isTimerLow, addTimer, removeTimer, renameTimer,
    start, stop, reset, adjustMinutes, extinguish, relight,
    setLightMode, toggleHideTimer } = torchHook

  return (
    <div className="torch-panel">
      <div className="torch-panel-header">
        <h2 className="panel-title">Light Sources</h2>
        <button className="btn btn-small btn-ghost" onClick={addTimer}>+ Add</button>
      </div>

      {torchState.timers.map(timer => (
        <TimerCard
          key={timer.id}
          timer={timer}
          lowAlert={isTimerLow(timer.id)}
          isOnly={torchState.timers.length === 1}
          onStart={() => start(timer.id)}
          onStop={() => stop(timer.id)}
          onReset={() => reset(timer.id)}
          onAdjustMinutes={(delta) => adjustMinutes(timer.id, delta)}
          onExtinguish={() => extinguish(timer.id)}
          onRelight={() => relight(timer.id)}
          onSetLightMode={(mode) => setLightMode(timer.id, mode)}
          onToggleHideTimer={() => toggleHideTimer(timer.id)}
          onRename={(label) => renameTimer(timer.id, label)}
          onRemove={() => removeTimer(timer.id)}
        />
      ))}
    </div>
  )
}
