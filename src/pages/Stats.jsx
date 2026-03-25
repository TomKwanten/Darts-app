import { useLocalStorage } from "../hooks/useLocalStorage";
import { Link } from "react-router-dom";

function calculateCareerStats(stats) {
    const players = {};
    for (const game of stats) {
        for (const player of game.players) {
            if (!players[player.name]) {
                players[player.name] = {
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
            career.wins += game.winner === player.name ? 1 : 0;
            career.totalDarts += player.darts.total;
            career.singles += player.darts.singles;
            career.doubles += player.darts.doubles;
            career.triples += player.darts.triples;
        }
    }
    return Object.values(players).sort((a, b) => b.wins - a.wins);
}

export default function Stats() {
    const [stats] = useLocalStorage("cricket-stats", []);

    if (stats.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">No games played yet</p>
                <Link to="/"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ← Back to setup
                </Link>
            </div>
        );
    }

    const careerStats = calculateCareerStats(stats);

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
                    Stats
                </h1>
                <Link to="/"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ← Setup
                </Link>
            </div>

            {/* Career stats */}
            <div className="mb-8">
                <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
                    Career
                </div>
                <div className="flex flex-col gap-2">
                    {careerStats.map((player, index) => (
                        <div key={player.name}
                            className="rounded-xl border border-gray-800 bg-gray-900 p-3">

                            {/* Name + win rate */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black tabular-nums w-4"
                                        style={{ color: index === 0 ? "#d4a017" : "#4b5563" }}>
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-black uppercase tracking-wide text-gray-100">
                                        {player.name}
                                    </span>
                                </div>
                                <span className="text-xs font-bold tabular-nums"
                                    style={{ color: "#cc2200" }}>
                                    {player.wins}W — {player.gamesPlayed - player.wins}L
                                </span>
                            </div>

                            {/* Dart breakdown */}
                            <div className="grid grid-cols-4 gap-1 text-center">
                                {[
                                    { label: "Darts", value: player.totalDarts },
                                    { label: "Singles", value: player.singles },
                                    { label: "Doubles", value: player.doubles },
                                    { label: "Triples", value: player.triples },
                                ].map(({ label, value }) => (
                                    <div key={label}
                                        className="rounded-lg bg-gray-800 py-1 px-1">
                                        <div className="text-sm font-black tabular-nums text-gray-100">
                                            {value}
                                        </div>
                                        <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-[1px]">
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Game history */}
            <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
                    History
                </div>
                <div className="flex flex-col gap-2">
                    {[...stats].reverse().map((game, index) => (
                        <div key={index}
                            className="rounded-xl border border-gray-800 bg-gray-900 p-3">

                            {/* Date + winner */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">
                                    {new Date(game.date).toLocaleDateString(undefined, {
                                        day: "numeric", month: "short", year: "numeric"
                                    })}
                                </span>
                                <span className="text-xs font-black uppercase tracking-wider"
                                    style={{ color: "#cc2200" }}>
                                    🎯 {game.winner}
                                </span>
                            </div>

                            {/* Players */}
                            <div className="flex flex-col gap-1">
                                {game.players.map(player => (
                                    <div key={player.name}
                                        className="flex items-center justify-between text-xs">
                                        <span className={player.name === game.winner
                                            ? "font-bold text-gray-100"
                                            : "text-gray-500"}>
                                            {player.name}
                                        </span>
                                        <span className="tabular-nums text-gray-500">
                                            {player.points}pts · {player.darts.total} darts
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}