import { useState, useEffect, useRef } from 'react'
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
  combatIsActive?: boolean
  crawlingIsActive?: boolean
}

const DARKNESS_OVERLAY_DURATION = 10_000 // 10 seconds before fading out

function PlayerTimerItem({ timer }: { timer: TimerState }) {
  const fraction = DEFAULT_TORCH_SECONDS > 0 ? timer.timeLeft / DEFAULT_TORCH_SECONDS : 0
  const lowAlert = fraction < LOW_TORCH_THRESHOLD
  // Stay at full brightness until the last 10 minutes, then ramp down
  const DIM_START = 600 / DEFAULT_TORCH_SECONDS // 10 minutes
  const dimLevel = fraction > DIM_START ? 1 : Math.max(0, fraction / DIM_START)
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

export function PlayerTorch({ torch, hasCampfire, isCamping, combatIsActive, crawlingIsActive }: Props) {
  const timers = torch.timers ?? []
  const nonNaturalTimers = timers.filter(t => t.lightMode !== 'natural')
  const allExtinguished = nonNaturalTimers.length > 0 && nonNaturalTimers.every(t => t.isExtinguished)
  const visibleTimers = nonNaturalTimers.filter(t => !t.isExtinguished)

  // During crawling: show darkness overlay temporarily, then fade out
  const [showCrawlOverlay, setShowCrawlOverlay] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const prevExtinguished = useRef(allExtinguished)

  useEffect(() => {
    if (allExtinguished && !prevExtinguished.current && crawlingIsActive) {
      // Torches just went out during a crawl — show temporary overlay
      setShowCrawlOverlay(true)
      setFadingOut(false)
      const fadeTimer = setTimeout(() => setFadingOut(true), DARKNESS_OVERLAY_DURATION)
      const hideTimer = setTimeout(() => {
        setShowCrawlOverlay(false)
        setFadingOut(false)
      }, DARKNESS_OVERLAY_DURATION + 3000) // 3s fade-out animation
      prevExtinguished.current = allExtinguished
      return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
    }
    if (!allExtinguished) {
      // Torch relit — dismiss overlay immediately
      setShowCrawlOverlay(false)
      setFadingOut(false)
    }
    prevExtinguished.current = allExtinguished
  }, [allExtinguished, crawlingIsActive])

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

  // All torches extinguished — full-screen darkness overlay
  // (not during combat or crawling, where turn order must stay visible)
  if (allExtinguished && !combatIsActive && !crawlingIsActive) {
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

  // During combat or crawling with all torches out — compact banner + temporary overlay
  if (allExtinguished && (combatIsActive || crawlingIsActive)) {
    return (
      <>
        {showCrawlOverlay && (
          <div className={`darkness-overlay ${fadingOut ? 'darkness-fading' : ''}`}>
            <div className="darkness-vignette" />
            <div className="darkness-text">
              <p className="darkness-line darkness-line-1">There is no light.</p>
              <p className="darkness-line darkness-line-2">You do not see anything.</p>
              <p className="darkness-line darkness-line-3">The living darkness closes in on you.</p>
            </div>
          </div>
        )}
        <div className="player-torches">
          <div className="player-torch-item darkness-banner">
            <span className="darkness-banner-text">No light — total darkness</span>
          </div>
        </div>
      </>
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
