import { useState, useEffect, useRef } from 'react'
import { WEATHER_BY_SEASON, SEASONS, DANGER_LEVELS } from '@shared/constants'
import type { LocationState, Season, DangerLevel } from '@shared/types'
import type { UseSavedLocationsReturn } from '../../hooks/useSavedLocations'
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
  savedLocationsHook: UseSavedLocationsReturn
}

export function LocationSidebar({
  location, setName, setSeason, setWeather, setDangerLevel, setImagePath,
  toggleShowToPlayer, setDate, toggleShowDate, savedLocationsHook
}: Props) {
  const [showWeatherHex, setShowWeatherHex] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  const { savedLocations, addSavedLocation, updateSavedLocation, deleteSavedLocation } = savedLocationsHook

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    function onMouseDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [pickerOpen])

  // If selected location was deleted, clear selection
  const selectedStillExists = selectedSavedId !== null && savedLocations.some(l => l.id === selectedSavedId)
  const effectiveSelectedId = selectedStillExists ? selectedSavedId : null
  const selectedLocation = effectiveSelectedId ? savedLocations.find(l => l.id === effectiveSelectedId) : null

  async function handlePickImage() {
    const filePath = await window.electronAPI.openImageDialog()
    if (filePath) setImagePath(filePath)
  }

  function handleClearImage() {
    setImagePath('')
  }

  function handlePickSaved(id: string) {
    const saved = savedLocations.find(l => l.id === id)
    if (!saved) return
    setName(saved.name)
    setImagePath(saved.imagePath)
    setDangerLevel(saved.dangerLevel)
    setSelectedSavedId(id)
    setPickerOpen(false)
  }

  function handleSaveAsNew() {
    if (!location.name.trim()) return
    const created = addSavedLocation({
      name: location.name.trim(),
      imagePath: location.imagePath,
      dangerLevel: location.dangerLevel
    })
    setSelectedSavedId(created.id)
  }

  function handleOverwrite() {
    if (!effectiveSelectedId) return
    updateSavedLocation(effectiveSelectedId, {
      name: location.name.trim(),
      imagePath: location.imagePath,
      dangerLevel: location.dangerLevel
    })
  }

  function handleDeleteSaved(id: string, name: string) {
    if (confirm(`Delete saved location "${name}"?`)) {
      deleteSavedLocation(id)
    }
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
        <label className="field-label">Saved Locations</label>
        <div className="sidebar-row saved-locations-row">
          <div className="saved-picker" ref={pickerRef}>
            <button
              className="saved-picker-button"
              onClick={() => setPickerOpen(o => !o)}
              type="button"
            >
              <span className="saved-picker-label">
                {selectedLocation ? selectedLocation.name : '— New / unsaved —'}
              </span>
              <span className="saved-picker-caret">▾</span>
            </button>
            {pickerOpen && (
              <div className="saved-picker-popover">
                {savedLocations.length === 0 ? (
                  <div className="saved-picker-empty">No saved locations yet. Click ➕ to save the current one.</div>
                ) : (
                  savedLocations.map(l => (
                    <div
                      key={l.id}
                      className={`saved-picker-row ${l.id === effectiveSelectedId ? 'is-selected' : ''}`}
                    >
                      <button
                        className="saved-picker-row-name"
                        onClick={() => handlePickSaved(l.id)}
                        type="button"
                        title={`Switch to "${l.name}"`}
                      >
                        <span>{l.name || '(unnamed)'}</span>
                      </button>
                      <button
                        className="saved-picker-row-action saved-picker-row-delete"
                        onClick={() => handleDeleteSaved(l.id, l.name)}
                        title="Delete"
                        type="button"
                      >
                        🗑
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            className="btn btn-ghost btn-small"
            onClick={handleOverwrite}
            disabled={!effectiveSelectedId || !location.name.trim()}
            title={effectiveSelectedId
              ? `Overwrite "${selectedLocation?.name}" with current name, image, danger`
              : 'Pick a saved location to overwrite'}
          >
            💾
          </button>
          <button
            className="btn btn-ghost btn-small"
            onClick={handleSaveAsNew}
            disabled={!location.name.trim()}
            title="Save current as a new entry"
          >
            ➕
          </button>
        </div>
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
        <label className="field-label">Location Image</label>
        <div className="sidebar-row">
          <button className="btn btn-ghost btn-small image-pick-button" onClick={handlePickImage}>
            📷 {location.imagePath ? 'Change Image' : 'Choose Image'}
          </button>
          {location.imagePath && (
            <button
              className="btn btn-ghost btn-small image-clear-button"
              onClick={handleClearImage}
              title="Clear image"
            >
              ✕
            </button>
          )}
        </div>
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

      <div className="sidebar-divider" />

      <h3 className="sidebar-subheading">Conditions</h3>

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
