# Cricket Darts Tracker — Roadmap

## Done
- [x] Stats page: wire up to `GET /api/games` endpoint
- [x] Stats page: individual player stats (click player → see their history)
- [x] Confirm before delete: "Are you sure?" step before removing a player
- [x] Loading & error states: consistent feedback on every API call
- [x] Rename player from the setup screen (`PATCH /api/players/{id}`)
- [x] Delete a game from game history
- [x] Game-in-progress protection: warn when navigating away mid-game (React Router `useBlocker`)

## In Progress

## Up Next
- [ ] PWA support: make app installable on phone home screen (`vite-plugin-pwa`)

## Bigger Lifts
- [ ] Run app away from home / without localhost setup (hosting — Laravel on Railway/Fly.io, React on Netlify/Vercel)

## Future Game Modes
- [ ] 501
- [ ] Around the Clock
- [ ] Score Training
- [ ] Shanghai
- [ ] Halve It