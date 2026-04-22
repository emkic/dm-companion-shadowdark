import { useState } from 'react'
import { WEATHER_BY_SEASON, SEASONS, DANGER_LEVELS } from '@shared/constants'
import type { LocationState, Season, DangerLevel } from '@shared/types'
import weatherHexImage from '../travel/weather-hex.png'
import './LocationSidebar.css'

interface Props {
  location: LocationState
  setName: (name: string) => void
  setSeason: (season: Season) => void
  setWeather: (weather: string) => void
  setDangerLevel: (level: DangerLevel) => void
  setImagePath: (path: string) => void
  toggleShowToPlayer: () => void
  setDate: (date: string) => void
  toggleShowDate: () => void
}

export function LocationSidebar({
  location, setName, setSeason, setWeather, setDangerLevel, setImagePath,
  toggleShowToPlayer, setDate, toggleShowDate
}: Props) {
  const [showWeatherHex, setShowWeatherHex] = useState(false)

  async function handlePickImage() {
    const filePath = await window.electronAPI.openImageDialog()
    if (filePath) setImagePath(filePath)
  }

  return (
    <div className="location-sidebar">
      <div className="location-sidebar-header">
        <h2 className="panel-title">Location</h2>
        <button
          className={`btn btn-small ${location.showToPlayer ? 'btn-primary' : 'btn-ghost'}`}
          onClick={toggleShowToPlayer}
        >
          {location.showToPlayer ? '👁 Shown' : '👁 Hidden'}
        </button>
      </div>

      <div className="sidebar-field">
        <label className="field-label">Name</label>
        <input
          type="text"
          value={location.name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. The Black Mire Inn"
          className="form-input full-width"
        />
      </div>

      <div className="sidebar-field">
        <label className="field-label">Danger</label>
        <select
          value={location.dangerLevel}
          onChange={e => setDangerLevel(e.target.value as DangerLevel)}
          className={`form-select full-width danger-select danger-${location.dangerLevel}`}
        >
          {DANGER_LEVELS.map(d => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-field">
        <label className="field-label">Date (player screen)</label>
        <div className="sidebar-row">
          <button
            className={`btn btn-small ${location.showDate ? 'btn-primary' : 'btn-ghost'}`}
            onClick={toggleShowDate}
          >
            {location.showDate ? '📅 Date On' : '📅 Date Off'}
          </button>
          {location.showDate && (
            <input
              type="date"
              value={location.date}
              onChange={e => setDate(e.target.value)}
              className="form-input sidebar-date-input"
            />
          )}
        </div>
      </div>

      <div className="sidebar-field">
        <label className="field-label">Season</label>
        <select
          value={location.season}
          onChange={e => setSeason(e.target.value as Season)}
          className="form-select full-width"
        >
          {SEASONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-field">
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
        <button
          className="btn btn-ghost btn-small full-width"
          onClick={() => setShowWeatherHex(true)}
          title="Weather Hex Reference (by u/KorbohneD)"
        >
          🌦 Weather Hex (optional)
        </button>
      </div>

      <div className="sidebar-field">
        <label className="field-label">Location Image</label>
        <button className="btn btn-ghost btn-small full-width" onClick={handlePickImage}>
          📷 Choose Image
        </button>
        {location.imagePath && (
          <div className="sidebar-image-preview">
            <img
              src={`media:///${location.imagePath.replace(/\\/g, '/')}`}
              alt="Location"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="image-filename">{location.imagePath.split(/[\\/]/).pop()}</span>
          </div>
        )}
      </div>

      {showWeatherHex && (
        <div className="weather-hex-backdrop" onClick={() => setShowWeatherHex(false)}>
          <div className="weather-hex-modal" onClick={e => e.stopPropagation()}>
            <div className="weather-hex-header">
              <span className="weather-hex-title">Weather Hex</span>
              <span className="weather-hex-credit">by u/KorbohneD</span>
              <button className="btn btn-ghost btn-small" onClick={() => setShowWeatherHex(false)}>✕</button>
            </div>
            <div className="weather-hex-body">
              <img src={weatherHexImage} alt="Weather Hex Reference" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
