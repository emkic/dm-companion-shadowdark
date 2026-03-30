import React from 'react'
import { WEATHER_BY_SEASON, SEASONS, DANGER_LEVELS } from '@shared/constants'
import type { Season, DangerLevel } from '@shared/types'
import type { UseLocationReturn } from '../../hooks/useLocation'
import './LocationPanel.css'

type Props = UseLocationReturn

export function LocationPanel({
  location,
  setName,
  setSeason,
  setWeather,
  setDangerLevel,
  setImagePath,
  toggleShowToPlayer
}: Props) {
  async function handlePickImage() {
    const filePath = await window.electronAPI.openImageDialog()
    if (filePath) setImagePath(filePath)
  }

  return (
    <div className="location-panel">
      <div className="location-header">
        <h2 className="panel-title">Location</h2>
        <button
          className={`btn btn-small ${location.showToPlayer ? 'btn-primary' : 'btn-ghost'}`}
          onClick={toggleShowToPlayer}
        >
          {location.showToPlayer ? '👁 Shown' : '👁 Hidden'}
        </button>
      </div>

      <div className="location-fields">
        <div className="field-group">
          <label className="field-label">Name</label>
          <input
            type="text"
            value={location.name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. The Black Mire Inn"
            className="form-input full-width"
          />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label">Season</label>
            <select
              value={location.season}
              onChange={e => setSeason(e.target.value as Season)}
              className="form-select"
            >
              {SEASONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Danger</label>
            <select
              value={location.dangerLevel}
              onChange={e => setDangerLevel(e.target.value as DangerLevel)}
              className={`form-select danger-select danger-${location.dangerLevel}`}
            >
              {DANGER_LEVELS.map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Weather</label>
          <select
            value={location.weather}
            onChange={e => setWeather(e.target.value)}
            className="form-select full-width"
          >
            {WEATHER_BY_SEASON[location.season].map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label">Location Image</label>
          <button className="btn btn-ghost btn-small" onClick={handlePickImage}>
            📷 Choose Image
          </button>
          {location.imagePath && (
            <>
              <div className="image-filename">{location.imagePath.split(/[\\/]/).pop()}</div>
              <div className="image-preview-small">
                <img
                  src={`media:///${location.imagePath.replace(/\\/g, '/')}`}
                  alt="Location"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
