import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTorch } from './hooks/useTorch'
import { useCombat } from './hooks/useCombat'
import { useCrawling } from './hooks/useCrawling'
import { useLocation } from './hooks/useLocation'
import { useMedia } from './hooks/useMedia'
import { useSession } from './hooks/useSession'
import { useAmbiance } from './hooks/useAmbiance'
import { useAnnouncement } from './hooks/useAnnouncement'
import { useRoster } from './hooks/useRoster'
import { useSavedLocations } from './hooks/useSavedLocations'
import { usePlayerFontScale } from './hooks/usePlayerFontScale'
import { TorchPanel } from './components/torch/TorchPanel'
import { LocationSidebar } from './components/location/LocationSidebar'
import { CombatPanel } from './components/combat/CombatPanel'
import { CrawlingPanel } from './components/crawling/CrawlingPanel'
import { TravelTab } from './components/travel/TravelTab'
import { MediaPanel } from './components/media/MediaPanel'
import { SessionModal } from './components/session/SessionModal'
import { DisplaySelector } from './components/display/DisplaySelector'
import { PlayerFontControl } from './components/display/PlayerFontControl'
import { TabBar, type TabDef } from './components/tabs/TabBar'
import { AnnouncementControls } from './components/announcement/AnnouncementControls'
import { YouTubeEmbed } from './components/ambiance/YouTubeEmbed'
import { MiniPlayerBar } from './components/ambiance/MiniPlayerBar'
import type { AppState } from '@shared/types'
import { createDefaultTimer } from '@shared/constants'
import './App.css'

type TabId = 'combat' | 'crawling' | 'travel' | 'media'

export default function App() {
  const torchHook = useTorch()
  const combatHook = useCombat()
  const crawlingHook = useCrawling()
  const locationHook = useLocation()
  const mediaHook = useMedia()
  const sessionHook = useSession()
  const ambianceHook = useAmbiance()
  const announcementHook = useAnnouncement()
  const rosterHook = useRoster()
  const savedLocationsHook = useSavedLocations()
  const playerFontScaleHook = usePlayerFontScale()

  const [activeTab, setActiveTab] = useState<TabId>('combat')
  const [sessionModalOpen, setSessionModalOpen] = useState(false)

  const appState: AppState = useMemo(() => ({
    torch: torchHook.torchState,
    combat: combatHook.combat,
    crawling: crawlingHook.crawling,
    location: locationHook.location,
    media: mediaHook.media,
    announcement: announcementHook.announcement,
    playerFontScale: playerFontScaleHook.scale
  }), [torchHook.torchState, combatHook.combat, crawlingHook.crawling, locationHook.location, mediaHook.media, announcementHook.announcement, playerFontScaleHook.scale])

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
    if (state.crawling) {
      crawlingHook.setCrawlingState({ pendingEncounterCheck: false, ...state.crawling })
    }
    locationHook.setLocation(state.location)
    mediaHook.setMedia({ ...state.media, files: state.media.files ?? [] })
  }, [torchHook.setTorchState, combatHook.setCombatState, crawlingHook.setCrawlingState, locationHook.setLocation, mediaHook.setMedia])

  // Sync total darkness with torch state: if all torches go out during a crawl,
  // automatically set inTotalDarkness so danger level jumps to deadly
  useEffect(() => {
    if (crawlingHook.crawling.isActive) {
      crawlingHook.setTotalDarkness(torchHook.allExtinguished)
    }
  }, [torchHook.allExtinguished, crawlingHook.crawling.isActive])

  // When combat starts, dismiss the encounter flash (crawl pauses during combat)
  // When combat ends, switch back to crawling tab if a crawl is active
  const prevCombatActive = useRef(combatHook.combat.isActive)
  useEffect(() => {
    if (combatHook.combat.isActive && crawlingHook.crawling.encounterFlash) {
      crawlingHook.dismissEncounterFlash()
    }
    if (!combatHook.combat.isActive && prevCombatActive.current && crawlingHook.crawling.isActive) {
      setActiveTab('crawling')
    }
    prevCombatActive.current = combatHook.combat.isActive
  }, [combatHook.combat.isActive])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case '1': setActiveTab('combat'); break
        case '2': setActiveTab('crawling'); break
        case '3': setActiveTab('travel'); break
        case '4': setActiveTab('media'); break
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
      id: 'crawling',
      label: 'Crawling',
      icon: '🕯',
      badge: crawlingHook.crawling.isActive ? `R${crawlingHook.crawling.round}` : null,
      badgeColor: crawlingHook.crawling.isActive ? '#b8a060' : undefined,
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
      badge: mediaHook.media.isShowing
        ? (ambianceHook.ambiance.isPlaying ? '🖼🎵' : '1')
        : (ambianceHook.ambiance.isPlaying ? '🎵' : null),
    }
  ], [combatHook.combat.isActive, combatHook.combat.round, crawlingHook.crawling.isActive, crawlingHook.crawling.round, locationHook.location.activity, locationHook.location.hexesRemaining, mediaHook.media.isShowing, ambianceHook.ambiance.isPlaying])

  return (
    <div className="dm-app">
      <YouTubeEmbed containerRef={ambianceHook.playerContainerRef} />
      <header className="dm-header">
        <h1 className="app-title">DM Companion</h1>
        <AnnouncementControls announcementHook={announcementHook} />
        <PlayerFontControl fontScaleHook={playerFontScaleHook} />
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
            savedLocationsHook={savedLocationsHook}
          />
        </aside>

        <div className="dm-content">
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={id => setActiveTab(id as TabId)} />
          <div className="tab-panel">
            {activeTab === 'combat' && <CombatPanel {...combatHook} rosterHook={rosterHook} />}
            {activeTab === 'crawling' && (
              <CrawlingPanel
                crawlingHook={crawlingHook}
                rosterHook={rosterHook}
                dangerLevel={locationHook.location.dangerLevel}
              />
            )}
            {activeTab === 'travel' && (
              <TravelTab
                location={locationHook.location}
                activeParty={rosterHook.activeParty}
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
                setWatches={locationHook.setWatches}
              />
            )}
            {activeTab === 'media' && <MediaPanel {...mediaHook} ambianceHook={ambianceHook} />}
          </div>
        </div>
      </main>

      <MiniPlayerBar ambianceHook={ambianceHook} />

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
