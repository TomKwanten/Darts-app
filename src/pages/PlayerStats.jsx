import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getGames } from "../utils/api";
import CricketStats, { calculateCricketStats } from "../components/stats/CricketStats";
import Stats501 from "../components/stats/Stats501";
import ATCStats, { calculateATCStats } from "../components/stats/ATCStats";
import ShanghaiStats, { calculateShanghaiStats } from "../components/stats/ShanghaiStats";

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
    const shanghaiStats = calculateShanghaiStats(games, playerId);

    const playerGames = games.filter(g => g.players.some(p => p.id === playerId));
    const lastGame = [...playerGames].sort((a, b) =>
        new Date(b.played_at) - new Date(a.played_at)
    )[0] ?? null;

    const playerName = cricketStats?.playerName
        ?? atcStats?.playerName
        ?? shanghaiStats?.playerName
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
                    <option value="shanghai">Shanghai</option>
                    <option value="overall">Overall</option>
                </select>
            </div>

            {/* Stats blocks */}
            {gameMode === "cricket" && <CricketStats stats={cricketStats} />}
            {gameMode === "501" && <Stats501 games={games} playerId={playerId} />}
            {gameMode === "around-the-clock" && <ATCStats stats={atcStats} />}
            {gameMode === "shanghai" && <ShanghaiStats stats={shanghaiStats} />}
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