// YouTube IFrame Player API type declarations
// https://developers.google.com/youtube/iframe_api_reference

declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }

  interface PlayerEvent {
    target: Player
    data: number
  }

  interface VideoData {
    video_id: string
    title: string
    author: string
  }

  interface PlayerOptions {
    height?: number | string
    width?: number | string
    videoId?: string
    playerVars?: Record<string, unknown>
    events?: {
      onReady?: (event: PlayerEvent) => void
      onStateChange?: (event: PlayerEvent) => void
      onError?: (event: PlayerEvent) => void
    }
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions)
    loadVideoById(videoId: string, startSeconds?: number): void
    loadPlaylist(playlist: string | string[], index?: number, startSeconds?: number): void
    loadPlaylist(config: { list: string; listType: string; index?: number; startSeconds?: number }): void
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    nextVideo(): void
    previousVideo(): void
    setVolume(volume: number): void
    getVolume(): number
    setShuffle(shufflePlaylist: boolean): void
    setLoop(loopPlaylists: boolean): void
    getPlayerState(): PlayerState
    getVideoData(): VideoData
    getCurrentTime(): number
    getDuration(): number
    destroy(): void
  }
}

interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady: (() => void) | undefined
}
