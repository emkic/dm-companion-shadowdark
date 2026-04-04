# Ambiance Music Player — Implementation Plan

## Overview

Add an ambiance/music player to the **Media tab** in the DM panel. The player supports
two audio sources: **YouTube playlists** (via IFrame Player API) and **Tabletop Audio**
(via their `tta_data` JSON endpoint, pending permission from the creator).

DMs configure **mood presets** (Combat, Tavern, Dungeon, etc.) that each link to a
playlist or set of tracks. During play, one click switches the mood and the music follows.

---

## Architecture

### New files to create

```
src/shared/types.ts           — extend with ambiance types (see below)
src/dm/hooks/useAmbiance.ts   — state + logic for the ambiance player
src/dm/components/media/
  AmbiancePlayer.tsx           — main ambiance UI (mood buttons + controls)
  AmbiancePlayer.css           — styles
  MoodEditor.tsx               — modal for editing mood presets
  MoodEditor.css               — styles
  YouTubeEmbed.tsx             — hidden YouTube iframe wrapper
  TabletopAudioBrowser.tsx     — browse/search TTA catalog (Phase 2)
```

### Existing files to modify

```
src/shared/types.ts            — add AmbianceState, MoodPreset types
src/dm/components/media/MediaPanel.tsx  — split into image section + ambiance section
src/dm/components/media/MediaPanel.css  — layout for the two sections
src/dm/hooks/useMedia.ts       — (no change, stays focused on images)
src/dm/App.tsx                 — create useAmbiance hook, pass to MediaPanel
electron/store/store.ts        — add mood presets to store schema
electron/preload.ts            — expose IPC for saving/loading mood presets
electron/ipc/ipc-handlers.ts   — add handlers for mood preset CRUD
```

---

## Phase 1: YouTube Player + Mood Presets

### Step 1 — Types

Add to `src/shared/types.ts`:

```ts
export type AudioSource = 'youtube' | 'tabletopaudio'

export interface MoodPreset {
  id: string
  name: string            // "Combat", "Tavern", etc.
  color: string           // hex color for the button
  source: AudioSource
  youtubeUrl: string      // YouTube playlist or video URL (when source = 'youtube')
  ttaTracks: string[]     // TTA track keys (when source = 'tabletopaudio') — Phase 2
  volume: number          // 0–100, default 50
  shuffle: boolean        // shuffle playlist
}

export interface AmbianceState {
  isPlaying: boolean
  activeMoodId: string | null
  volume: number          // master volume 0–100
}
```

Do NOT add AmbianceState to AppState/session saves yet — music state is ephemeral
and shouldn't persist across sessions. MoodPresets are saved separately via electron-store.

### Step 2 — Electron Store for Mood Presets

In `electron/store/store.ts`, add a `moodPresets` key to the store schema:

```ts
interface StoreSchema {
  sessions: Record<string, SessionData>
  moodPresets: MoodPreset[]
}
```

Add CRUD functions:
- `getMoodPresets(): MoodPreset[]`
- `saveMoodPresets(presets: MoodPreset[]): void`

Ship with **default presets** (name + color only, no URLs):

```ts
const DEFAULT_MOODS: MoodPreset[] = [
  { id: '1', name: 'Combat',    color: '#c84040', source: 'youtube', youtubeUrl: '', ttaTracks: [], volume: 70, shuffle: true },
  { id: '2', name: 'Suspense',  color: '#8a5ca8', source: 'youtube', youtubeUrl: '', ttaTracks: [], volume: 50, shuffle: true },
  { id: '3', name: 'Mystery',   color: '#4a6fa5', source: 'youtube', youtubeUrl: '', ttaTracks: [], volume: 40, shuffle: true },
  { id: '4', name: 'Town',      color: '#6a9955', source: 'youtube', youtubeUrl: '', ttaTracks: [], volume: 50, shuffle: true },
  { id: '5', name: 'Forest',    color: '#3d7a3d', source: 'youtube', youtubeUrl: '', ttaTracks: [], volume: 45, shuffle: true },
  { id: '6', name: 'Dungeon',   color: '#6b6b6b', source: 'youtube', youtubeUrl: '', ttaTracks: [], volume: 50, shuffle: true },
  { id: '7', name: 'Tavern',    color: '#c8a04b', source: 'youtube', youtubeUrl: '', ttaTracks: [], volume: 60, shuffle: true },
]
```

