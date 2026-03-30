import React from 'react'
import { WEATHER_BY_SEASON, SEASONS } from '@shared/constants'
import { HEXES_PER_DAY } from '@shared/types'
import type { TravelMethod, TravelMode, Season } from '@shared/types'
import type { UseTravelReturn } from '../../hooks/useTravel'
import './TravelPanel.css'

const TRAVEL_METHODS: { value: TravelMethod; label: string }[] = [
  { value: 'walking', label: `Walking (${HEXES_PER_DAY.walking}/day)` },
  { value: 'mounted', label: `Mounted (${HEXES_PER_DAY.mounted}/day)` },
  { value: 'sailing', label: `Sailing (${HEXES_PER_DAY.sailing}/day)` }
]

type Props = UseTravelReturn

export function TravelPanel({
  travel, setMode, setDate, setTravelMethod, togglePushing,
  spendHexes, setSeason, setWeather, toggleChecklist, toggleShowToPlayer, newDay
}: Props) {
  const maxHexes = travel.isPushing
    ? Math.floor(HEXES_PER_DAY[travel.travelMethod] * 1.5)
    : HEXES_PER_DAY[travel.travelMethod]

  return (
    <div className="travel-panel">
      <div className="travel-header">
        <h2 className="panel-title">Travel & Rest</h2>
        <div className="travel-header-controls">
          <div className="mode-toggle">
            <button
              className={`btn btn-small ${travel.mode === 'wilderness' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMode('wilderness')}
            >
              Wilderness
            </button>
            <button
              className={`btn btn-small ${travel.mode === 'city' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMode('city')}
            >
              City / Indoor
            </button>
          </div>
          <button
            className={`btn btn-small ${travel.showToPlayer ? 'btn-primary' : 'btn-ghost'}`}
            onClick={toggleShowToPlayer}
          >
            {travel.showToPlayer ? '👁 Shown' : '👁 Hidden'}
          </button>
        </div>
      </div>

      {/* Date & New Day */}
      <div className="travel-row">
        <div className="field-group">
          <label className="field-label">Date</label>
          <input
            type="date"
            value={travel.date}
            onChange={e => setDate(e.target.value)}
            className="form-input"
          />
        </div>
        <button className="btn btn-primary" onClick={newDay}>
          New Day
        </button>
      </div>

      {/* Weather */}
      <div className="travel-row">
        <div className="field-group flex-1">
          <label className="field-label">Season</label>
          <select
            value={travel.season}
            onChange={e => setSeason(e.target.value as Season)}
            className="form-select"
          >
            {SEASONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="field-group flex-2">
          <label className="field-label">Weather</label>
          <select
            value={travel.weather}
            onChange={e => setWeather(e.target.value)}
            className="form-select full-width"
          >
            {WEATHER_BY_SEASON[travel.season].map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Wilderness-only sections */}
      {travel.mode === 'wilderness' && (
        <>
          {/* Travel Method & Hex Movement */}
          <div className="travel-row">
            <div className="field-group">
              <label className="field-label">Travel Method</label>
              <select
                value={travel.travelMethod}
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
                className={`btn btn-small ${travel.isPushing ? 'btn-accent' : 'btn-ghost'}`}
                onClick={togglePushing}
              >
                {travel.isPushing ? 'Pushing (1.5x)' : 'Normal'}
              </button>
            </div>
          </div>

          {/* Hex tracker */}
          <div className="hex-tracker">
            <label className="field-label">Hexes Remaining</label>
            <div className="hex-display">
              <span className={`hex-count ${travel.hexesRemaining === 0 ? 'exhausted' : ''}`}>
                {travel.hexesRemaining} / {maxHexes}
              </span>
              <button
                className="btn btn-small btn-ghost"
                onClick={() => spendHexes(1)}
                disabled={travel.hexesRemaining === 0}
              >
                -1 Hex
              </button>
              <button
                className="btn btn-small btn-ghost"
                onClick={() => spendHexes(2)}
                disabled={travel.hexesRemaining < 2}
                title="Difficult terrain costs 2 hexes"
              >
                -2 Hex (Difficult)
              </button>
            </div>
          </div>

          {travel.isPushing && (
            <div className="travel-reminder pushing-reminder">
              Pushing: +1:6 encounter chance, no foraging allowed
            </div>
          )}

          {/* Checklist */}
          <div className="travel-checklist">
            <label className="field-label">Daily Checklist</label>
            <div className="checklist-items">
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={travel.checklist.rationsConsumed}
                  onChange={() => toggleChecklist('rationsConsumed')}
                />
                <span>Rations consumed?</span>
                <span className="checklist-hint">1d4 CON dmg if not</span>
              </label>
              {!travel.isPushing && (
                <label className="checklist-item">
                  <input
                    type="checkbox"
                    checked={travel.checklist.foragingAttempt}
                    onChange={() => toggleChecklist('foragingAttempt')}
                  />
                  <span>Foraging attempt?</span>
                  <span className="checklist-hint">INT check for 1 ration</span>
                </label>
              )}
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={travel.checklist.encounterDay}
                  onChange={() => toggleChecklist('encounterDay')}
                />
                <span>Random encounter — Day</span>
                <span className="checklist-hint">1:6 chance{travel.isPushing ? ' (+1:6 pushing)' : ''}</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={travel.checklist.encounterNight}
                  onChange={() => toggleChecklist('encounterNight')}
                />
                <span>Random encounter — Night</span>
                <span className="checklist-hint">1:6 chance</span>
              </label>
            </div>
          </div>
        </>
      )}

      {travel.mode === 'city' && (
        <div className="travel-reminder city-reminder">
          Resting in town — no travel, encounters, or foraging checks needed.
        </div>
      )}
    </div>
  )
}
