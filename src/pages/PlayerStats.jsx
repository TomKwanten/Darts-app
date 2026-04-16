import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getGames } from "../utils/api";
import { SEQUENCES, getProgressIndex } from "../utils/ATCLogic";

function calculateCricketStats(games, playerId) {
    const playerGames = games.filter(g =>
        g.game_mode === "cricket" && g.players.some(p => p.id === playerId)
    );

    if (playerGames.length === 0) return null;

    let wins = 0, totalDarts = 0, totalPoints = 0;
    let totalSingles = 0, totalDoubles = 0, totalTriples = 0;
    let bestGameDarts = null, playerName = null;

    for (const game of playerGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        if (isWinner) {
            wins++;
            if (bestGameDarts === null || player.total_darts < bestGameDarts) bestGameDarts = player.total_darts;
        }
        totalDarts += player.total_darts;
        totalPoints += player.points;
        totalSingles += player.singles;
        totalDoubles += player.doubles;
        totalTriples += player.triples;
    }

    const gamesPlayed = playerGames.length;
    const totalRounds = totalDarts / 3;
    const totalHits = totalSingles + totalDoubles * 2 + totalTriples * 3;

    return {
        playerName, gamesPlayed, wins, losses: gamesPlayed - wins,
        dartAvgPerGame: totalDarts / gamesPlayed,
        avgScorePerGame: totalPoints / gamesPlayed,
        avgTurnsPerGame: totalRounds / gamesPlayed,
        avgHitsPerGame: totalHits / gamesPlayed,
        avgHitsPerRound: totalHits / totalRounds,
        totalDoubles, doublesPercent: totalDarts > 0 ? (totalDoubles / totalDarts) * 100 : 0,
        totalTriples, triplesPercent: totalDarts > 0 ? (totalTriples / totalDarts) * 100 : 0,
        bestGameDarts,
    };
}

function calculate501Stats(games, playerId) {
    const playerGames = games.filter(g =>
        g.game_mode === "501" && g.players.some(p => p.id === playerId)
    );

    if (playerGames.length === 0) return null;

    let wins = 0, totalDartsWins = 0, bestGameDarts = null;
    let totalPointsNonBust = 0, totalNonBustTurns = 0, playerName = null;

    for (const game of playerGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        if (isWinner) {
            wins++;
            totalDartsWins += player.total_darts;
            if (bestGameDarts === null || player.total_darts < bestGameDarts) bestGameDarts = player.total_darts;
        }
        const playerTurns = game.turns.filter(t => t.player_id === playerId);
        for (const turn of playerTurns) {
            if (turn.points_scored > 0) {
                totalPointsNonBust += turn.points_scored;
                totalNonBustTurns++;
            }
        }
    }

    const gamesPlayed = playerGames.length;
    return {
        playerName, gamesPlayed, wins, losses: gamesPlayed - wins,
        checkouts: wins,
        checkoutRate: (wins / gamesPlayed) * 100,
        avgDartsPerWin: wins > 0 ? totalDartsWins / wins : null,
        bestGameDarts,
        avgPerTurn: totalNonBustTurns > 0 ? totalPointsNonBust / totalNonBustTurns : null,
    };
}

