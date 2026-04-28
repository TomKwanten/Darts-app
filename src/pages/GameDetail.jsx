import { useLocation, Link } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell,
} from "recharts";

const PLAYER_COLOURS = [
    "#cc2200",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ec4899",
];

const SCORE_BANDS = [
    { label: "180",  min: 180, max: 180 },
    { label: "160+", min: 160, max: 179 },
    { label: "140+", min: 140, max: 159 },
    { label: "120+", min: 120, max: 139 },
    { label: "100+", min: 100, max: 119 },
    { label: "80+",  min: 80,  max: 99  },
    { label: "60+",  min: 60,  max: 79  },
    { label: "40+",  min: 40,  max: 59  },
    { label: "1–39", min: 1,   max: 39  },
];

const CLOCKWISE_ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5,25];
const SEQUENTIAL_ORDER = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25];

function getStartNumber(order) {
    return order === "clockwise" ? 20 : 1;
}

function detectOrder(turns) {
    if (!turns || turns.length === 0) return "sequential";
    const first = turns[0];
    return (first.running_total <= 2) ? "sequential" : "clockwise";
}

function computeATCNumberBreakdown(playerTurns, order) {
    const breakdown = {};
    const sequence = order === "clockwise" ? CLOCKWISE_ORDER : SEQUENTIAL_ORDER;
    for (const n of sequence) {
        breakdown[n] = { number: n, tries: 0, hits: 0, misses: 0 };
    }

    let prevTarget = getStartNumber(order);

    for (const turn of playerTurns) {
        const aimed = prevTarget;
        if (breakdown[aimed]) {
            breakdown[aimed].tries += 1;
            if (turn.points_scored === 1) {
                breakdown[aimed].hits += 1;
            } else {
                breakdown[aimed].misses += 1;
            }
        }
        prevTarget = turn.running_total;
    }

    return sequence.map(n => breakdown[n]).filter(d => d.tries > 0);
}

function computePlayerStats(player, turns, winnerId) {
    const playerTurns = turns.filter(t => t.player_id === player.id);
    const turnCount = playerTurns.length;
    const totalPoints = playerTurns.reduce((sum, t) => sum + (t.points_scored ?? 0), 0);
    const avg = turnCount > 0 ? (totalPoints / turnCount).toFixed(1) : "—";
    const high = turnCount > 0 ? Math.max(...playerTurns.map(t => t.points_scored ?? 0)) : "—";
    const busts = playerTurns.filter(t => (t.points_scored ?? 0) === 0).length;
    const checkoutTurn = playerTurns.find(t => t.running_total === 0);
    const checkout = checkoutTurn ? checkoutTurn.points_scored : "—";
    const bandCounts = SCORE_BANDS.map(band => ({
        label: band.label,
        count: playerTurns.filter(t => {
            const s = t.points_scored ?? 0;
            return s >= band.min && s <= band.max;
        }).length,
    }));
    return { turnCount, avg, high, busts, checkout, bandCounts };
}

const GAME_MODE_LABEL = {
    cricket: "Cricket",
    "501": "501",
    "around-the-clock": "Around the Clock",
    "around-the-clock-solo": "Around the Clock",
    "shanghai": "Shanghai",
};

const NO_POINTS_MODES = ["around-the-clock", "around-the-clock-solo"];

// Shared style to suppress the focus outline Recharts renders on mobile tap
const chartContainerStyle = { outline: "none" };

