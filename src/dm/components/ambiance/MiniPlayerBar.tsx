import React from 'react'
import type { UseAmbianceReturn } from '../../hooks/useAmbiance'
import { moodHasContent } from '../../hooks/useAmbiance'
import './MiniPlayerBar.css'

interface Props {
  ambianceHook: UseAmbianceReturn
}

export function MiniPlayerBar({ ambianceHook }: Props) {
  const { ambiance, presets, playMood, togglePlayPause, skip, setVolume } = ambianceHook

  // Show favorited presets as shortcuts
  const shortcuts = presets.filter(p => p.favorite)

  // Don't render if there are no presets at all
  if (presets.length === 0) return null

  const activeMood = presets.find(p => p.id === ambiance.currentMoodId)

  return (
    <div className="mini-player-bar">
      <div className="mini-player-left">
        <button
          className="mini-player-playpause"
          onClick={togglePlayPause}
          disabled={!ambiance.currentMoodId}
          title={ambiance.isPlaying ? 'Pause' : 'Play'}
        >
          {ambiance.isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="mini-player-playpause"
          onClick={skip}
          disabled={!ambiance.currentMoodId}
          title="Skip"
        >
          ⏭
        </button>

        <div className="mini-player-volume">
          <span className="mini-player-vol-icon">{ambiance.volume === 0 ? '🔇' : '🔊'}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={ambiance.volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="mini-player-vol-slider"
            title={`Volume: ${ambiance.volume}%`}
          />
        </div>

        <div className="mini-player-shortcuts">
          {shortcuts.map(mood => {
            const isActive = ambiance.currentMoodId === mood.id
            const hasContent = moodHasContent(mood)
            return (
              <button
                key={mood.id}
                className={`mini-player-mood ${isActive ? 'active' : ''}`}
                style={{
                  '--mood-color': mood.color,
                  borderColor: isActive ? mood.color : undefined,
                  background: isActive ? `${mood.color}30` : `${mood.color}15`
                } as React.CSSProperties}
                onClick={() => {
                  if (!hasContent) return
                  if (isActive) togglePlayPause()
                  else playMood(mood.id)
                }}
                disabled={!hasContent}
                title={hasContent ? mood.name : `${mood.name} — not configured`}
              >
                {mood.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mini-player-info">
        {activeMood && (
          <span className="mini-player-dot" style={{ background: activeMood.color }} />
        )}
        <span className="mini-player-title">
          {ambiance.currentTrackTitle || (activeMood ? activeMood.name : 'No music')}
        </span>
      </div>
    </div>
  )
}
