import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getGames } from "../utils/api";

function calculateCricketStats(games, playerId) {
    const playerGames = games.filter(g =>
        g.game_mode === "cricket" && g.players.some(p => p.id === playerId)
    );
    const lastGame = playerGames.sort(
        (a, b) => new Date(b.played_at) - new Date(a.played_at))[0] ?? null;

    if (playerGames.length === 0) return null;

    let wins = 0;
    let totalDarts = 0;
    let totalPoints = 0;
    let totalSingles = 0;
    let totalDoubles = 0;
    let totalTriples = 0;
    let bestGameDarts = null;
    let playerName = null;

    for (const game of playerGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;

        if (!playerName) playerName = player.name;

        if (isWinner) {
            wins++;
            if (bestGameDarts === null || player.total_darts < bestGameDarts) {
                bestGameDarts = player.total_darts;
            }
        }

        totalDarts += player.total_darts;
        totalPoints += player.points;
        totalSingles += player.singles;
        totalDoubles += player.doubles;
        totalTriples += player.triples;
    }

    const gamesPlayed = playerGames.length;
    const losses = gamesPlayed - wins;
    const totalRounds = totalDarts / 3;
    const totalHits = totalSingles + totalDoubles * 2 + totalTriples * 3;

    return {
        playerName,
        gamesPlayed,
        wins,
        losses,
        dartAvgPerGame: totalDarts / gamesPlayed,
        avgScorePerGame: totalPoints / gamesPlayed,
        avgTurnsPerGame: totalRounds / gamesPlayed,
        avgHitsPerGame: totalHits / gamesPlayed,
        avgHitsPerRound: totalHits / totalRounds,
        totalDoubles,
        doublesPercent: totalDarts > 0 ? (totalDoubles / totalDarts) * 100 : 0,
        totalTriples,
        triplesPercent: totalDarts > 0 ? (totalTriples / totalDarts) * 100 : 0,
        bestGameDarts,
    };
}

