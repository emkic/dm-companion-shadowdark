import React, { useState, useEffect } from 'react'
import { PlayerTorch } from './components/PlayerTorch'
import { PlayerMedia } from './components/PlayerMedia'
import { PlayerLocation } from './components/PlayerLocation'
import { PlayerCombat } from './components/PlayerCombat'
import { PlayerWatchOrder } from './components/PlayerWatchOrder'
import type { AppState } from '@shared/types'
import { DEFAULT_TORCH_SECONDS, WEATHER_BY_SEASON } from '@shared/constants'

const INITIAL_STATE: AppState = {
  torch: { timeLeft: DEFAULT_TORCH_SECONDS, isRunning: false, isExtinguished: false, lightMode: 'torch', hideTimerFromPlayer: false },
  combat: { isActive: false, round: 1, currentTurnIndex: 0, combatants: [] },
  location: {
    name: '',
    season: 'spring',
    weather: WEATHER_BY_SEASON.spring[0],
    dangerLevel: 'unsafe',
    imagePath: '',
    showToPlayer: false,
    activity: 'traveling',
    date: new Date().toISOString().slice(0, 10),
    showDate: false,
    travelMethod: 'walking',
    isPushing: false,
    hexesRemaining: 4,
    isCamping: false,
    hasCampfire: false,
    watches: [
      { name: '', encounter: false, interruption: false },
      { name: '', encounter: false, interruption: false },
      { name: '', encounter: false, interruption: false },
      { name: '', encounter: false, interruption: false }
    ],
    checklist: { rationsConsumed: false, foragingAttempt: false, encounterDay1: false, encounterDay2: false, encounterNight1: false, encounterNight2: false }
  },
  media: { currentFile: null, fileType: null, isShowing: false, folderPath: '', files: [] }
}

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)

  useEffect(() => {
    const cleanup = window.playerAPI.onStateUpdate((newState: AppState) => {
      setState(newState)
    })
    return cleanup
  }, [])

  return (
    <div className="player-app">
      <PlayerMedia media={state.media} location={state.location} />
      <PlayerCombat combat={state.combat} />
      <PlayerTorch torch={state.torch} isCamping={state.location.isCamping} hasCampfire={state.location.isCamping && state.location.hasCampfire} />
      <PlayerWatchOrder location={state.location} />
      <PlayerLocation location={state.location} />
    </div>
  )
}
