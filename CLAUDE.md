# Darts Tracker — Claude Code Instructions

## Workflow preferences

- Always explain the full plan before touching any code
- Ask "shall I proceed?" and wait for approval before making changes
- Work incrementally — one small step at a time
- Confirm each step works before moving to the next
- Always read the relevant existing component files before planning changes
- Tom's working files are the canonical reference — never silently add or remove logic
- Plain-English explanation of what code will do before writing it
- Windows: use PowerShell equivalents (e.g. Get-Content storage/logs/laravel.log -Tail 50 instead of tail)

## Purpose & context

Tom is building a personal darts tracking web app ("Darts Tracker") as a hands-on React learning project, coming from a PHP/Laravel/MVC background. The app is used with friends at home during real play — accessed on mobile over local WiFi. It's a deliberate alternative to paid commercial darts apps. Success looks like a multi-game-mode tracker with solid per-player stats, a smooth mobile UI, and eventually always-on local hosting.

## Project roadmap
See `docs/ROADMAP.md` in the project root for the full task list, bugs, and upcoming features.
At the start of each session, read ROADMAP.md to understand what's next.

## Current state

(As of 14 Apr 2026) Cricket + 501 + undo are all fully working. 501 checkout suggestions are fully implemented via a `checkouts.js` utility with token pills displayed in `PlayerCard`.

### Active UI work in progress

- Miss/bust button amber/orange colour treatment (identified, not yet applied)
- Cricket `PlayerCard` layout fix for 3+ players (identified, not yet applied)

### On the horizon

- Around the Clock game mode
- Shanghai and Halve It game modes
- Overall stats section across game modes (deliberately deferred until multiple modes exist)
- Raspberry Pi or always-on local server setup
- HTTPS + public hosting (required for full PWA standalone mode)

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

There are no tests in this project.

## Tech stack

- **Frontend:** React 19 (JSX, no TypeScript), Vite 8, React Router DOM v7
- **Styling:** Tailwind CSS via `@tailwindcss/vite` — config lives in `vite.config.js`, not a separate config file
- **State:** React Context + `useReducer` (no Redux/Zustand)
- **Charts:** Recharts
- **PWA:** `vite-plugin-pwa` (installed with `--legacy-peer-deps` due to Vite 8 peer conflict)
- **Backend:** Laravel 12, SQLite — REST API at `src/utils/api.js` (default `http://192.168.0.209:8000/api`)
- **Brand colours:** `ACCENT_RED = "#cc2200"`, `BOARD_GREEN = "#1a4731"`, bright green `#22c55e`

## Architecture

### State: GameContext (`src/context/GameContext.jsx`)

Single global reducer with these actions: `START_GAME`, `ADD_DART`, `UNDO_DART`, `MISS_TURN`, `BUST_TURN`, `SUBMIT_TURN`, `RESET_GAME`.

Key state shape:

```js
{
  (players,
    gameMode,
    finishMultiplier,
    currentPlayerIndex,
    currentTurn,
    winner,
    turnHistory,
    turnNumber,
    turns);
}
```

`turnHistory` stores full state snapshots for undo. `turns` accumulates completed turn records for stats.

### Game logic split by mode

`SUBMIT_TURN` and `MISS_TURN` delegate to a mode-specific handler via `submitHandlers[state.gameMode]`:

- `src/utils/SubmitTurn501.js` — scoring, bust detection, win condition for 501
- `src/utils/SubmitTurnCricket.js` — cricket scoring rules
- `src/utils/501logic.js` / `src/utils/cricketLogic.js` — pure calculation helpers
- `src/utils/checkouts.js` — suggested checkout combinations

### Component patterns

For each game mode there are dedicated variants:

- `Numpad.jsx` → `Numpad501.jsx` / `NumpadCricket.jsx`
- `PlayerCard.jsx` → `PlayerCard501.jsx` / `PlayerCardCricket.jsx`

### Routes (`src/App.jsx`)

| Path                 | Page                                 |
| -------------------- | ------------------------------------ |
| `/`                  | Home — game mode selection           |
| `/setup`             | Setup — player config & game options |
| `/game`              | Active game                          |
| `/stats`             | Overall statistics                   |
| `/stats/players/:id` | Per-player analytics                 |
| `/stats/games/:id`   | Game replay/detail                   |

All routes are wrapped in `AppShell` which provides `GameContext` and the dark background (`bg-gray-950`).

### Backend API (`src/utils/api.js`)

Thin fetch wrappers for players and games. The `BASE_URL` has multiple commented variants (home/garden room/localhost) — switch as needed for local development.

## Key learnings & principles

- Build and verify backend changes (Thunder Client) before moving to frontend
- Test on real device before marking a task complete
- Stats sections should be game-mode-filtered from the start to avoid data pollution across modes
- `useBlocker` requires a data router (`createBrowserRouter` / `RouterProvider`), not `<BrowserRouter>`
- PWA standalone mode requires HTTPS — no workaround on local dev
- Devices on different access points can get different subnet assignments; wired connection to main router is the reliable fix
- `VITE_API_BASE_URL` in `.env` is the right pattern for environment-specific API base URLs