function calculate501Stats(games, playerId) {
    const playerGames = games.filter(g =>
        g.game_mode === "501" && g.players.some(p => p.id === playerId)
    );

    if (playerGames.length === 0) return null;

    let wins = 0;
    let totalDartsWins = 0;
    let bestGameDarts = null;
    let totalPointsNonBust = 0;
    let totalNonBustTurns = 0;
    let playerName = null;

    for (const game of playerGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;

        if (!playerName) playerName = player.name;

        if (isWinner) {
            wins++;
            totalDartsWins += player.total_darts;
            if (bestGameDarts === null || player.total_darts < bestGameDarts) {
                bestGameDarts = player.total_darts;
            }
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
    const losses = gamesPlayed - wins;

    return {
        playerName,
        gamesPlayed,
        wins,
        losses,
        checkouts: wins,
        checkoutRate: (wins / gamesPlayed) * 100,
        avgDartsPerWin: wins > 0 ? totalDartsWins / wins : null,
        bestGameDarts,
        avgPerTurn: totalNonBustTurns > 0 ? totalPointsNonBust / totalNonBustTurns : null,
    };
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
            .then(data => {
                setGames(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load stats.");
                setLoading(false);
            });
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
                    ← Back to stats
                </Link>
            </div>
        );
    }

    const stats = calculateCricketStats(games, playerId);

    const playerGames = games.filter(g => g.players.some(p => p.id === playerId));
    const lastGame = [...playerGames].sort((a, b) =>
        new Date(b.played_at) - new Date(a.played_at)
    )[0] ?? null;

    if (playerGames.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">No games found for this player</p>
                <Link to="/stats" className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ← Back to stats
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
                    {stats?.playerName ?? lastGame?.players.find(p => p.id === playerId)?.name ?? "Player"}
                </h1>
                <Link to="/stats" className="text-sm uppercase tracking-widest text-gray-400 hover:text-gray-400 transition-colors">
                    ← Stats
                </Link>
            </div>

            {/* Gamemode dropdown */}
            <div className="mb-6">
                <select
                    value={gameMode}
                    onChange={e => setGameMode(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-gray-100 text-sm uppercase tracking-widest rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                >
                    <option value="cricket">Cricket</option>
                    <option value="501">501</option>
                    <option value="overall">Overall</option>
                </select>
            </div>

            {gameMode === "cricket" && !stats && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                    <p className="text-gray-500 text-sm">No Cricket games yet.</p>
                </div>
            )}

            {gameMode === "cricket" && stats && (
                <div className="flex flex-col gap-4">
                    {/* W/L */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Record</div>
                        <div className="flex gap-4">
                            <div className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                <div className="text-2xl font-black" style={{ color: "#cc2200" }}>{stats.wins}</div>
                                <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Wins</div>
                            </div>
                            <div className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                <div className="text-2xl font-black text-gray-400">{stats.losses}</div>
                                <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Losses</div>
                            </div>
                            <div className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                <div className="text-2xl font-black text-gray-100">{stats.gamesPlayed}</div>
                                <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Played</div>
                            </div>
                        </div>
                    </div>

                    {/* Averages */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Averages</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Darts / game", value: stats.dartAvgPerGame.toFixed(1) },
                                { label: "Score / game", value: stats.avgScorePerGame.toFixed(1) },
                                { label: "Turns / game", value: stats.avgTurnsPerGame.toFixed(1) },
                                { label: "Hits / game", value: stats.avgHitsPerGame.toFixed(1) },
                                { label: "Hits / round", value: stats.avgHitsPerRound.toFixed(2) },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-lg bg-gray-800 py-3 px-4">
                                    <div className="text-xl font-black tabular-nums text-gray-100">{value}</div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Doubles & Triples */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Doubles & Triples</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Doubles", value: stats.totalDoubles, pct: stats.doublesPercent },
                                { label: "Triples", value: stats.totalTriples, pct: stats.triplesPercent },
                            ].map(({ label, value, pct }) => (
                                <div key={label} className="rounded-lg bg-gray-800 py-3 px-4">
                                    <div className="text-xl font-black tabular-nums text-gray-100">{value}</div>
                                    <div className="text-xs tabular-nums text-gray-400 mt-[2px]">{pct.toFixed(1)}%</div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Best game */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Best Game</div>
                        <div className="rounded-lg bg-gray-800 py-3 px-4">
                            {stats.bestGameDarts !== null ? (
                                <>
                                    <div className="text-2xl font-black tabular-nums text-gray-100">
                                        {stats.bestGameDarts}
                                        <span className="text-sm font-normal text-gray-500 ml-1">darts</span>
                                    </div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Fewest darts to win</div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500">No wins yet</div>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {gameMode === "501" && (() => {
            const stats501 = calculate501Stats(games, playerId);

            if (!stats501) {
                return (
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                        <p className="text-gray-500 text-sm">No 501 games yet.</p>
                    </div>
                );
            }

            return (
                <div className="flex flex-col gap-4">

                    {/* W/L */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Record</div>
                        <div className="flex gap-4">
                            {[
                                { label: "Wins",   value: stats501.wins,        color: "#cc2200" },
                                { label: "Losses", value: stats501.losses,      color: null },
                                { label: "Played", value: stats501.gamesPlayed, color: null },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                    <div
                                        className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                        style={{ color: color ?? undefined }}
                                    >
                                        {value}
                                    </div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Averages */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Averages</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Avg per turn",    value: stats501.avgPerTurn      != null ? stats501.avgPerTurn.toFixed(1)      : "—" },
                                { label: "Avg darts / win", value: stats501.avgDartsPerWin  != null ? stats501.avgDartsPerWin.toFixed(1)  : "—" },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-lg bg-gray-800 py-3 px-4">
                                    <div className="text-xl font-black tabular-nums text-gray-100">{value}</div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Checkout */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Checkout</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Checkouts", value: stats501.checkouts },
                                { label: "Checkout rate", value: `${stats501.checkoutRate.toFixed(1)}%` },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-lg bg-gray-800 py-3 px-4">
                                    <div className="text-xl font-black tabular-nums text-gray-100">{value}</div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Best game */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Best Game</div>
                        <div className="rounded-lg bg-gray-800 py-3 px-4">
                            {stats501.bestGameDarts !== null ? (
                                <>
                                    <div className="text-2xl font-black tabular-nums text-gray-100">
                                        {stats501.bestGameDarts}
                                        <span className="text-sm font-normal text-gray-500 ml-1">darts</span>
                                    </div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Fewest darts to win</div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500">No wins yet</div>
                            )}
                        </div>
                    </div>

                </div>
            );
        })()}

            {gameMode === "overall" && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                    <p className="text-gray-500 text-sm">Overall stats coming soon.</p>
                </div>
            )}

            {/* Last Game */}
            {lastGame && (
                <div className="mt-4">
                    <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                        Last Game
                    </div>
                    <Link
                        to={`/stats/games/${lastGame.id}`}
                        state={{ game: lastGame }}
                        className="rounded-xl border border-gray-800 bg-gray-900 p-3 block active:opacity-70 transition-opacity">

                        {/* Date + winner */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                                {new Date(lastGame.played_at).toLocaleDateString(undefined, {
                                    day: "numeric", month: "short", year: "numeric"
                                })}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider"
                                style={{ color: "#cc2200" }}>
                                🎯 {lastGame.winner?.name ?? "Unknown"}
                            </span>
                        </div>

                        {/* Players */}
                        <div className="flex flex-col gap-1">
                            {lastGame.players.map(player => (
                                <div key={player.id ?? player.name}
                                    className="flex items-center justify-between text-xs">
                                    <span className={lastGame.winner && player.name === lastGame.winner.name
                                        ? "font-bold text-gray-100"
                                        : "text-gray-500"}>
                                        {player.name ?? "Unknown"}
                                    </span>
                                    <span className="tabular-nums text-gray-500">
                                        {player.points}pts · {player.total_darts} darts
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