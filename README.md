# DM Companion for Shadowdark

A dual-screen desktop app for running [Shadowdark RPG](https://www.thearcanelibrary.com/pages/shadowdark) sessions. The DM controls everything from a private panel while players see only what you choose on a separate fullscreen display.

Built with Electron, React, and TypeScript. Available on **Windows**, **macOS**, and **Linux**.

Published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC.

### At a Glance

- **Dual-screen display** — DM panel on your monitor, fullscreen player view on a projector or TV
- **Combat tracker** — Drag-drop initiative, HP tracking, health estimates, Shadowdark death mechanic
- **Crawling rounds** — Turn order, round tracking, encounter checks by danger level
- **Light source system** — Multiple independent torch timers with pixel-art fire animations and a dramatic darkness overlay
- **Hex crawling & travel** — Hex tracker, daily checklists, camping with watch order, weather reference
- **Ambiance player** — YouTube playlists or local audio, mood presets, crossfade, mini-player bar
- **Media panel** — Display images or videos fullscreen on the player screen
- **Session save/load** — Pick up exactly where you left off

## Download

**[Download the latest release](https://github.com/emkic/dm-companion-shadowdark/releases/latest)**

### Windows
- **DM Companion for Shadowdark Setup.exe** — Installer (per-user, no admin required)
- **DMCompanion-Portable.exe** — Just download and run. No install needed.

> **Note:** Windows SmartScreen may show a warning when you first run the app because it is not code-signed. Click **"More info"** then **"Run anyway"** to proceed. This is normal for unsigned apps and only happens once per downloaded file.

### macOS
- **DMCompanion-mac.zip** — Unzip and drag to Applications.

> **Note:** macOS Gatekeeper may block the app because it is not notarized. Right-click the app, select **"Open"**, then click **"Open"** in the dialog. This is only needed the first time.

### Linux
- **DMCompanion-linux.AppImage** — Portable, runs on any distro. Mark as executable and run.
- **DMCompanion-linux.deb** — Install via `sudo dpkg -i DMCompanion-linux.deb` on Debian/Ubuntu.

<img width="2547" height="1439" alt="image" src="https://github.com/user-attachments/assets/1cd7159a-1b48-4662-9a41-ab615160adfa" />
<img width="2067" height="1308" alt="image" src="https://github.com/user-attachments/assets/7d6d3289-4721-401a-81dd-3d1c215d8d22" />

---

## Features

### Dual-Screen Display

The app runs two windows simultaneously:

- **DM Window** — A private control panel on your main monitor where you manage all game state
- **Player Window** — A fullscreen, borderless display on a second monitor (projector, TV, or external screen) that shows only what you want the players to see
- **Display selector** — Choose which monitor the player window appears on via a dropdown in the DM header. Refresh button to re-detect monitors on the fly.

All changes on the DM side are broadcast to the player screen in real time.

### DM Panel Layout

The DM panel uses a tabbed interface for quick access to everything:

- **Persistent sidebar** — Torch/light controls and location info are always visible on the left
- **Tabbed main area** — Switch between Combat, Crawling, Travel, and Media tabs. Each tab gets full width.
- **Tab badges** — Combat tab shows the current round, Crawling tab shows the crawling round, Travel tab shows hexes remaining, so you always know the state at a glance
- **Keyboard shortcuts** — Press 1/2/3/4 to switch tabs, Space to start/pause the torch timer
- **Session management** — Save/load sessions via a modal dialog (💾 Sessions button in header)

### Combat Tracker

Full initiative and combat management visible to both DM and players:

- **Initiative order** with drag-and-drop reordering or auto-sort by initiative value. Combatants auto-sort by initiative when combat starts.
- **HP tracking** with +5/+1/-1/-5 buttons and click-to-edit for direct input
- **Health estimates** shown to players instead of exact HP numbers: Uninjured, Injured, Bloodied, Near Death, Dying, Dead — each color-coded
- **Previous turn** — Step back a turn if someone forgot something. Death timers reverse correctly when stepping back.
- **Shadowdark death mechanic** — when a player hits 0 HP:
  1. DM sets the death timer (1d4 + CON rounds until permanent death)
  2. Timer ticks automatically on the dying player's turn
  3. If the player rolls a natural 20, click "Nat 20 — Arise!" to revive at 1 HP
  4. Timer expires = permanent death
- **Emoji identifiers** for each combatant so players can quickly tell who is who
- **Duplicate combatant** — quickly copy a combatant to add multiples of the same monster
- Monsters are automatically removed from the tracker when combat ends

### Crawling Rounds

Track dungeon exploration turn-by-turn with built-in encounter check timing:

- **Turn order** — Add player names and reorder via drag-and-drop before or during a crawl
- **Round tracking** — Advancing past the last player automatically starts a new round. Player screen shows the current round and whose turn it is.
- **Encounter checks** — Automatically prompts for a random encounter roll after the last player in the round, based on the area's danger level: every 3 rounds (Unsafe), every 2 rounds (Risky), or every round (Deadly)
- **Total darkness** — When all torches go out during a crawl, danger level automatically jumps to Deadly (encounter check every round). The player screen shows a dramatic darkness overlay that fades out after a few seconds so the turn order stays visible.
- **Reference tables** — Starting distance and monster activity tables appear on-screen when an encounter is triggered

### Light Source System

Track multiple independent light sources simultaneously — perfect for split parties or individual character torches.

- **Multiple timers** — Add as many torch timers as you need. Each has its own countdown, mode, and controls. All visible on both DM and player screens.
- **Editable names** — Label each timer with character names (e.g. "Grondur & Arwin", "Mort & Mirren") so everyone knows whose torch is whose.
- **Torch** — A 60-minute countdown timer. The player screen shows a pixel-art torch flame that dims as time runs out. Warning at 25% remaining. DM can start, pause, reset, and adjust time in custom minute increments.
- **Magical Light** — Same timer behavior as torch, but the player screen shows a crystal ball with a soft pulsing white glow instead of a flame.
- **Natural Light** — Daylight mode with no timer. The torch/crystal ball widget is hidden from the player screen entirely.
- **Per-timer modes** — Each timer can independently be set to Torch, Magical, or Natural. One character can carry a torch while another has magical light.
- **Hide timer from players** — Toggle per timer to hide the countdown from the player screen while keeping the flame/crystal visual. The timer keeps running on the DM screen.

### Torch Extinguish

The DM can extinguish the torch (or magical light) at any time. When extinguished, the entire player screen goes black and three lines fade in one at a time:

> *There is no light.*
>
> *You do not see anything.*
>
> *The living darkness closes in on you.*

The final line pulses in crimson red. The DM can relight at any time to return to normal. When the torch timer reaches zero, the darkness overlay triggers automatically. During combat or crawling, the overlay is replaced with a compact "No light — total darkness" banner so the turn order stays visible.

### Hex Crawling & Travel

<img width="1630" height="1097" alt="image" src="https://github.com/user-attachments/assets/be50d232-7cbb-4395-9e07-2977e8c2dddd" />


Full travel and rest tracking based on the hex crawling rules from **Shadowdark Zine 4: River of Night** (page 26):

- **Three activity modes** — Traveling, Dungeon Crawling, or In City/Village. Each mode shows relevant controls.
- **Travel method** — Walking (4 hex/day), Mounted (6 hex/day), or Sailing (8 hex/day)
- **Hex tracker** — Track hexes remaining per day with buttons for normal (-1) and difficult terrain (-2). Pushing mode gives 1.5x hexes.
- **Daily checklist** — Weather roll, rations consumed, foraging attempt (when not pushing), and 4 random encounter checks (2 day, 2 night)
- **Weather hex reference** — Built-in weather hex flower image (by u/KorbohneD) accessible from the sidebar for quick weather rolls
- **Camping system** — Toggle camping within the traveling state. Includes:
  - **Campfire toggle** — When lit, the player screen shows an animated campfire with "Campfire is lit!" text. When off, shows "The camp is dark."
  - **Watch order** — 4 watch slots with player names and encounter checkboxes, drag-and-drop reordering. Watch order displays as an overlay on the player screen.
- **Date tracking** — Optional date display on the player screen with a New Day button that resets checklist, hexes, and camping state
- **Session persistence** — All travel state saves and loads with sessions

### Location Display

Show the current location on the player screen:

- Location name displayed in large Blackletter font
- Season and weather (19 weather options per season)
- Danger level badge: Unsafe (gold), Risky (orange), or Deadly (red)
- Optional location image shown fullscreen behind all overlays
- Toggle visibility on/off from the DM panel

### Media Panel

Browse a local folder and display images or videos fullscreen on the player screen. Supports common formats (jpg, png, gif, webm, mp4, etc). Multi-column thumbnail grid for easy browsing. Useful for showing maps, artwork, handouts, or ambient scenes.

### Ambiance Player

Set the mood for your session with background music and soundscapes — switch between moods with a single click, no alt-tabbing required.

<img width="2059" height="1332" alt="image" src="https://github.com/user-attachments/assets/ed434f11-9f6b-4ad0-a19d-afdfd34b3c84" />


- **Mood presets** — Ship with 7 defaults (Combat, Suspense, Dungeon, Town, Forest, Tavern, Mystery). Create as many custom moods as you like.
- **Two audio sources per mood** — YouTube playlists/videos, or local audio files (MP3, WAV, OGG, FLAC, M4A, and more).
- **Tracklist** — When playing local files, a full tracklist appears so you can see and jump between tracks.
- **Mini-player bar** — Always visible at the bottom of the DM panel. Play/pause, skip, volume, and favorited mood shortcuts — all without switching tabs.
- **Favorites** — Star any mood to pin it as a one-click shortcut in the mini-player bar.
- **Crossfade** — Smooth 400ms fade when switching between moods so transitions never feel jarring.
- **Per-mood volume + shuffle** — Each mood has its own volume level and shuffle toggle. A master volume slider controls overall loudness.
- **Mood editor** — Full modal editor to customize mood names, colors, audio source, files/URLs, volume, shuffle, and favorite status.
- **Volume persisted** — Master volume is saved across sessions so you don't have to adjust it every time.

### Session Save/Load

Save the entire app state (combat, torch, location, media) as a named session. Load it back later to pick up exactly where you left off. Overwrite existing sessions with current state, or delete old ones.

### Sleep Prevention

The app automatically keeps your PC and display awake while running, so you never get interrupted by a screen timeout mid-session.

---

## Getting Started

### Requirements

- [Node.js](https://nodejs.org/) (v18 or later)

### Install and Run

```bash
git clone https://github.com/emkic/dm-companion-shadowdark.git
cd dm-companion-shadowdark
npm install
npm run dev
```

The DM window opens on your primary monitor. If a second monitor is connected, the player window opens fullscreen on it.

### Build Locally

```bash
npm run package
```

The output will be in the `dist/` folder. This builds for Windows by default. macOS and Linux builds are handled automatically by GitHub Actions when a version tag is pushed.

---

## Tech Stack

- **Electron** — Desktop app framework
- **React** — UI
- **TypeScript** — Type safety
- **Vite** — Build tool
- **electron-store** — Session persistence
- **@dnd-kit** — Drag-and-drop for combat initiative and watch order
- **JSL Blackletter** — Used on the player display to give it that familiar feel
- **[VFX Fire Vol 3](https://kiddolink.itch.io/vfx-fire-vol-3-pixel-art-effects)** — Pixel art fire sprites by [kiddolink](https://kiddolink.itch.io/) used for torch, campfire, and magical light animations

---

## Future Plans

- More visual effects for the player screen
- Feedback and feature suggestions welcome — open an issue on GitHub!

---

## Calling All Music Creators

Are you a musician or sound designer with some kickass ambient tracks, battle themes, or atmospheric soundscapes? **I'd love to hear from you.**

This project is fully open source, and I'm looking for contributors who want to help build a library of music and soundscapes that DMs can use right out of the box. Tracks that work best are:

- **Long-running** — 10+ minute tracks or seamless loops, so the DM doesn't have to keep switching songs mid-session
- **Loopable** — Ambient soundscapes, tavern noise, dungeon drips, forest atmosphere, combat tension — anything that can play on repeat without feeling repetitive
- **Mood-appropriate** — Think dark dungeons, tense combat, peaceful towns, eerie mystery, crackling campfires

If you want your music featured in the app and credited as a contributor, don't hesitate to reach out! Open an issue, submit a PR, or contact me directly. Let's build something great for the TTRPG community together.
