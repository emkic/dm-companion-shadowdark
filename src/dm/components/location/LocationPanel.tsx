import React from 'react'
import { WEATHER_BY_SEASON, SEASONS, DANGER_LEVELS } from '@shared/constants'
import { HEXES_PER_DAY, ACTIVITY_LABELS } from '@shared/types'
import type { Season, DangerLevel, ActivityState, TravelMethod } from '@shared/types'
import type { UseLocationReturn } from '../../hooks/useLocation'
import './LocationPanel.css'

const ACTIVITIES: ActivityState[] = ['traveling', 'crawling', 'resting', 'city']
const TRAVEL_METHODS: { value: TravelMethod; label: string }[] = [
  { value: 'walking', label: `Walking (${HEXES_PER_DAY.walking}/day)` },
  { value: 'mounted', label: `Mounted (${HEXES_PER_DAY.mounted}/day)` },
  { value: 'sailing', label: `Sailing (${HEXES_PER_DAY.sailing}/day)` }
]

type Props = UseLocationReturn

export function LocationPanel({
  location, setName, setSeason, setWeather, setDangerLevel, setImagePath,
  toggleShowToPlayer, setActivity, setDate, setTravelMethod, togglePushing,
  spendHexes, toggleChecklist, newDay
}: Props) {
  const maxHexes = location.isPushing
    ? Math.floor(HEXES_PER_DAY[location.travelMethod] * 1.5)
    : HEXES_PER_DAY[location.travelMethod]

  async function handlePickImage() {
    const filePath = await window.electronAPI.openImageDialog()
    if (filePath) setImagePath(filePath)
  }

  return (
    <div className="location-panel">
      <div className="location-header">
        <h2 className="panel-title">Location & Travel</h2>
        <div className="location-header-controls">
          <button
            className={`btn btn-small ${location.showToPlayer ? 'btn-primary' : 'btn-ghost'}`}
            onClick={toggleShowToPlayer}
          >
            {location.showToPlayer ? '👁 Shown' : '👁 Hidden'}
          </button>
        </div>
      </div>

      {/* Activity state toggle */}
      <div className="activity-toggle">
        {ACTIVITIES.map(a => (
          <button
            key={a}
            className={`btn btn-small ${location.activity === a ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActivity(a)}
          >
            {ACTIVITY_LABELS[a]}
          </button>
        ))}
      </div>

      {/* Date & New Day */}
      <div className="field-row">
        <div className="field-group">
          <label className="field-label">Date</label>
          <input
            type="date"
            value={location.date}
            onChange={e => setDate(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="field-group field-group-end">
          <button className="btn btn-primary" onClick={newDay}>
            New Day
          </button>
        </div>
      </div>

      {/* Location info row */}
      <div className="field-row">
        <div className="field-group flex-grow">
          <label className="field-label">Name</label>
          <input
            type="text"
            value={location.name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. The Black Mire Inn"
            className="form-input full-width"
          />
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

      {/* Season & Weather */}
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
        <div className="field-group flex-grow">
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
      </div>

      {/* Location Image */}
      <div className="field-row">
        <div className="field-group">
          <label className="field-label">Location Image</label>
          <button className="btn btn-ghost btn-small" onClick={handlePickImage}>
            📷 Choose Image
          </button>
        </div>
        {location.imagePath && (
          <div className="image-preview-inline">
            <img
              src={`media:///${location.imagePath.replace(/\\/g, '/')}`}
              alt="Location"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="image-filename">{location.imagePath.split(/[\\/]/).pop()}</span>
          </div>
        )}
      </div>

      {/* Traveling-specific */}
      {location.activity === 'traveling' && (
        <>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Travel Method</label>
              <select
                value={location.travelMethod}
                onChange={e => setTravelMethod(e.target.value as TravelMethod)}
                className="form-select"
              >
                {TRAVEL_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Pushing</label>
              <button
                className={`btn btn-small ${location.isPushing ? 'btn-accent' : 'btn-ghost'}`}
                onClick={togglePushing}
              >
                {location.isPushing ? 'Pushing (1.5x)' : 'Normal'}
              </button>
            </div>
          </div>

          {/* Hex tracker */}
          <div className="hex-tracker">
            <label className="field-label">Hexes Remaining</label>
            <div className="hex-display">
              <span className={`hex-count ${location.hexesRemaining === 0 ? 'exhausted' : ''}`}>
                {location.hexesRemaining} / {maxHexes}
              </span>
              <button
                className="btn btn-small btn-ghost"
                onClick={() => spendHexes(1)}
                disabled={location.hexesRemaining === 0}
              >
                -1 Hex
              </button>
              <button
                className="btn btn-small btn-ghost"
                onClick={() => spendHexes(2)}
                disabled={location.hexesRemaining < 2}
                title="Difficult terrain costs 2 hexes"
              >
                -2 Hex (Difficult)
              </button>
            </div>
          </div>

          {location.isPushing && (
            <div className="travel-reminder pushing-reminder">
              Pushing: +1:6 encounter chance, no foraging allowed
            </div>
          )}
        </>
      )}

      {/* Checklist for traveling & resting */}
      {(location.activity === 'traveling' || location.activity === 'resting') && (
        <div className="travel-checklist">
          <label className="field-label">Daily Checklist</label>
          <div className="checklist-items">
            <label className="checklist-item">
              <input
                type="checkbox"
                checked={location.checklist.rationsConsumed}
                onChange={() => toggleChecklist('rationsConsumed')}
              />
              <span>Rations consumed?</span>
              <span className="checklist-hint">1d4 CON dmg if not</span>
            </label>
            {location.activity === 'traveling' && !location.isPushing && (
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.foragingAttempt}
                  onChange={() => toggleChecklist('foragingAttempt')}
                />
                <span>Foraging attempt?</span>
                <span className="checklist-hint">INT check for 1 ration</span>
              </label>
            )}
            {location.activity === 'traveling' && (
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.encounterDay}
                  onChange={() => toggleChecklist('encounterDay')}
                />
                <span>Random encounter — Day</span>
                <span className="checklist-hint">1:6 chance{location.isPushing ? ' (+1:6 pushing)' : ''}</span>
              </label>
            )}
            <label className="checklist-item">
              <input
                type="checkbox"
                checked={location.checklist.encounterNight}
                onChange={() => toggleChecklist('encounterNight')}
              />
              <span>Random encounter — Night</span>
              <span className="checklist-hint">1:6 chance</span>
            </label>
          </div>
        </div>
      )}

      {location.activity === 'city' && (
        <div className="travel-reminder city-reminder">
          Resting in town — no travel, encounters, or foraging checks needed.
        </div>
      )}
    </div>
  )
}
