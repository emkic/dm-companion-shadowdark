import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTorch } from './hooks/useTorch'
import { useCombat } from './hooks/useCombat'
import { useLocation } from './hooks/useLocation'
import { useMedia } from './hooks/useMedia'
import { useSession } from './hooks/useSession'
import { TorchPanel } from './components/torch/TorchPanel'
import { LocationSidebar } from './components/location/LocationSidebar'
import { CombatPanel } from './components/combat/CombatPanel'
import { TravelTab } from './components/travel/TravelTab'
import { MediaPanel } from './components/media/MediaPanel'
import { SessionModal } from './components/session/SessionModal'
import { DisplaySelector } from './components/display/DisplaySelector'
import { TabBar, type TabDef } from './components/tabs/TabBar'
import type { AppState } from '@shared/types'
import { createDefaultTimer } from '@shared/constants'
import './App.css'

type TabId = 'combat' | 'travel' | 'media'

export default function App() {
  const torchHook = useTorch()
  const combatHook = useCombat()
  const locationHook = useLocation()
  const mediaHook = useMedia()
  const sessionHook = useSession()

  const [activeTab, setActiveTab] = useState<TabId>('combat')
  const [sessionModalOpen, setSessionModalOpen] = useState(false)

  const appState: AppState = useMemo(() => ({
    torch: torchHook.torchState,
    combat: combatHook.combat,
    location: locationHook.location,
    media: mediaHook.media
  }), [torchHook.torchState, combatHook.combat, locationHook.location, mediaHook.media])

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
    // Backward compatibility: old saves have flat TorchState, new saves have { timers: [...] }
    if ('timers' in state.torch && Array.isArray((state.torch as any).timers)) {
      torchHook.setTorchState(state.torch)
    } else {
      const old = state.torch as any
      torchHook.setTorchState({
        timers: [{
          ...createDefaultTimer(),
          lightMode: old.lightMode ?? 'torch',
          timeLeft: old.timeLeft ?? 3600,
          isExtinguished: old.isExtinguished ?? false,
          hideTimerFromPlayer: old.hideTimerFromPlayer ?? false
        }]
      })
    }
    combatHook.setCombatState(state.combat)
    locationHook.setLocation(state.location)
    mediaHook.setMedia({ ...state.media, files: state.media.files ?? [] })
  }, [torchHook.setTorchState, combatHook.setCombatState, locationHook.setLocation, mediaHook.setMedia])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case '1': setActiveTab('combat'); break
        case '2': setActiveTab('travel'); break
        case '3': setActiveTab('media'); break
        case ' ': {
          e.preventDefault()
          const firstTimer = torchHook.torchState.timers.find(t => t.lightMode !== 'natural')
          if (!firstTimer) break
          if (firstTimer.isRunning) torchHook.stop(firstTimer.id)
          else torchHook.start(firstTimer.id)
          break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [torchHook.torchState.timers, torchHook.start, torchHook.stop])

  // Tab definitions with badges
  const tabs: TabDef[] = useMemo(() => [
    {
      id: 'combat',
      label: 'Combat',
      icon: '⚔',
      badge: combatHook.combat.isActive ? `R${combatHook.combat.round}` : null,
      badgeColor: combatHook.combat.isActive ? '#c87070' : undefined,
    },
    {
      id: 'travel',
      label: 'Travel',
      icon: '🗺',
      badge: locationHook.location.activity === 'traveling' ? `${locationHook.location.hexesRemaining} hex` : null,
      badgeColor: locationHook.location.hexesRemaining === 0 ? '#c87070' : undefined,
    },
    {
      id: 'media',
      label: 'Media',
      icon: '🖼',
      badge: mediaHook.media.isShowing ? '1' : null,
    }
  ], [combatHook.combat.isActive, combatHook.combat.round, locationHook.location.activity, locationHook.location.hexesRemaining, mediaHook.media.isShowing])

  return (
    <div className="dm-app">
      <header className="dm-header">
        <h1 className="app-title">DM Companion</h1>
        <DisplaySelector />
        <button
          className="btn btn-ghost btn-small"
          onClick={() => setSessionModalOpen(true)}
        >
          💾 Sessions
        </button>
      </header>

      <main className="dm-main">
        <aside className="dm-sidebar">
          <TorchPanel torchHook={torchHook} />
          <LocationSidebar
            location={locationHook.location}
            setName={locationHook.setName}
            setSeason={locationHook.setSeason}
            setWeather={locationHook.setWeather}
            setDangerLevel={locationHook.setDangerLevel}
            setImagePath={locationHook.setImagePath}
            toggleShowToPlayer={locationHook.toggleShowToPlayer}
            setDate={locationHook.setDate}
            toggleShowDate={locationHook.toggleShowDate}
          />
        </aside>

        <div className="dm-content">
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={id => setActiveTab(id as TabId)} />
          <div className="tab-panel">
            {activeTab === 'combat' && <CombatPanel {...combatHook} />}
            {activeTab === 'travel' && (
              <TravelTab
                location={locationHook.location}
                setActivity={locationHook.setActivity}
                newDay={locationHook.newDay}
                setTravelMethod={locationHook.setTravelMethod}
                togglePushing={locationHook.togglePushing}
                spendHexes={locationHook.spendHexes}
                toggleChecklist={locationHook.toggleChecklist}
                toggleCamping={locationHook.toggleCamping}
                toggleCampfire={locationHook.toggleCampfire}
                setWatchName={locationHook.setWatchName}
                toggleWatchEncounter={locationHook.toggleWatchEncounter}
                reorderWatches={locationHook.reorderWatches}
              />
            )}
            {activeTab === 'media' && <MediaPanel {...mediaHook} />}
          </div>
        </div>
      </main>

      {sessionModalOpen && (
        <SessionModal
          {...sessionHook}
          currentState={appState}
          onLoad={handleLoadSession}
          onClose={() => setSessionModalOpen(false)}
        />
      )}
    </div>
  )
}
