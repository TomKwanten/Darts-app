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
- [x] Undo across turns breaks scoreboard — undo only works within the current turn; going back a turn and pressing undo causes the scoreboard to disappear. Needs a proper turn history stack.
- [x] Current turn log (Cricket) — show the player which darts/scores they've entered so far in the current turn
- [x] Closed number highlight (Cricket) — grey out / cross off a number when all players have closed it and nobody can score on it
- [x] Score of 1 not flagged as bust (501) — remaining score of 1 should auto-bust since no valid double/triple finish exists.
- [x] Bull shows 2 hit indicators instead of 3 (Cricket) — bull requires 3 hits to close, indicator dots should match.
- [x] Cricket PlayerCard layout breaks with 3+ players — hit indicator dots sit too close to the number, and the green round score chips overflow the card width.
- [x] 1 miss = full missed turn (Cricket) — pressing miss once logs a complete 3-dart missed turn
- [x] All game modes: In-game ranking indicator — colour-coded badge or strip on each PlayerCard showing current position (1st, 2nd, etc.) based on remaining score
- [x] Cricket: Live hit preview dots — show a green dot filling each empty indicator slot as darts are entered during a turn; dots turn red on submit (matching existing confirmed-hit style)
- [x] 501: Automatic checkout suggestion — calculate and display what the player needs to finish from their current remaining score
- [x] Bust button (501) — one-tap shortcut to log a bust without entering all darts
- [x] Around the Clock game mode — fully working end-to-end
      - Sequential (1→20) and Clockwise dartboard order
      - Solo mode (single player, tied to profile) and Multiplayer
      - Mid-turn target advancement: hitting your number immediately shows the next target
      - Live score update on PlayerCard during turn
      - Singles / doubles / triples tracked per player on card
      - Player stats page: multiplayer W/L/record + solo runs/completions, hit rate, best game, avg darts
- [x] Bug fix: miss darts (number: 0) no longer counted as singles in any game mode

## Bugs

## Up Next
- [ ] Bull stat — track red bull (single) vs green bull (double) per player; show lifetime count in PlayerStats
- [ ] "Gepikt" (stolen) stat — Cricket button to log when a player hits a number they didn't intend to score on; shown as a lifetime fun counter in PlayerStats

## Stats & Features
- [ ] Per-gamemode stats filtering on main Stats page
- [ ] Shanghai game mode
- [ ] Overall stats section on player detail page

## Nice to Have
- [ ] All game modes: "Best throw last round" highlight — show which player threw the highest score in the previous round

## Future Game Modes
- [ ] Score Training
- [ ] Shanghai
- [ ] Halve It

## Someday / Maybe
- [ ] Hosting (Laravel + React op publieke URL)
- [ ] Raspberry Pi setup — always-on local server