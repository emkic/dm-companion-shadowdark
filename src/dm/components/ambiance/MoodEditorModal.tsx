import React, { useEffect } from 'react'
import type { MoodPreset } from '@shared/types'
import { isValidYouTubeUrl } from '../../hooks/useAmbiance'
import './MoodEditorModal.css'

interface Props {
  presets: MoodPreset[]
  onSave: (presets: MoodPreset[]) => Promise<void>
  onClose: () => void
}

let nextId = 100

export function MoodEditorModal({ presets, onSave, onClose }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose])

  function updatePreset(id: string, patch: Partial<MoodPreset>) {
    onSave(presets.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  function addPreset() {
    onSave([
      ...presets,
      {
        id: String(nextId++),
        name: 'New Mood',
        color: '#888888',
        source: 'youtube',
        youtubeUrl: '',
        audioFiles: [],
        volume: 50,
        shuffle: true,
        favorite: false
      }
    ])
  }

  function removePreset(id: string) {
    onSave(presets.filter(p => p.id !== id))
  }

  async function handleAddAudioFiles(moodId: string) {
    const files = await window.electronAPI.openAudioDialog()
    if (files.length === 0) return
    onSave(presets.map(p => {
      if (p.id !== moodId) return p
      const existing = new Set(p.audioFiles)
      const merged = [...p.audioFiles, ...files.filter(f => !existing.has(f))]
      return { ...p, audioFiles: merged }
    }))
  }

  function removeAudioFile(moodId: string, filePath: string) {
    onSave(presets.map(p => {
      if (p.id !== moodId) return p
      return { ...p, audioFiles: p.audioFiles.filter(f => f !== filePath) }
    }))
  }

  return (
    <div className="mood-editor-backdrop" onClick={onClose}>
      <div className="mood-editor" onClick={e => e.stopPropagation()}>
        <div className="mood-editor-header">
          <h2 className="panel-title">Edit Mood Presets</h2>
          <button className="btn btn-ghost btn-small" onClick={onClose}>✕</button>
        </div>

        <div className="mood-editor-list">
          {presets.map(mood => (
            <div key={mood.id} className="mood-editor-item">
              <div className="mood-editor-row">
                <input
                  type="color"
                  value={mood.color}
                  onChange={e => updatePreset(mood.id, { color: e.target.value })}
                  className="mood-editor-color"
                  title="Mood color"
                />
                <input
                  type="text"
                  value={mood.name}
                  onChange={e => updatePreset(mood.id, { name: e.target.value })}
                  className="form-input mood-editor-name"
                  placeholder="Mood name"
                />
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => removePreset(mood.id)}
                  title="Remove mood"
                >
                  ✕
                </button>
              </div>

              {/* Source toggle */}
              <div className="mood-editor-row mood-editor-source-row">
                <label className="mood-editor-source-label">Source</label>
                <div className="mood-editor-source-toggle">
                  <button
                    className={`mood-source-btn ${mood.source === 'youtube' ? 'active' : ''}`}
                    onClick={() => updatePreset(mood.id, { source: 'youtube' })}
                  >
                    YouTube
                  </button>
                  <button
                    className={`mood-source-btn ${mood.source === 'local' ? 'active' : ''}`}
                    onClick={() => updatePreset(mood.id, { source: 'local' })}
                  >
                    Local Files
                  </button>
                </div>
              </div>

              {/* YouTube URL input */}
              {mood.source === 'youtube' && (() => {
                const trimmed = mood.youtubeUrl.trim()
                const valid = trimmed ? isValidYouTubeUrl(trimmed) : null
                return (
                  <div className="mood-editor-row mood-editor-url-row">
                    <input
                      type="text"
                      value={mood.youtubeUrl}
                      onChange={e => updatePreset(mood.id, { youtubeUrl: e.target.value })}
                      className="form-input mood-editor-url"
                      placeholder="YouTube playlist or video URL"
                    />
                    {valid === true && (
                      <span className="mood-editor-url-hint mood-editor-url-hint-ok">✓ Saved · click the mood in Ambiance to play</span>
                    )}
                    {valid === false && (
                      <span className="mood-editor-url-hint mood-editor-url-hint-bad">✗ Not a recognised YouTube link</span>
                    )}
                  </div>
                )
              })()}

              {/* Local audio files */}
              {mood.source === 'local' && (
                <div className="mood-editor-row mood-editor-files-section">
                  <button
                    className="btn btn-ghost btn-small"
                    onClick={() => handleAddAudioFiles(mood.id)}
                  >
                    + Add Audio Files
                  </button>
                  {mood.audioFiles.length > 0 && (
                    <div className="mood-editor-file-list">
                      {mood.audioFiles.map(f => {
                        const name = f.split(/[\\/]/).pop() ?? f
                        return (
                          <div key={f} className="mood-editor-file-item">
                            <span className="mood-editor-file-name" title={f}>{name}</span>
                            <button
                              className="mood-editor-file-remove"
                              onClick={() => removeAudioFile(mood.id, f)}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {mood.audioFiles.length === 0 && (
                    <span className="mood-editor-hint">No audio files added yet</span>
                  )}
                </div>
              )}

              <div className="mood-editor-row mood-editor-settings">
                <label className="mood-editor-setting">
                  <span>Vol</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mood.volume}
                    onChange={e => updatePreset(mood.id, { volume: Number(e.target.value) })}
                    className="mood-editor-volume"
                  />
                  <span className="mood-editor-vol-value">{mood.volume}</span>
                </label>
                <label className="mood-editor-setting">
                  <input
                    type="checkbox"
                    checked={mood.shuffle}
                    onChange={e => updatePreset(mood.id, { shuffle: e.target.checked })}
                  />
                  <span>Shuffle</span>
                </label>
                <label className="mood-editor-setting">
                  <input
                    type="checkbox"
                    checked={mood.favorite}
                    onChange={e => updatePreset(mood.id, { favorite: e.target.checked })}
                  />
                  <span>★ Mini-player</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mood-editor-footer">
          <button className="btn btn-ghost btn-small" onClick={addPreset}>
            + Add Mood
          </button>
          <div className="mood-editor-footer-right">
            <button className="btn btn-primary btn-small" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  )
}