### Step 3 — IPC + Preload

Add IPC channels in `electron/ipc/ipc-handlers.ts`:
- `mood:get-all` → returns `getMoodPresets()`
- `mood:save-all` → calls `saveMoodPresets(presets)`

Expose in `electron/preload.ts`:
- `getMoodPresets(): Promise<MoodPreset[]>`
- `saveMoodPresets(presets: MoodPreset[]): Promise<void>`

### Step 4 — useAmbiance Hook

`src/dm/hooks/useAmbiance.ts`:

```ts
export interface UseAmbianceReturn {
  moods: MoodPreset[]
  activeMoodId: string | null
  isPlaying: boolean
  volume: number
  playMood: (moodId: string) => void
  stop: () => void
  setVolume: (v: number) => void
  updateMoods: (moods: MoodPreset[]) => void
  playerRef: React.RefObject<YT.Player | null>
}
```

Key logic:
- On mount, load moods from electron-store via IPC
- `playMood()` — set active mood, extract YouTube video/playlist ID from URL,
  load it into the YT player via `playerRef.current.loadPlaylist()` or `loadVideoById()`
- `stop()` — pause player, clear active mood
- `setVolume()` — update player volume + state
- When switching moods, briefly fade volume over ~500ms before loading new playlist

### Step 5 — YouTubeEmbed Component

`src/dm/components/media/YouTubeEmbed.tsx`:

A hidden (0x0 or offscreen) iframe that loads the YouTube IFrame Player API.

```tsx
// Loads https://www.youtube.com/iframe_api script once
// Creates a YT.Player instance
// Exposes the player via ref/callback so useAmbiance can control it
// Hidden from view — no visible YouTube UI
```

YouTube IFrame API key methods we'll use:
- `loadPlaylist({ list, listType: 'playlist' })`
- `loadVideoById(videoId)`
- `playVideo()`, `pauseVideo()`, `stopVideo()`
- `nextVideo()`, `previousVideo()`
- `setVolume(0–100)`
- `setShuffle(boolean)`

URL parsing helper needed:
- Extract playlist ID from `youtube.com/playlist?list=PLxxxxxx`
- Extract video ID from `youtube.com/watch?v=xxxxx`
- Handle `youtu.be/xxxxx` short URLs

### Step 6 — AmbiancePlayer Component

`src/dm/components/media/AmbiancePlayer.tsx`:

```
┌─ Ambiance ─────────────────────────────────────────┐
│                                                     │
│  [⚔ Combat] [⏳ Suspense] [❓ Mystery] [🏰 Town]  │
│  [🌲 Forest] [💀 Dungeon] [🍺 Tavern]             │
│                                                     │
│  ▶ Now Playing: Combat          ◄◄  ❚❚  ►►         │
│  ───────────●────── 🔊 ──●──────                   │
│                                                     │
│  [⚙ Edit Moods]                                    │
└─────────────────────────────────────────────────────┘
```

- Mood buttons are colored pills/buttons; active one is highlighted
- Clicking an already-active mood toggles pause/play
- Clicking a different mood switches immediately
- Volume slider is a range input
- Skip prev/next buttons for playlists
- "Edit Moods" opens the MoodEditor modal
- Unconfigured moods (no URL) show a tooltip: "Right-click or Edit to add a playlist URL"

### Step 7 — MoodEditor Modal

`src/dm/components/media/MoodEditor.tsx`:

A modal (same pattern as SessionModal) where the DM can:
- See all mood presets in a list
- Edit name, color (color picker or preset swatches), YouTube URL, volume, shuffle toggle
- Add new moods, delete existing ones
- Reorder moods (drag to reorder using existing @dnd-kit dependency)
- Source selector: YouTube / Tabletop Audio (TTA disabled until Phase 2)
- Save → persists to electron-store via IPC

