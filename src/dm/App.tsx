import React, { useEffect, useCallback, useRef, useMemo } from 'react'
import { useTorch } from './hooks/useTorch'
import { useCombat } from './hooks/useCombat'
import { useLocation } from './hooks/useLocation'
import { useMedia } from './hooks/useMedia'
import { useSession } from './hooks/useSession'
import { useTravel } from './hooks/useTravel'
import { TorchPanel } from './components/torch/TorchPanel'
import { CombatPanel } from './components/combat/CombatPanel'
import { LocationPanel } from './components/location/LocationPanel'
import { MediaPanel } from './components/media/MediaPanel'
import { SessionPanel } from './components/session/SessionPanel'
import { TravelPanel } from './components/travel/TravelPanel'
import { DisplaySelector } from './components/display/DisplaySelector'
import type { AppState } from '@shared/types'
import './App.css'

export default function App() {
  const torchHook = useTorch()
  const combatHook = useCombat()
  const locationHook = useLocation()
  const mediaHook = useMedia()
  const travelHook = useTravel()
  const sessionHook = useSession()

  const appState: AppState = useMemo(() => ({
    torch: torchHook.torch,
    combat: combatHook.combat,
    location: locationHook.location,
    media: mediaHook.media,
    travel: travelHook.travel
  }), [torchHook.torch, combatHook.combat, locationHook.location, mediaHook.media, travelHook.travel])

  // Broadcast to player window only when state actually changes
  const prevStateRef = useRef<string>('')
  useEffect(() => {
    const serialized = JSON.stringify(appState)
    if (serialized !== prevStateRef.current) {
      prevStateRef.current = serialized
      window.electronAPI.broadcastState(appState)
    }
  }, [appState])

  const handleLoadSession = useCallback((state: AppState) => {
    torchHook.setTorchState(state.torch)
    combatHook.setCombatState(state.combat)
    locationHook.setLocation(state.location)
    mediaHook.setMedia({ ...state.media, files: state.media.files ?? [] })
    if (state.travel) travelHook.setTravelState(state.travel)
  }, [torchHook.setTorchState, combatHook.setCombatState, locationHook.setLocation, mediaHook.setMedia, travelHook.setTravelState])

  return (
    <div className="dm-app">
      <header className="dm-header">
        <h1 className="app-title">Shadowdark DM</h1>
        <DisplaySelector />
        <SessionPanel
          {...sessionHook}
          currentState={appState}
          onLoad={handleLoadSession}
        />
      </header>

      <main className="dm-main">
        <aside className="dm-sidebar">
          <TorchPanel {...torchHook} />
          <LocationPanel {...locationHook} />
        </aside>

        <section className="dm-center">
          <TravelPanel {...travelHook} />
          <CombatPanel {...combatHook} />
        </section>

        <aside className="dm-right">
          <MediaPanel {...mediaHook} />
        </aside>
      </main>
    </div>
  )
}
