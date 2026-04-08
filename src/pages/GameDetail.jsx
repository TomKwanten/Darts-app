import { useLocation, useNavigate, Link } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from "recharts";

const PLAYER_COLOURS = [
    "#cc2200",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ec4899",
];

export default function GameDetail() {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Guard: navigated here directly without state
    if (!state?.game) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">Game not found</p>
                <Link to="/stats"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ← Back to stats
                </Link>
            </div>
        );
    }

    const { game } = state;
    const hasTurns = Array.isArray(game.turns) && game.turns.length > 0;

    // Build chart data: one object per turn_number, with each player's running_total
    const chartData = hasTurns ? (() => {
        const maxTurn = Math.max(...game.turns.map(t => t.turn_number));
        return Array.from({ length: maxTurn }, (_, i) => {
            const turnNum = i + 1;
            const entry = { turn: turnNum };
            for (const player of game.players) {
                const turnRow = game.turns.find(
                    t => t.turn_number === turnNum && t.player_id === player.id
                );
                entry[player.name ?? "Unknown"] = turnRow?.running_total ?? null;
            }
            return entry;
        });
    })() : [];

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
                        Game Detail
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(game.played_at).toLocaleDateString(undefined, {
                            day: "numeric", month: "long", year: "numeric"
                        })}
                        {game.winner && (
                            <span className="ml-2 font-black uppercase tracking-wider"
                                style={{ color: "#cc2200" }}>
                                · 🎯 {game.winner.name}
                            </span>
                        )}
                    </p>
                </div>
                <Link to="/stats"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ← Stats
                </Link>
            </div>

            {/* Per-player stat cards */}
            <div className="mb-8">
                <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
                    Players
                </div>
                <div className="flex flex-col gap-2">
                    {game.players.map((player, index) => {
                        const isWinner = game.winner && player.name === game.winner.name;
                        const colour = PLAYER_COLOURS[index % PLAYER_COLOURS.length];
                        return (
                            <div key={player.id ?? player.name}
                                className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full inline-block"
                                            style={{ backgroundColor: colour }} />
                                        {player.id ? (
                                            <Link
                                                to={`/stats/players/${player.id}`}
                                                className="text-sm font-black uppercase tracking-wide text-gray-100 active:opacity-70 transition-opacity">
                                                {player.name ?? "Unknown"}
                                            </Link>
                                        ) : (
                                            <span className="text-sm font-black uppercase tracking-wide text-gray-100">
                                                {player.name ?? "Unknown"}
                                            </span>
                                        )}
                                        {isWinner && (
                                            <span className="text-xs font-black uppercase tracking-wider"
                                                style={{ color: "#cc2200" }}>
                                                🎯 Winner
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs tabular-nums text-gray-500">
                                        {player.points} pts
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 text-center">
                                    {[
                                        { label: "Darts", value: player.total_darts },
                                        { label: "Singles", value: player.singles },
                                        { label: "Doubles", value: player.doubles },
                                        { label: "Triples", value: player.triples },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-lg bg-gray-800 py-1 px-1">
                                            <div className="text-sm font-black tabular-nums text-gray-100">
                                                {value ?? 0}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-[1px]">
                                                {label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Score progression chart — hidden for old games without turns */}
            {hasTurns && (
                <div className="mb-8">
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
                        Score Progression
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData}
                                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="turn"
                                    tick={{ fill: "#6b7280", fontSize: 10 }}
                                    label={{ value: "Turn", position: "insideBottomRight", offset: -4, fill: "#6b7280", fontSize: 10 }} />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                    labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                                    itemStyle={{ fontSize: 11 }} />
                                <Legend
                                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                                {game.players.map((player, index) => (
                                    <Line
                                        key={player.id ?? player.name}
                                        type="monotone"
                                        dataKey={player.name ?? "Unknown"}
                                        stroke={PLAYER_COLOURS[index % PLAYER_COLOURS.length]}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                        connectNulls={true}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Turn-by-turn table — hidden for old games without turns */}
            {hasTurns && (
                <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
                        Turn by Turn
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-3 py-2 text-gray-500 font-normal uppercase tracking-wider">
                                        Turn
                                    </th>
                                    {game.players.map((player, index) => (
                                        <th key={player.id ?? player.name}
                                            className="text-right px-3 py-2 font-black uppercase tracking-wider"
                                            style={{ color: PLAYER_COLOURS[index % PLAYER_COLOURS.length] }}>
                                            {player.name ?? "Unknown"}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, i) => (
                                    <tr key={row.turn}
                                        className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800/40"}>
                                        <td className="px-3 py-2 tabular-nums text-gray-500">
                                            {row.turn}
                                        </td>
                                        {game.players.map((player) => {
                                            const name = player.name ?? "Unknown";
                                            return (
                                                <td key={player.id ?? name}
                                                    className="px-3 py-2 tabular-nums text-right text-gray-100">
                                                    {row[name] ?? "—"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}