### Step 8 — Integrate into MediaPanel

Update `MediaPanel.tsx` to render two sections:

```tsx
<div className="media-panel">
  {/* Existing image/video section */}
  <div className="media-section-images">
    <div className="media-header">...</div>
    {/* existing image grid */}
  </div>

  {/* New ambiance section */}
  <div className="media-section-ambiance">
    <AmbiancePlayer ambianceHook={ambianceHook} />
  </div>
</div>
```

The ambiance section sits below the image section. Both sections should be
independently scrollable if content overflows.

Update `MediaPanel` props to accept `UseAmbianceReturn` in addition to existing media props.

### Step 9 — Wire up in App.tsx

```tsx
const ambianceHook = useAmbiance()

// In the media tab:
{activeTab === 'media' && (
  <MediaPanel {...mediaHook} ambianceHook={ambianceHook} />
)}
```

Update the Media tab badge to also show a music indicator when ambiance is playing:
```ts
badge: mediaHook.media.isShowing
  ? (ambianceHook.isPlaying ? '🖼🎵' : '1')
  : (ambianceHook.isPlaying ? '🎵' : null)
```

---

## Phase 2: Tabletop Audio Integration (pending email response)

Only implement this after receiving permission from gm@tabletopaudio.com.

### Step 10 — TTA Catalog Fetch

Add a utility `src/dm/utils/tabletopaudio.ts`:

```ts
interface TTATrack {
  key: number
  track_title: string
  track_type: string
  track_genre: string[]
  tags: string[]
  flavor_text: string
  link: string           // direct MP3 URL
  small_image: string
  large_image: string
  new: boolean
}

async function fetchCatalog(): Promise<TTATrack[]> {
  const res = await fetch('https://tabletopaudio.com/tta_data')
  return res.json()
}
```

Cache the catalog in memory on first fetch. Refresh on app start.

### Step 11 — TabletopAudioBrowser Component

A browsable/searchable list of TTA tracks, grouped by tags/genre.
The DM can:
- Search by name or tag
- Preview a track (play a few seconds)
- Assign tracks to a mood preset

When a mood with `source: 'tabletopaudio'` is active, play the MP3 directly
using an HTML `<audio>` element instead of the YouTube iframe.

### Step 12 — Audio element for TTA playback

Add an `<audio>` element to AmbiancePlayer that handles TTA tracks:
- `src` set to the TTA MP3 URL
- Same play/pause/volume controls
- Loop the track (TTA ambiences are designed to loop)
- When multiple tracks are assigned to a mood, play sequentially or shuffle

### Step 13 — Attribution

If TTA integration is approved, add visible attribution:
- "Ambiance by Tabletop Audio" with a link to tabletopaudio.com
- Shown in the ambiance player when a TTA track is active
- Also add to the app's About/credits section

---

## Styling Notes

- Match existing dark theme (use CSS variables: `--bg`, `--border`, `--accent`, etc.)
- Mood buttons: rounded pills, ~32px height, colored background at ~20% opacity,
  full opacity + glow when active
- Volume slider: accent-colored track
- Keep the ambiance section compact — it shares space with the image grid
- Use a subtle divider (1px border or spacing) between image and ambiance sections

---

## CSP / Security Notes

- YouTube IFrame API requires allowing `https://www.youtube.com` and
  `https://www.googleapis.com` in the Content Security Policy
- Check `electron/main.ts` for existing CSP headers and update `frame-src` accordingly
- TTA MP3 streaming requires allowing `https://sounds.tabletopaudio.com` in `media-src`
- Never expose raw YouTube API keys; the IFrame API is client-side and keyless

---

## Implementation Order Summary

1. Types (`shared/types.ts`)
2. Store + IPC (electron-side)
3. `useAmbiance` hook
4. `YouTubeEmbed` component
5. `AmbiancePlayer` UI
6. `MoodEditor` modal
7. Wire into `MediaPanel` + `App.tsx`
8. Test: paste a YouTube playlist URL, switch moods, adjust volume
9. Phase 2: TTA integration (after permission)