function calculateATCStats(games, playerId) {
    // Multiplayer
    const mpGames = games.filter(g =>
        g.game_mode === "around-the-clock" && g.players.some(p => p.id === playerId)
    );
    // Solo
    const soloGames = games.filter(g =>
        g.game_mode === "around-the-clock-solo" && g.players.some(p => p.id === playerId)
    );

    if (mpGames.length === 0 && soloGames.length === 0) return null;

    let playerName = null;

    // ── Multiplayer stats ──
    let mpWins = 0, mpTotalDarts = 0, mpTotalDartsWins = 0;
    let mpSingles = 0, mpDoubles = 0, mpTriples = 0;
    let mpTotalHits = 0, mpBestDarts = null;

    for (const game of mpGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        if (isWinner) {
            mpWins++;
            mpTotalDartsWins += player.total_darts;
            if (mpBestDarts === null || player.total_darts < mpBestDarts) mpBestDarts = player.total_darts;
        }
        mpTotalDarts += player.total_darts;
        mpSingles += player.singles;
        mpDoubles += player.doubles;
        mpTriples += player.triples;

        // hits = steps advanced across all turns (running_total progression)
        const playerTurns = game.turns
            .filter(t => t.player_id === playerId)
            .sort((a, b) => a.turn_number - b.turn_number);
        for (const turn of playerTurns) {
            mpTotalHits += turn.points_scored; // points_scored = 1 if advanced, 0 if missed
        }
    }

    // ── Solo stats ──
    let soloRuns = 0, soloTotalDarts = 0;
    let soloSingles = 0, soloDoubles = 0, soloTriples = 0;
    let soloTotalHits = 0, soloBestDarts = null, soloCompletedDarts = 0, soloCompleted = 0;

    for (const game of soloGames) {
        const player = game.players.find(p => p.id === playerId);
        const isFinished = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;

        soloRuns++;
        soloTotalDarts += player.total_darts;
        soloSingles += player.singles;
        soloDoubles += player.doubles;
        soloTriples += player.triples;

        const playerTurns = game.turns.filter(t => t.player_id === playerId);
        for (const turn of playerTurns) {
            soloTotalHits += turn.points_scored;
        }

        if (isFinished) {
            soloCompleted++;
            soloCompletedDarts += player.total_darts;
            if (soloBestDarts === null || player.total_darts < soloBestDarts) soloBestDarts = player.total_darts;
        }
    }

    return {
        playerName,
        multiplayer: mpGames.length === 0 ? null : {
            gamesPlayed: mpGames.length,
            wins: mpWins,
            losses: mpGames.length - mpWins,
            bestDarts: mpBestDarts,
            avgDartsPerWin: mpWins > 0 ? mpTotalDartsWins / mpWins : null,
            totalDarts: mpTotalDarts,
            singles: mpSingles,
            doubles: mpDoubles,
            triples: mpTriples,
            hitRate: mpTotalDarts > 0 ? ((mpSingles + mpDoubles + mpTriples) / mpTotalDarts) * 100 : 0,        
        },
        solo: soloGames.length === 0 ? null : {
            runs: soloRuns,
            completed: soloCompleted,
            bestDarts: soloBestDarts,
            avgDartsPerRun: soloRuns > 0 ? soloTotalDarts / soloRuns : null,
            avgDartsPerCompletion: soloCompleted > 0 ? soloCompletedDarts / soloCompleted : null,
            totalDarts: soloTotalDarts,
            singles: soloSingles,
            doubles: soloDoubles,
            triples: soloTriples,
            hitRate: soloTotalDarts > 0 ? ((soloSingles + soloDoubles + soloTriples) / soloTotalDarts) * 100 : 0,
        },
    };
}

function StatCard({ title, children }) {
    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
            <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">{title}</div>
            {children}
        </div>
    );
}

function StatGrid({ items }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {items.map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-800 py-3 px-4">
                    <div className="text-xl font-black tabular-nums text-gray-100">{value}</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                </div>
            ))}
        </div>
    );
}

function RecordRow({ wins, losses, played, color = "#cc2200" }) {
    return (
        <div className="flex gap-4">
            {[
                { label: "Wins", value: wins, color },
                { label: "Losses", value: losses, color: null },
                { label: "Played", value: played, color: null },
            ].map(({ label, value, color: c }) => (
                <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                    <div className="text-2xl font-black" style={{ color: c ?? undefined }}
                        className={`text-2xl font-black ${c ? "" : "text-gray-100"}`}>
                        {value}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                </div>
            ))}
        </div>
    );
}

