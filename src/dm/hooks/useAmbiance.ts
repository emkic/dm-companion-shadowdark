import { useState, useEffect, useCallback, useRef } from 'react'
import type { MoodPreset, AmbianceState } from '@shared/types'

// ── YouTube URL parsing ────────────────────────────────────────────

function parseYouTubeUrl(url: string): { type: 'playlist'; id: string } | { type: 'video'; id: string } | null {
  if (!url) return null
  let cleaned = url.trim()
  if (!cleaned) return null
  // Auto-prepend protocol if missing (users often paste "youtube.com/watch?v=…")
  if (!/^https?:\/\//i.test(cleaned)) cleaned = 'https://' + cleaned
  try {
    const u = new URL(cleaned)
    if (!/(^|\.)youtube\.com$/i.test(u.hostname) && u.hostname.toLowerCase() !== 'youtu.be') return null
    // Playlist: ?list=PLxxxx
    const list = u.searchParams.get('list')
    if (list) return { type: 'playlist', id: list }
    // Video: /watch?v=xxx or youtu.be/xxx
    const v = u.searchParams.get('v')
    if (v) return { type: 'video', id: v }
    if (u.hostname.toLowerCase() === 'youtu.be') {
      const id = u.pathname.slice(1)
      if (id) return { type: 'video', id }
    }
    // /embed/xxx or /shorts/xxx
    const embedMatch = u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)
    if (embedMatch) return { type: 'video', id: embedMatch[1] }
    return null
  } catch {
    return null
  }
}

// Exposed so the editor can give live validation feedback
export function isValidYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url) !== null
}

function youTubeErrorMessage(code: number): string {
  switch (code) {
    case 2: return 'Invalid YouTube URL.'
    case 5: return 'YouTube HTML5 player error.'
    case 100: return 'Video not found or private.'
    case 101:
    case 150: return 'This video has embedding disabled by the uploader. Try a different video or playlist.'
    default: return `YouTube playback error (code ${code}).`
  }
}

// ── YouTube IFrame API loader (singleton) ──────────────────────────

let ytApiPromise: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise<void>((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }
    let settled = false
    const finish = (err?: Error) => {
      if (settled) return
      settled = true
      if (err) { ytApiPromise = null; reject(err) } else resolve()
    }
    window.onYouTubeIframeAPIReady = () => finish()
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.onerror = () => finish(new Error('Failed to load YouTube IFrame API script'))
    document.head.appendChild(tag)
    // 15s timeout — covers slow/blocked networks without waiting forever
    setTimeout(() => finish(new Error('YouTube IFrame API load timed out (15s)')), 15000)
  })
  return ytApiPromise
}

// ── Shuffle helper ─────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ── Hook return type ───────────────────────────────────────────────

export interface UseAmbianceReturn {
  ambiance: AmbianceState
  presets: MoodPreset[]
  isApiReady: boolean
  apiLoadError: string | null
  lastError: string | null
  clearError: () => void
  localPlaylist: string[]
  localTrackIndex: number
  playMood: (moodId: string) => void
  playTrack: (index: number) => void
  togglePlayPause: () => void
  skip: () => void
  stop: () => void
  setVolume: (volume: number) => void
  toggleFavorite: (moodId: string) => void
  savePresets: (presets: MoodPreset[]) => Promise<void>
  playerContainerRef: React.RefObject<HTMLDivElement | null>
}

// ── Helper: check if a mood has playable content ───────────────────

export function moodHasContent(mood: MoodPreset): boolean {
  if (mood.source === 'local') return mood.audioFiles.length > 0
  return !!mood.youtubeUrl
}

// ── useAmbiance hook ───────────────────────────────────────────────

