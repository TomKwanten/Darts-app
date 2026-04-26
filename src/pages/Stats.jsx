import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getGames, deleteGame } from "../utils/api";

const GAME_MODE_LABEL = {
    cricket: "Cricket",
    "501": "501",
    "around-the-clock": "ATC",
    "around-the-clock-solo": "ATC Solo",
    "shanghai": "Shanghai",
};

function calculateCareerStats(games) {
    const players = {};
    for (const game of games) {
        if (!game.winner) continue; 
        for (const player of game.players) {
            if (!players[player.name]) {
                players[player.name] = {
                    id: player.id,
                    name: player.name,
                    gamesPlayed: 0,
                    wins: 0,
                    totalDarts: 0,
                    singles: 0,
                    doubles: 0,
                    triples: 0,
                };
            }
            const career = players[player.name];
            career.gamesPlayed += 1;
            career.wins += game.winner.name === player.name ? 1 : 0;
            career.totalDarts += player.total_darts;
            career.singles += player.singles;
            career.doubles += player.doubles;
            career.triples += player.triples;
        }
    }
    return Object.values(players).sort((a, b) => b.wins - a.wins);
}

export default function Stats() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);   
    const [error, setError] = useState(null);   
    const [confirmDeleteGameId, setConfirmDeleteGameId] = useState(null);     

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

    async function handleDeleteGame(id) {
        try {
            await deleteGame(id);
            setGames(prev => prev.filter(g => g.id !== id));
            setConfirmDeleteGameId(null);
        } catch {
            setError("Could not delete game.");
        }
    }

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
                <Link to="/"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ‹‹ Back to setup
                </Link>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">No games played yet</p>
                <Link to="/"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ‹‹ Back to setup
                </Link>
            </div>
        );
    }

    const careerStats = calculateCareerStats(games);

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
                    Stats
                </h1>
                <Link to="/"
                    className="text-sm uppercase tracking-widest text-gray-400 hover:text-gray-400 transition-colors">
                    ‹‹ Setup
                </Link>
            </div>

            {/* Career stats */}
            <div className="mb-8">
                <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                    Career
                </div>
                <div className="flex flex-col gap-2">
                    {careerStats.map((player, index) => (
                        <Link key={player.name}
                            to={`/stats/players/${player.id}`}
                            className="rounded-xl border border-gray-800 bg-gray-900 p-3 block active:opacity-70 transition-opacity">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black tabular-nums w-4"
                                        style={{ color: index === 0 ? "#d4a017" : "#4b5563" }}>
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-black uppercase tracking-wide text-gray-100">
                                        {player.name}
                                    </span>
                                </div>
                                <span className="text-sm font-bold tabular-nums"
                                    style={{ color: "#cc2200" }}>
                                    {player.wins}W — {player.gamesPlayed - player.wins}L
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-center">
                                {[
                                    { label: "Darts", value: player.totalDarts },
                                    { label: "Singles", value: player.singles },
                                    { label: "Doubles", value: player.doubles },
                                    { label: "Triples", value: player.triples },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-lg bg-gray-800 py-1 px-1">
                                        <div className="text-sm font-black tabular-nums text-gray-100">{value}</div>
                                        <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-[1px]">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Game history */}
            <div>
                <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                    History
                </div>
                <div className="flex flex-col gap-2">
                    {games.map((game) => (
                        <Link key={game.id}
                            to={`/stats/games/${game.id}`}
                            state={{ game }}
                            className="rounded-xl border border-gray-800 bg-gray-900 p-3 block">

                            {/* Date + mode badge + delete + winner */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        {new Date(game.played_at).toLocaleDateString(undefined, {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </span>
                                    {/* Gamemode badge */}
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: "#1a4731", color: "#86efac" }}>
                                        {GAME_MODE_LABEL[game.game_mode] ?? game.game_mode}
                                    </span>
                                    {confirmDeleteGameId === game.id ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteGameId(null); }}
                                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-150"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteGame(game.id); }}
                                                className="text-xs font-black text-red-500 hover:text-red-400 transition-colors duration-150"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteGameId(game.id); }}
                                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-150"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <span className="text-sm font-black uppercase tracking-wider"
                                    style={{ color: "#cc2200" }}>
                                    🎯 {game.winner?.name ?? "Unknown"}
                                </span>
                            </div>

                            {/* Players */}
                            <div className="flex flex-col gap-1">
                                {game.players.map(player => (
                                    <div key={player.name}
                                        className="flex items-center justify-between text-xs">
                                        <span className={game.winner && player.name === game.winner.name
                                            ? "font-bold text-gray-100"
                                            : "text-gray-500"}>
                                            {player.name}
                                        </span>
                                        <span className="tabular-nums text-gray-500">
                                            {player.points}pts · {player.total_darts} darts
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}