export default function GameDetail() {
    const { state } = useLocation();

    if (!state?.game) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">Game not found</p>
                <Link to="/stats"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ‹‹ Back to stats
                </Link>
            </div>
        );
    }

    const { game } = state;
    const hasTurns = Array.isArray(game.turns) && game.turns.length > 0;
    const is501 = game.game_mode === "501";
    const isATC = game.game_mode === "around-the-clock" || game.game_mode === "around-the-clock-solo";
    const showPoints = !NO_POINTS_MODES.includes(game.game_mode);

    const detectedOrder = hasTurns ? detectOrder(game.turns) : "sequential";

    const chartData = hasTurns && !isATC ? (() => {
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

    const playerStats = (hasTurns && is501)
        ? game.players.map(player => ({
            player,
            ...computePlayerStats(player, game.turns, game.winner?.id),
        }))
        : [];

    const atcBreakdowns = isATC && hasTurns
        ? game.players.map(player => {
            const playerTurns = game.turns
                .filter(t => t.player_id === player.id)
                .sort((a, b) => a.turn_number - b.turn_number);
            return {
                player,
                breakdown: computeATCNumberBreakdown(playerTurns, detectedOrder),
            };
        })
        : [];

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
                        {GAME_MODE_LABEL[game.game_mode] ?? game.game_mode}
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(game.played_at).toLocaleDateString(undefined, {
                            day: "numeric", month: "long", year: "numeric"
                        })}
                        {game.winner && (
                            <span className="text-sm ml-2 font-black uppercase tracking-wider"
                                style={{ color: "#cc2200" }}>
                                · 🎯 {game.winner.name}
                            </span>
                        )}
                    </p>
                </div>
                <Link to="/stats"
                    className="text-sm uppercase tracking-widest text-gray-400 hover:text-gray-400 transition-colors">
                    ‹‹ Stats
                </Link>
            </div>

            {/* Per-player stat cards */}
            <div className="mb-8">
                <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                    Players
                </div>
                <div className="flex flex-col gap-2">
                    {game.players.map((player, index) => {
                        const isWinner = game.winner && player.name === game.winner.name;
                        const colour = PLAYER_COLOURS[index % PLAYER_COLOURS.length];
                        const misses = player.total_darts - player.singles - player.doubles - player.triples;
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
                                    {showPoints && (
                                        <span className="text-xs tabular-nums text-gray-500">
                                            {player.points} pts
                                        </span>
                                    )}
                                </div>

                                {isATC ? (
                                    <div className="grid grid-cols-5 gap-1 text-center">
                                        {[
                                            { label: "Darts", value: player.total_darts },
                                            { label: "Singles", value: player.singles },
                                            { label: "Doubles", value: player.doubles },
                                            { label: "Triples", value: player.triples },
                                            { label: "Misses", value: misses },
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
                                ) : (
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
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Score progression chart — not for ATC */}
            {hasTurns && !isATC && (
                <div className="mb-8">
                    <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                        Score Progression
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                        <ResponsiveContainer width="100%" height={220} style={chartContainerStyle}>
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
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
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

            {/* ATC: Number Breakdown per player */}
            {isATC && hasTurns && atcBreakdowns.map(({ player, breakdown }, pIndex) => {
                const colour = PLAYER_COLOURS[pIndex % PLAYER_COLOURS.length];
                const hardest = breakdown.reduce((best, d) =>
                    d.misses > (best?.misses ?? -1) ? d : best, null);

                return (
                    <div key={player.id ?? player.name} className="mb-8">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                            <span style={{ color: colour }}>{player.name}</span> — Number Breakdown
                        </div>

                        {hardest && hardest.misses > 0 && (
                            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 mb-3 flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-black tabular-nums"
                                        style={{ color: "#cc2200" }}>
                                        {hardest.number === 25 ? "B" : hardest.number}
                                    </div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">
                                        Hardest
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                                    {[
                                        { label: "Tries", value: hardest.tries },
                                        { label: "Hits", value: hardest.hits },
                                        { label: "Misses", value: hardest.misses },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-lg bg-gray-800 py-2">
                                            <div className="text-lg font-black tabular-nums text-gray-100">{value}</div>
                                            <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-[1px]">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                                Turns needed per number
                            </div>
                            <ResponsiveContainer width="100%" height={180} style={chartContainerStyle}>
                                <BarChart
                                    data={breakdown}
                                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis
                                        dataKey="number"
                                        tick={{ fill: "#6b7280", fontSize: 9 }}
                                        tickFormatter={v => v === 25 ? "B" : v}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: "#6b7280", fontSize: 9 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                        labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                                        labelFormatter={v => v === 25 ? "Bull" : `Number ${v}`}
                                        formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                                        itemStyle={{ fontSize: 11 }}
                                    />
                                    <Bar dataKey="hits" name="hits" stackId="a" fill="#1a4731" />
                                    <Bar dataKey="misses" name="misses" stackId="a" fill="#cc2200" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex gap-3 justify-center mt-1">
                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#1a4731" }} />
                                    Hits
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#cc2200" }} />
                                    Misses
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* 501-only: Key Stats + Score Bands */}
            {hasTurns && is501 && (
                <>
                    <div className="mb-8">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                            Key Stats
                        </div>
                        <div className="flex flex-col gap-2">
                            {playerStats.map(({ player, avg, high, busts, checkout }, index) => {
                                const colour = PLAYER_COLOURS[index % PLAYER_COLOURS.length];
                                const isWinner = game.winner && player.id === game.winner.id;
                                return (
                                    <div key={player.id ?? player.name}
                                        className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full inline-block"
                                                style={{ backgroundColor: colour }} />
                                            <span className="text-sm font-black uppercase tracking-wide text-gray-100">
                                                {player.name ?? "Unknown"}
                                            </span>
                                            {isWinner && (
                                                <span className="text-xs font-black uppercase tracking-wider"
                                                    style={{ color: "#cc2200" }}>
                                                    🎯
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-4 gap-1 text-center">
                                            {[
                                                { label: "Avg", value: avg },
                                                { label: "High", value: high },
                                                { label: "Busts", value: busts },
                                                { label: "Checkout", value: checkout },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="rounded-lg bg-gray-800 py-1 px-1">
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
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                            Score Bands
                        </div>
                        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left px-3 py-2 text-gray-400 font-normal uppercase tracking-wider">
                                            Score
                                        </th>
                                        {playerStats.map(({ player, turnCount }, index) => (
                                            <th key={player.id ?? player.name}
                                                className="text-center px-3 py-2 font-black uppercase tracking-wider"
                                                style={{ color: PLAYER_COLOURS[index % PLAYER_COLOURS.length] }}>
                                                <div>{player.name ?? "Unknown"}</div>
                                                <div className="text-lg font-black tabular-nums text-gray-100 leading-tight">
                                                    {turnCount}
                                                </div>
                                                <div className="text-[9px] font-normal text-gray-500 uppercase tracking-wider">
                                                    turns
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {SCORE_BANDS.map((band, bandIndex) => (
                                        <tr key={band.label}
                                            className={bandIndex % 2 === 0 ? "bg-gray-900" : "bg-gray-800/40"}>
                                            <td className="px-3 py-2">
                                                <span className="inline-block bg-gray-700/60 text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-lg px-2 py-1">
                                                    {band.label}
                                                </span>
                                            </td>
                                            {playerStats.map(({ player, bandCounts }, index) => {
                                                const count = bandCounts.find(b => b.label === band.label)?.count ?? 0;
                                                return (
                                                    <td key={player.id ?? player.name}
                                                        className="text-center px-3 py-2 tabular-nums font-black text-gray-100">
                                                        {count > 0 ? count : (
                                                            <span className="text-gray-600">0</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}