export function useAmbiance(): UseAmbianceReturn {
  const [presets, setPresets] = useState<MoodPreset[]>([])
  const [ambiance, setAmbiance] = useState<AmbianceState>({
    isPlaying: false,
    currentMoodId: null,
    currentTrackTitle: '',
    volume: 70
  })
  const [isApiReady, setIsApiReady] = useState(false)
  const [apiLoadError, setApiLoadError] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  const playerRef = useRef<YT.Player | null>(null)
  const playerContainerRef = useRef<HTMLDivElement | null>(null)
  const titlePollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ytSourceTypeRef = useRef<'playlist' | 'video' | null>(null)

  // Local audio refs + reactive state for UI
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const localPlaylistRef = useRef<string[]>([])
  const localTrackIndexRef = useRef(0)
  const [localPlaylist, setLocalPlaylist] = useState<string[]>([])
  const [localTrackIndex, setLocalTrackIndex] = useState(0)

  // Load presets and volume from store on mount
  useEffect(() => {
    window.electronAPI.loadMoodPresets().then((loaded) => {
      // Migrate old presets that lack source/audioFiles
      const migrated = loaded.map(p => ({
        ...p,
        source: p.source ?? 'youtube' as const,
        audioFiles: p.audioFiles ?? []
      }))
      setPresets(migrated)
    })
    window.electronAPI.loadAmbianceVolume().then(vol => {
      setAmbiance(prev => ({ ...prev, volume: vol }))
    })
  }, [])

  // Load YouTube API on mount
  useEffect(() => {
    loadYouTubeApi().then(
      () => setIsApiReady(true),
      (err: Error) => {
        console.error('[Ambiance] YouTube API failed to load:', err)
        setApiLoadError(err.message)
      }
    )
  }, [])

  // Create YT.Player once API is ready and container exists
  useEffect(() => {
    if (!isApiReady || !playerContainerRef.current || playerRef.current) return

    playerRef.current = new YT.Player(playerContainerRef.current, {
      height: 300,
      width: 400,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onStateChange: (event) => {
          const state = event.data
          if (state === YT.PlayerState.PLAYING) {
            startTitlePoll()
          } else if (state === YT.PlayerState.ENDED) {
            if (ytSourceTypeRef.current === 'video' && playerRef.current) {
              playerRef.current.seekTo(0, true)
              playerRef.current.playVideo()
              return
            }
            setAmbiance(prev => ({ ...prev, isPlaying: false, currentTrackTitle: '' }))
            stopTitlePoll()
          } else if (state === YT.PlayerState.PAUSED) {
            setAmbiance(prev => ({ ...prev, isPlaying: false }))
          }
        },
        onError: (event) => {
          const code = typeof event.data === 'number' ? event.data : -1
          const message = youTubeErrorMessage(code)
          console.error('[Ambiance] YouTube player error', code, message)
          setLastError(message)
          // For playlists, try to skip past the unplayable item
          if (ytSourceTypeRef.current === 'playlist') {
            playerRef.current?.nextVideo()
          }
        }
      }
    })
  }, [isApiReady])

  // Create HTML audio element on mount
  useEffect(() => {
    const audio = new Audio()
    audio.addEventListener('ended', () => {
      // Advance to next track in local playlist
      const playlist = localPlaylistRef.current
      if (playlist.length === 0) return
      const nextIndex = (localTrackIndexRef.current + 1) % playlist.length
      localTrackIndexRef.current = nextIndex
      setLocalTrackIndex(nextIndex)
      audio.src = `media:///${playlist[nextIndex]}`
      audio.play()
      setAmbiance(prev => ({
        ...prev,
        currentTrackTitle: fileNameFromPath(playlist[nextIndex])
      }))
    })
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const startTitlePoll = useCallback(() => {
    stopTitlePoll()
    titlePollRef.current = setInterval(() => {
      if (!playerRef.current) return
      try {
        const state = playerRef.current.getPlayerState()
        const playing = state === YT.PlayerState.PLAYING
        const data = playerRef.current.getVideoData()
        if (data?.title) {
          setAmbiance(prev =>
            prev.currentTrackTitle !== data.title || prev.isPlaying !== playing
              ? { ...prev, currentTrackTitle: data.title, isPlaying: playing }
              : prev
          )
        }
      } catch { /* player not ready */ }
    }, 1500)
  }, [])

  const stopTitlePoll = useCallback(() => {
    if (titlePollRef.current) {
      clearInterval(titlePollRef.current)
      titlePollRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTitlePoll()
      playerRef.current?.destroy()
    }
  }, [stopTitlePoll])

  // Fade volume from current to target over duration (ms)
  const fadeVolume = useCallback((from: number, to: number, duration: number): Promise<void> => {
    return new Promise(resolve => {
      const steps = 10
      const stepTime = duration / steps
      const delta = (to - from) / steps
      let step = 0
      const interval = setInterval(() => {
        step++
        const vol = Math.round(from + delta * step)
        playerRef.current?.setVolume(Math.max(0, Math.min(100, vol)))
        if (step >= steps) {
          clearInterval(interval)
          resolve()
        }
      }, stepTime)
    })
  }, [])

  // Fade for local audio element
  const fadeLocalVolume = useCallback((from: number, to: number, duration: number): Promise<void> => {
    return new Promise(resolve => {
      const audio = audioRef.current
      if (!audio) { resolve(); return }
      const steps = 10
      const stepTime = duration / steps
      const delta = (to - from) / steps
      let step = 0
      const interval = setInterval(() => {
        step++
        const vol = Math.max(0, Math.min(1, (from + delta * step) / 100))
        audio.volume = vol
        if (step >= steps) {
          clearInterval(interval)
          resolve()
        }
      }, stepTime)
    })
  }, [])

  // Stop whichever source is currently playing
  const stopCurrentSource = useCallback(() => {
    playerRef.current?.stopVideo()
    ytSourceTypeRef.current = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    stopTitlePoll()
    localPlaylistRef.current = []
    setLocalPlaylist([])
    setLocalTrackIndex(0)
  }, [stopTitlePoll])

  const loadYouTubeMood = useCallback((mood: MoodPreset, masterVolume: number) => {
    if (!playerRef.current) {
      const msg = apiLoadError
        ? `YouTube player unavailable: ${apiLoadError}`
        : 'YouTube player is still loading. Try again in a moment.'
      console.warn('[Ambiance]', msg)
      setLastError(msg)
      return
    }
    const parsed = parseYouTubeUrl(mood.youtubeUrl)
    if (!parsed) {
      const msg = `Invalid YouTube URL: "${mood.youtubeUrl}". Use a youtube.com or youtu.be link.`
      console.warn('[Ambiance]', msg)
      setLastError(msg)
      return
    }
    setLastError(null)

    const effectiveVolume = Math.round((mood.volume / 100) * (masterVolume / 100) * 100)
    ytSourceTypeRef.current = parsed.type

    if (parsed.type === 'playlist') {
      playerRef.current.loadPlaylist({ list: parsed.id, listType: 'playlist' })
      setTimeout(() => {
        playerRef.current?.setShuffle(mood.shuffle)
        playerRef.current?.setLoop(true)
      }, 500)
    } else {
      playerRef.current.loadVideoById(parsed.id)
    }

    playerRef.current.setVolume(0)
    setTimeout(() => fadeVolume(0, effectiveVolume, 400), 300)
  }, [fadeVolume, apiLoadError])

  const loadLocalMood = useCallback((mood: MoodPreset, masterVolume: number) => {
    const audio = audioRef.current
    if (!audio || mood.audioFiles.length === 0) return
    setLastError(null)

    const playlist = mood.shuffle ? shuffleArray(mood.audioFiles) : [...mood.audioFiles]
    localPlaylistRef.current = playlist
    localTrackIndexRef.current = 0
    setLocalPlaylist(playlist)
    setLocalTrackIndex(0)

    const effectiveVolume = (mood.volume / 100) * (masterVolume / 100)
    audio.volume = 0
    audio.src = `media:///${playlist[0]}`
    audio.loop = playlist.length === 1
    audio.play()

    setAmbiance(prev => ({
      ...prev,
      currentTrackTitle: fileNameFromPath(playlist[0])
    }))

    // Fade in
    setTimeout(() => fadeLocalVolume(0, effectiveVolume * 100, 400), 300)
  }, [fadeLocalVolume])

  const playMood = useCallback((moodId: string) => {
    const mood = presets.find(p => p.id === moodId)
    if (!mood || !moodHasContent(mood)) return

    const isCurrentlyPlaying = ambiance.currentMoodId && ambiance.isPlaying
    const currentMood = presets.find(p => p.id === ambiance.currentMoodId)

    setAmbiance(prev => ({
      ...prev,
      isPlaying: true,
      currentMoodId: moodId,
      currentTrackTitle: ''
    }))

    const loadNewMood = () => {
      stopCurrentSource()
      if (mood.source === 'local') {
        loadLocalMood(mood, ambiance.volume)
      } else {
        loadYouTubeMood(mood, ambiance.volume)
      }
    }

    if (isCurrentlyPlaying && currentMood) {
      // Crossfade out current source
      if (currentMood.source === 'local' && audioRef.current) {
        fadeLocalVolume(audioRef.current.volume * 100, 0, 400).then(loadNewMood)
      } else if (playerRef.current) {
        const currentVol = playerRef.current.getVolume()
        fadeVolume(currentVol, 0, 400).then(loadNewMood)
      } else {
        loadNewMood()
      }
    } else {
      loadNewMood()
    }
  }, [presets, ambiance.volume, ambiance.currentMoodId, ambiance.isPlaying, fadeVolume, fadeLocalVolume, loadYouTubeMood, loadLocalMood, stopCurrentSource])

  const togglePlayPause = useCallback(() => {
    const currentMood = presets.find(p => p.id === ambiance.currentMoodId)
    if (!currentMood) return

    if (currentMood.source === 'local') {
      const audio = audioRef.current
      if (!audio) return
      if (ambiance.isPlaying) {
        audio.pause()
        setAmbiance(prev => ({ ...prev, isPlaying: false }))
      } else {
        audio.play()
        setAmbiance(prev => ({ ...prev, isPlaying: true }))
      }
    } else {
      if (!playerRef.current) return
      const state = playerRef.current.getPlayerState()
      if (state === YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo()
        setAmbiance(prev => ({ ...prev, isPlaying: false }))
      } else {
        playerRef.current.playVideo()
        setAmbiance(prev => ({ ...prev, isPlaying: true }))
      }
    }
  }, [presets, ambiance.currentMoodId, ambiance.isPlaying])

  const skip = useCallback(() => {
    const currentMood = presets.find(p => p.id === ambiance.currentMoodId)
    if (!currentMood) return

    if (currentMood.source === 'local') {
      const audio = audioRef.current
      const playlist = localPlaylistRef.current
      if (!audio || playlist.length === 0) return
      const nextIndex = (localTrackIndexRef.current + 1) % playlist.length
      localTrackIndexRef.current = nextIndex
      setLocalTrackIndex(nextIndex)
      audio.src = `media:///${playlist[nextIndex]}`
      audio.play()
      setAmbiance(prev => ({
        ...prev,
        currentTrackTitle: fileNameFromPath(playlist[nextIndex])
      }))
    } else {
      playerRef.current?.nextVideo()
    }
  }, [presets, ambiance.currentMoodId])

  const stop = useCallback(() => {
    stopCurrentSource()
    setAmbiance(prev => ({
      ...prev,
      isPlaying: false,
      currentMoodId: null,
      currentTrackTitle: ''
    }))
  }, [stopCurrentSource])

  const setVolume = useCallback((volume: number) => {
    setAmbiance(prev => {
      const mood = presets.find(p => p.id === prev.currentMoodId)
      const moodVol = mood?.volume ?? 100
      const effective = Math.round((moodVol / 100) * (volume / 100) * 100)

      if (mood?.source === 'local' && audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, effective / 100))
      } else {
        playerRef.current?.setVolume(effective)
      }

      return { ...prev, volume }
    })
    window.electronAPI.saveAmbianceVolume(volume)
  }, [presets])

  const toggleFavorite = useCallback((moodId: string) => {
    setPresets(prev => {
      const updated = prev.map(p => p.id === moodId ? { ...p, favorite: !p.favorite } : p)
      window.electronAPI.saveMoodPresets(updated)
      return updated
    })
  }, [])

  const savePresets = useCallback(async (newPresets: MoodPreset[]) => {
    setPresets(newPresets)
    await window.electronAPI.saveMoodPresets(newPresets)
  }, [])

  const clearError = useCallback(() => setLastError(null), [])

  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current
    const playlist = localPlaylistRef.current
    if (!audio || playlist.length === 0 || index < 0 || index >= playlist.length) return
    localTrackIndexRef.current = index
    setLocalTrackIndex(index)
    audio.src = `media:///${playlist[index]}`
    audio.play()
    setAmbiance(prev => ({
      ...prev,
      isPlaying: true,
      currentTrackTitle: fileNameFromPath(playlist[index])
    }))
  }, [])

  return {
    ambiance,
    presets,
    isApiReady,
    apiLoadError,
    lastError,
    clearError,
    localPlaylist,
    localTrackIndex,
    playMood,
    playTrack,
    togglePlayPause,
    skip,
    stop,
    setVolume,
    toggleFavorite,
    savePresets,
    playerContainerRef
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function fileNameFromPath(filePath: string): string {
  const name = filePath.split(/[\\/]/).pop() ?? filePath
  // Strip extension
  return name.replace(/\.[^.]+$/, '')
}
