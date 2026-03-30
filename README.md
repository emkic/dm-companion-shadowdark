# Shadowdark DM Companion

A dual-screen desktop app for running [Shadowdark RPG](https://www.thearcanelibrary.com/pages/shadowdark) sessions. The DM controls everything from a private panel while players see only what you choose on a separate fullscreen display.

Built with Electron, React, and TypeScript.

Published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC.

## Download

**[Download the latest release](https://github.com/emkic/shadowdark-dm-app/releases/latest)**

- **ShadowdarkDM-Portable.exe** — Just download and run. No install needed.
- **Shadowdark DM Setup.exe** — Installer (per-user, no admin required).

> **Note:** Windows SmartScreen may show a warning when you first run the app because it is not code-signed. Click **"More info"** then **"Run anyway"** to proceed. This is normal for unsigned apps and only happens once per downloaded file.

---

## Features

### Dual-Screen Display

The app runs two windows simultaneously:

- **DM Window** — A private control panel on your main monitor where you manage all game state
- **Player Window** — A fullscreen, borderless display on a second monitor (projector, TV, or external screen) that shows only what you want the players to see
- **Display selector** — Choose which monitor the player window appears on via a dropdown in the DM header. Refresh button to re-detect monitors on the fly.

All changes on the DM side are broadcast to the player screen in real time.

### Combat Tracker

Full initiative and combat management visible to both DM and players:

- **Initiative order** with drag-and-drop reordering or auto-sort by initiative value
- **HP tracking** with +/- buttons and click-to-edit for direct input
- **Health estimates** shown to players instead of exact HP numbers: Uninjured, Injured, Bloodied, Near Death, Dying, Dead — each color-coded
- **Shadowdark death mechanic** — when a player hits 0 HP:
  1. DM rolls a d4 to set the death timer (rounds until permanent death)
  2. Each round, the DM can roll a d20 death save
  3. Natural 20 = player awakens at 1 HP
  4. Timer expires = permanent death
- **Emoji identifiers** for each combatant so players can quickly tell who is who
- **Duplicate combatant** — quickly copy a combatant to add multiples of the same monster
- Monsters are automatically removed from the tracker when combat ends

### Light Source System

Three lighting modes to match the in-game situation:

- **Torch** — A 60-minute countdown timer. The player screen shows a pixel-art torch flame that dims as time runs out. Warning at 25% remaining. DM can start, pause, reset, and adjust time in 1 or 5 minute increments.
- **Magical Light** — Same timer behavior as torch, but the player screen shows a crystal ball with a soft pulsing white glow instead of a flame.
- **Natural Light** — Daylight mode with no timer. The torch/crystal ball widget is hidden from the player screen entirely.
- **Hide timer from players** — Toggle to hide the countdown from the player screen while keeping the flame/crystal visual. The timer keeps running on the DM screen.

### Torch Extinguish

The DM can extinguish the torch (or magical light) at any time. When extinguished, the entire player screen goes black and three lines fade in one at a time:

> *There is no light.*
>
> *You do not see anything.*
>
> *The living darkness closes in on you.*

The final line pulses in crimson red. The DM can relight at any time to return to normal. When the torch timer reaches zero, the darkness overlay triggers automatically.

### Hex Crawling & Travel

Full travel and rest tracking based on the hex crawling rules from **Shadowdark Zine 4: River of Night** (page 26):

- **Three activity modes** — Traveling, Dungeon Crawling, or In City/Village. Each mode shows relevant controls.
- **Travel method** — Walking (4 hex/day), Mounted (6 hex/day), or Sailing (8 hex/day)
- **Hex tracker** — Track hexes remaining per day with buttons for normal (-1) and difficult terrain (-2). Pushing mode gives 1.5x hexes.
- **Daily checklist** — Rations consumed, foraging attempt (when not pushing), and 4 random encounter checks (2 day, 2 night)
- **Camping system** — Toggle camping within the traveling state. Includes:
  - **Campfire toggle** — When lit, the player screen shows an animated campfire with "Campfire is lit!" text. When off, shows "The camp is dark."
  - **Watch order** — 4 watch slots with player names and encounter checkboxes. Watch order displays as an overlay on the player screen.
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

Browse a local folder and display images or videos fullscreen on the player screen. Supports common formats (jpg, png, gif, webm, mp4, etc). Useful for showing maps, artwork, handouts, or ambient scenes.

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
git clone https://github.com/emkic/shadowdark-dm-app.git
cd shadowdark-dm-app
npm install
npm run dev
```

The DM window opens on your primary monitor. If a second monitor is connected, the player window opens fullscreen on it.

### Build Portable Exe

To build a standalone portable exe that runs on any Windows PC with no install:

```bash
npm run build
npx electron-builder --win
```

The output will be in the `dist/` folder:

- `ShadowdarkDM-Portable.exe` — Single portable exe, just copy and run
- `Shadowdark DM Setup 1.0.0.exe` — Installer (per-user, no admin required)

---

## Tech Stack

- **Electron** — Desktop app framework
- **React** — UI
- **TypeScript** — Type safety
- **Vite** — Build tool
- **electron-store** — Session persistence
- **@dnd-kit** — Drag-and-drop for combat initiative
- **JSL Blackletter** — Official Shadowdark font on the player display

---

## Future Plans

- Multiple torch timers for tracking different party members' light sources
- Torch dimming effect on the player screen as time runs low
- Ambient audio/music player
- More visual effects for the player screen
- Feedback and feature suggestions welcome — open an issue on GitHub!
