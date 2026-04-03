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
      - Gamemode dropdown: Cricket | Overall (stubbed)
      - Cricket stats: W/L, dart avg, score avg, turns avg, hits/game,
        hits/round (global weighted), doubles/triples + %, best game by fewest darts

## Up Next
- [ ] Game detail page — click a game in history → full per-player breakdown
      - Score progression curve (line chart of points over turns)
      - Requires game_turns table in DB (backend change)
      - Step 1: migration + model + endpoint (Laravel)
      - Step 2: send turn data from frontend on each turn end
      - Step 3: build the detail page + chart

## Deferred Until Game Detail Page Is Done
- [ ] Overall stats section on player detail page (global across all game modes)
- [ ] Per-gamemode stats filtering on main Stats page

## Up Next (Game Modes)
- [ ] 501 game mode
- [ ] Around the Clock game mode

## Future Game Modes
- [ ] Score Training
- [ ] Shanghai
- [ ] Halve It

## Someday / Maybe
- [ ] Hosting (Laravel + React on a public URL)
- [ ] Raspberry Pi setup — always-on local server, wired to router