export default function PlayerStats() {
    const { id } = useParams();
    const playerId = parseInt(id);

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameMode, setGameMode] = useState("cricket");

    useEffect(() => {
        getGames()
            .then(data => { setGames(data); setLoading(false); })
            .catch(() => { setError("Could not load stats."); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-red-400 text-sm uppercase tracking-widest">{error}</p>
                <Link to="/stats" className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ‹‹ Back to stats
                </Link>
            </div>
        );
    }

    const cricketStats = calculateCricketStats(games, playerId);
    const atcStats = calculateATCStats(games, playerId);

    const playerGames = games.filter(g => g.players.some(p => p.id === playerId));
    const lastGame = [...playerGames].sort((a, b) =>
        new Date(b.played_at) - new Date(a.played_at)
    )[0] ?? null;

    const playerName = cricketStats?.playerName
        ?? atcStats?.playerName
        ?? lastGame?.players.find(p => p.id === playerId)?.name
        ?? "Player";

    if (playerGames.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">No games found for this player</p>
                <Link to="/stats" className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ‹‹ Back to stats
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
                    {playerName}
                </h1>
                <Link to="/stats" className="text-sm uppercase tracking-widest text-gray-400 hover:text-gray-400 transition-colors">
                    ‹‹ Stats
                </Link>
            </div>

            {/* Gamemode dropdown */}
            <div className="mb-6">
                <select
                    value={gameMode}
                    onChange={e => setGameMode(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-gray-100 text-sm uppercase tracking-widest rounded-lg px-3 py-2 pr-5 focus:outline-none focus:border-gray-500"
                >
                    <option value="cricket">Cricket</option>
                    <option value="501">501</option>
                    <option value="around-the-clock">Around the Clock</option>
                    <option value="overall">Overall</option>
                </select>
            </div>

            {/* ── Cricket ── */}
            {gameMode === "cricket" && !cricketStats && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                    <p className="text-gray-500 text-sm">No Cricket games yet.</p>
                </div>
            )}
            {gameMode === "cricket" && cricketStats && (
                <div className="flex flex-col gap-4">
                    <StatCard title="Record">
                        <div className="flex gap-4">
                            {[
                                { label: "Wins", value: cricketStats.wins, color: "#cc2200" },
                                { label: "Losses", value: cricketStats.losses, color: null },
                                { label: "Played", value: cricketStats.gamesPlayed, color: null },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                    <div className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                        style={{ color: color ?? undefined }}>{value}</div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </StatCard>
                    <StatCard title="Averages">
                        <StatGrid items={[
                            { label: "Darts / game", value: cricketStats.dartAvgPerGame.toFixed(1) },
                            { label: "Score / game", value: cricketStats.avgScorePerGame.toFixed(1) },
                            { label: "Turns / game", value: cricketStats.avgTurnsPerGame.toFixed(1) },
                            { label: "Hits / game", value: cricketStats.avgHitsPerGame.toFixed(1) },
                            { label: "Hits / round", value: cricketStats.avgHitsPerRound.toFixed(2) },
                        ]} />
                    </StatCard>
                    <StatCard title="Doubles & Triples">
                        <StatGrid items={[
                            { label: "Doubles", value: `${cricketStats.totalDoubles} (${cricketStats.doublesPercent.toFixed(1)}%)` },
                            { label: "Triples", value: `${cricketStats.totalTriples} (${cricketStats.triplesPercent.toFixed(1)}%)` },
                        ]} />
                    </StatCard>
                    <StatCard title="Best Game">
                        <div className="rounded-lg bg-gray-800 py-3 px-4">
                            {cricketStats.bestGameDarts !== null ? (
                                <>
                                    <div className="text-2xl font-black tabular-nums text-gray-100">
                                        {cricketStats.bestGameDarts}
                                        <span className="text-sm font-normal text-gray-500 ml-1">darts</span>
                                    </div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Fewest darts to win</div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500">No wins yet</div>
                            )}
                        </div>
                    </StatCard>
                </div>
            )}

            {/* ── 501 ── */}
            {gameMode === "501" && (() => {
                const s = calculate501Stats(games, playerId);
                if (!s) return (
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                        <p className="text-gray-500 text-sm">No 501 games yet.</p>
                    </div>
                );
                return (
                    <div className="flex flex-col gap-4">
                        <StatCard title="Record">
                            <div className="flex gap-4">
                                {[
                                    { label: "Wins", value: s.wins, color: "#cc2200" },
                                    { label: "Losses", value: s.losses, color: null },
                                    { label: "Played", value: s.gamesPlayed, color: null },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                        <div className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                            style={{ color: color ?? undefined }}>{value}</div>
                                        <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </StatCard>
                        <StatCard title="Averages">
                            <StatGrid items={[
                                { label: "Avg per turn", value: s.avgPerTurn != null ? s.avgPerTurn.toFixed(1) : "—" },
                                { label: "Avg darts / win", value: s.avgDartsPerWin != null ? s.avgDartsPerWin.toFixed(1) : "—" },
                            ]} />
                        </StatCard>
                        <StatCard title="Checkout">
                            <StatGrid items={[
                                { label: "Checkouts", value: s.checkouts },
                                { label: "Checkout rate", value: `${s.checkoutRate.toFixed(1)}%` },
                            ]} />
                        </StatCard>
                        <StatCard title="Best Game">
                            <div className="rounded-lg bg-gray-800 py-3 px-4">
                                {s.bestGameDarts !== null ? (
                                    <>
                                        <div className="text-2xl font-black tabular-nums text-gray-100">
                                            {s.bestGameDarts}
                                            <span className="text-sm font-normal text-gray-500 ml-1">darts</span>
                                        </div>
                                        <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Fewest darts to win</div>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500">No wins yet</div>
                                )}
                            </div>
                        </StatCard>
                    </div>
                );
            })()}

            {/* ── Around the Clock ── */}
            {gameMode === "around-the-clock" && !atcStats && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                    <p className="text-gray-500 text-sm">No Around the Clock games yet.</p>
                </div>
            )}
            {gameMode === "around-the-clock" && atcStats && (
                <div className="flex flex-col gap-4">

                    {/* Multiplayer */}
                    {atcStats.multiplayer && (
                        <>
                            <div className="text-xs uppercase tracking-[0.3em] text-gray-600 mt-1">Multiplayer</div>

                            <StatCard title="Record">
                                <div className="flex gap-4">
                                    {[
                                        { label: "Wins", value: atcStats.multiplayer.wins, color: "#cc2200" },
                                        { label: "Losses", value: atcStats.multiplayer.losses, color: null },
                                        { label: "Played", value: atcStats.multiplayer.gamesPlayed, color: null },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                            <div className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                                style={{ color: color ?? undefined }}>{value}</div>
                                            <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </StatCard>

                            <StatCard title="Performance">
                                <StatGrid items={[
                                    { label: "Hit rate", value: `${atcStats.multiplayer.hitRate.toFixed(1)}%` },
                                    { label: "Avg darts / win", value: atcStats.multiplayer.avgDartsPerWin != null ? atcStats.multiplayer.avgDartsPerWin.toFixed(1) : "—" },
                                    { label: "Total darts", value: atcStats.multiplayer.totalDarts },
                                    { label: "Best game", value: atcStats.multiplayer.bestDarts != null ? `${atcStats.multiplayer.bestDarts}` : "—" },
                                ]} />
                            </StatCard>

                            <StatCard title="Dart Types">
                                <StatGrid items={[
                                    { label: "Singles", value: atcStats.multiplayer.singles },
                                    { label: "Doubles", value: atcStats.multiplayer.doubles },
                                    { label: "Triples", value: atcStats.multiplayer.triples },
                                ]} />
                            </StatCard>
                        </>
                    )}

                    {/* Solo */}
                    {atcStats.solo && (
                        <>
                            <div className="text-xs uppercase tracking-[0.3em] text-gray-600 mt-2">Solo</div>

                            <StatCard title="Runs">
                                <div className="flex gap-4">
                                    {[
                                        { label: "Completed", value: atcStats.solo.completed, color: "#cc2200" },
                                        { label: "Total runs", value: atcStats.solo.runs, color: null },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                            <div className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                                style={{ color: color ?? undefined }}>{value}</div>
                                            <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </StatCard>

                            <StatCard title="Performance">
                                <StatGrid items={[
                                    { label: "Hit rate", value: `${atcStats.solo.hitRate.toFixed(1)}%` },
                                    { label: "Best run", value: atcStats.solo.bestDarts != null ? `${atcStats.solo.bestDarts} darts` : "—" },
                                    { label: "Avg darts / run", value: atcStats.solo.avgDartsPerRun != null ? atcStats.solo.avgDartsPerRun.toFixed(1) : "—" },
                                    { label: "Avg darts / finish", value: atcStats.solo.avgDartsPerCompletion != null ? atcStats.solo.avgDartsPerCompletion.toFixed(1) : "—" },
                                    { label: "Total darts", value: atcStats.solo.totalDarts },
                                ]} />
                            </StatCard>

                            <StatCard title="Dart Types">
                                <StatGrid items={[
                                    { label: "Singles", value: atcStats.solo.singles },
                                    { label: "Doubles", value: atcStats.solo.doubles },
                                    { label: "Triples", value: atcStats.solo.triples },
                                ]} />
                            </StatCard>
                        </>
                    )}
                </div>
            )}

            {/* ── Overall ── */}
            {gameMode === "overall" && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                    <p className="text-gray-500 text-sm">Overall stats coming soon.</p>
                </div>
            )}

            {/* Last Game */}
            {lastGame && (
                <div className="mt-4">
                    <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Last Game</div>
                    <Link
                        to={`/stats/games/${lastGame.id}`}
                        state={{ game: lastGame }}
                        className="rounded-xl border border-gray-800 bg-gray-900 p-3 block active:opacity-70 transition-opacity">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                                {new Date(lastGame.played_at).toLocaleDateString(undefined, {
                                    day: "numeric", month: "short", year: "numeric"
                                })}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#cc2200" }}>
                                🎯 {lastGame.winner?.name ?? "Unknown"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {lastGame.players.map(player => (
                                <div key={player.id ?? player.name} className="flex items-center justify-between text-xs">
                                    <span className={lastGame.winner && player.name === lastGame.winner.name
                                        ? "font-bold text-gray-100" : "text-gray-500"}>
                                        {player.name ?? "Unknown"}
                                    </span>
                                    <span className="tabular-nums text-gray-500">
                                        {player.total_darts} darts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}