# Darts Tracker — Roadmap

## Done
- [x] Stats page: wire up to GET /api/games endpoint
- [x] Stats page: individual player stats (click player → see their history)
- [x] Confirm before delete: "Are you sure?" step before removing a player
- [x] Loading & error states: consistent feedback on every API call
- [x] Rename player from the setup screen (PATCH /api/players/{id})
- [x] Delete a game from game history
- [x] Game-in-progress protection: warn when navigating away mid-game (React Router useBlocker)
- [x] PWA support: make app installable on phone home screen (vite-plugin-pwa)
- [x] Clickable player rows in Stats → dedicated player detail page
- [x] Backend: game_turns table, GameTurn model, turns opslag in store(), turns in index() response
- [x] Frontend: turns bufferen in GameContext state tijdens spel
- [x] Frontend: turns meesturen in saveGame() call
- [x] Game detail page — click a game in history → full per-player breakdown
      - Score progression curve (line chart via Recharts)
      - Turn-by-turn table
      - Per-player stat cards
- [x] Player names in game detail page link to their career stats
- [x] Last Game card on player detail page links to game detail page
- [x] 501 game mode — fully working end-to-end
      - 501 logic (bust detection, finish multiplier: Double/Triple)
      - Game screen with numpad, miss button, undo across turn boundaries
      - Game detail page: key stats (avg, high, busts, checkout), score bands
- [x] Miss button — allows submitting a scoreless turn in any game mode
- [x] Player detail page — 501 stats block
      - W/L record, avg per turn (excl. busts), avg darts/win
      - Checkout count + checkout rate
      - Best game (fewest darts to win)
- [x] Bug fix: 501-only players no longer hit blank screen on player detail page

## Up Next
- [ ] Small UI improvements
- [ ] Overall stats section on player detail page
- [ ] Per-gamemode stats filtering on main Stats page

## Up Next (Game Modes)
- [ ] Around the Clock game mode

## Future Game Modes
- [ ] Score Training
- [ ] Shanghai
- [ ] Halve It

## Someday / Maybe
- [ ] Hosting (Laravel + React op publieke URL)
- [ ] Raspberry Pi setup — always-on local server