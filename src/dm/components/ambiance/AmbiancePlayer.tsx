import React, { useState } from 'react'
import type { UseAmbianceReturn } from '../../hooks/useAmbiance'
import { moodHasContent } from '../../hooks/useAmbiance'
import { MoodEditorModal } from './MoodEditorModal'
import './AmbiancePlayer.css'

interface Props {
  ambianceHook: UseAmbianceReturn
}

export function AmbiancePlayer({ ambianceHook }: Props) {
  const { ambiance, presets, apiLoadError, lastError, clearError, localPlaylist, localTrackIndex, playMood, playTrack, togglePlayPause, skip, stop, setVolume, toggleFavorite, savePresets } = ambianceHook
  const [editorOpen, setEditorOpen] = useState(false)

  const activeMood = presets.find(p => p.id === ambiance.currentMoodId)
  const errorMessage = lastError ?? (apiLoadError ? `YouTube unavailable — ${apiLoadError}. Local audio still works.` : null)

  return (
    <div className="ambiance-player">
      <div className="ambiance-header">
        <h2 className="panel-title">Ambiance</h2>
        <button className="btn btn-ghost btn-small" onClick={() => setEditorOpen(true)}>
          Edit Moods
        </button>
      </div>

      {ambiance.currentTrackTitle && (
        <div className="ambiance-now-playing">
          {activeMood && (
            <span className="ambiance-mood-dot" style={{ background: activeMood.color }} />
          )}
          <span className="ambiance-track-title">{ambiance.currentTrackTitle}</span>
        </div>
      )}

      {errorMessage && (
        <div className="ambiance-error" role="alert">
          <span className="ambiance-error-icon">!</span>
          <span className="ambiance-error-text">{errorMessage}</span>
          <button
            className="ambiance-error-dismiss"
            onClick={clearError}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <div className="ambiance-mood-grid">
        {presets.map(mood => {
          const isActive = ambiance.currentMoodId === mood.id
          const hasContent = moodHasContent(mood)
          return (
            <div key={mood.id} className="ambiance-mood-item">
              <button
                className={`ambiance-mood-btn ${isActive ? 'active' : ''} ${!hasContent ? 'unconfigured' : ''}`}
                style={{
                  '--mood-color': mood.color,
                  borderColor: isActive ? mood.color : undefined,
                  background: isActive ? `${mood.color}30` : undefined
                } as React.CSSProperties}
                onClick={() => {
                  if (!hasContent) return
                  if (isActive) togglePlayPause()
                  else playMood(mood.id)
                }}
                title={hasContent ? mood.name : `${mood.name} — configure in Edit Moods`}
              >
                {mood.name}
              </button>
              <button
                className={`ambiance-fav-btn ${mood.favorite ? 'favorited' : ''}`}
                onClick={() => toggleFavorite(mood.id)}
                title={mood.favorite ? 'Remove from mini-player' : 'Add to mini-player'}
              >
                {mood.favorite ? '★' : '☆'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="ambiance-controls">
        <div className="ambiance-control-buttons">
          <button
            className="btn btn-ghost btn-small"
            onClick={togglePlayPause}
            disabled={!ambiance.currentMoodId}
            title={ambiance.isPlaying ? 'Pause' : 'Play'}
          >
            {ambiance.isPlaying ? '⏸' : '▶'}
          </button>
          <button
            className="btn btn-ghost btn-small"
            onClick={skip}
            disabled={!ambiance.currentMoodId}
            title="Skip"
          >
            ⏭
          </button>
          <button
            className="btn btn-ghost btn-small"
            onClick={stop}
            disabled={!ambiance.currentMoodId}
            title="Stop"
          >
            ⏹
          </button>
        </div>

        <div className="ambiance-volume">
          <span className="ambiance-volume-icon">🔊</span>
          <input
            type="range"
            min={0}
            max={100}
            value={ambiance.volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="ambiance-volume-slider"
          />
          <span className="ambiance-volume-value">{ambiance.volume}</span>
        </div>
      </div>

      {activeMood?.source === 'local' && localPlaylist.length > 0 && (
        <div className="ambiance-tracklist">
          <div className="ambiance-tracklist-header">Tracks</div>
          <div className="ambiance-tracklist-items">
            {localPlaylist.map((filePath, i) => {
              const name = filePath.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, '') ?? filePath
              const isCurrent = i === localTrackIndex
              return (
                <button
                  key={`${filePath}-${i}`}
                  className={`ambiance-tracklist-item ${isCurrent ? 'active' : ''}`}
                  style={isCurrent && activeMood ? { borderColor: activeMood.color, background: `${activeMood.color}20` } : undefined}
                  onClick={() => playTrack(i)}
                  title={name}
                >
                  <span className="ambiance-tracklist-index">{i + 1}</span>
                  <span className="ambiance-tracklist-name">{name}</span>
                  {isCurrent && ambiance.isPlaying && <span className="ambiance-tracklist-playing">&#9654;</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {editorOpen && (
        <MoodEditorModal
          presets={presets}
          onSave={savePresets}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}
