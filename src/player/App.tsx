import React, { useState, useEffect } from 'react'
import { PlayerTorch } from './components/PlayerTorch'
import { PlayerMedia } from './components/PlayerMedia'
import { PlayerLocation } from './components/PlayerLocation'
import { PlayerCombat } from './components/PlayerCombat'
import { PlayerWatchOrder } from './components/PlayerWatchOrder'
import { PlayerCrawling } from './components/PlayerCrawling'
import { PlayerAnnouncement } from './components/PlayerAnnouncement'
import type { AppState } from '@shared/types'
import { DEFAULT_TORCH_SECONDS, WEATHER_BY_SEASON } from '@shared/constants'

const INITIAL_STATE: AppState = {
  torch: { timers: [{ id: 'default', label: 'Torch', lightMode: 'torch', timeLeft: DEFAULT_TORCH_SECONDS, isRunning: false, isExtinguished: false, hideTimerFromPlayer: false }] },
  combat: { isActive: false, round: 1, currentTurnIndex: 0, combatants: [] },
  crawling: { isActive: false, round: 0, currentTurnIndex: 0, turnOrder: [], inTotalDarkness: false, encounterLog: [], encounterFlash: false },
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
  media: { currentFile: null, fileType: null, isShowing: false, folderPath: '', files: [] },
  announcement: { text: '', isShowing: false, timer: null }
}

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)

  useEffect(() => {
    const cleanup = window.playerAPI.onStateUpdate((newState: AppState) => {
      setState({
        ...newState,
        announcement: newState.announcement ?? INITIAL_STATE.announcement
      })
    })
    return cleanup
  }, [])

  return (
    <div className="player-app">
      <PlayerMedia media={state.media} location={state.location} />
      <PlayerCrawling crawling={state.crawling} combatIsActive={state.combat.isActive} />
      <PlayerCombat combat={state.combat} />
      <PlayerTorch torch={state.torch} isCamping={state.location.isCamping} hasCampfire={state.location.isCamping && state.location.hasCampfire} combatIsActive={state.combat.isActive} crawlingIsActive={state.crawling.isActive} />
      <PlayerWatchOrder location={state.location} />
      <PlayerLocation location={state.location} />
      <PlayerAnnouncement announcement={state.announcement} />
    </div>
  )
}
