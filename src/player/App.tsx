import React, { useState, useEffect } from 'react'
import { PlayerTorch } from './components/PlayerTorch'
import { PlayerMedia } from './components/PlayerMedia'
import { PlayerLocation } from './components/PlayerLocation'
import { PlayerCombat } from './components/PlayerCombat'
import type { AppState } from '@shared/types'
import { DEFAULT_TORCH_SECONDS } from '@shared/constants'
const INITIAL_STATE: AppState = {
  torch: { timeLeft: DEFAULT_TORCH_SECONDS, isRunning: false, isExtinguished: false, lightMode: 'torch' },
  combat: { isActive: false, round: 1, currentTurnIndex: 0, combatants: [] },
  location: {
    name: '',
    season: 'spring',
    weather: '',
    dangerLevel: 'unsafe',
    imagePath: '',
    showToPlayer: false
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
      <PlayerTorch torch={state.torch} />
      <PlayerLocation location={state.location} />
    </div>
  )
}
