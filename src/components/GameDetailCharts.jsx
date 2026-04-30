import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar,
} from "recharts";

const PLAYER_COLOURS = [
    "#cc2200",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ec4899",
];

const CLOCKWISE_ORDER  = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5,25];
const SEQUENTIAL_ORDER = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25];

const noFocusProps = { tabIndex: -1, style: { outline: "none" } };

function computeATCBreakdownFromDartDetails(dartDetails, playerId) {
    const playerDarts = dartDetails
        .filter(d => d.player_id === playerId)
        .sort((a, b) => a.turn_number - b.turn_number || a.dart_number - b.dart_number);

    if (playerDarts.length === 0) return { breakdown: [] };

    // Detect order from first dart's number
    const firstNumber = playerDarts[0].number;
    const order = firstNumber === 20 ? "clockwise" : "sequential";
    const sequence = order === "clockwise" ? CLOCKWISE_ORDER : SEQUENTIAL_ORDER;

    const breakdown = {};
    for (const n of sequence) {
        breakdown[n] = { number: n, hits: 0, misses: 0, tries: 0 };
    }

    for (const dart of playerDarts) {
        const n = dart.number;
        if (!breakdown[n]) continue;
        breakdown[n].tries += 1;
        if (dart.multiplier > 0) {
            breakdown[n].hits += 1;
        } else {
            breakdown[n].misses += 1;
        }
    }

    return {
        breakdown: sequence.map(n => breakdown[n]).filter(d => d.tries > 0),
    };
}

export function ScoreProgressionChart({ chartData, players }) {
    return (
        <div className="mb-8">
            <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                Score Progression
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3" style={{ outline: "none" }}>
                <ResponsiveContainer width="100%" height={220} style={{ outline: "none" }}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                        {...noFocusProps}>
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
                        {players.map((player, index) => (
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
    );
}

export function ATCBreakdownCharts({ game }) {
    const dartDetails = game.dart_details ?? [];
    const hasDartDetails = dartDetails.length > 0;

    return (
        <>
            {game.players.map((player, pIndex) => {
                const colour = PLAYER_COLOURS[pIndex % PLAYER_COLOURS.length];

                if (!hasDartDetails) {
                    return (
                        <div key={player.id ?? player.name} className="mb-8">
                            <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                                <span style={{ color: colour }}>{player.name}</span> — Number Breakdown
                            </div>
                            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                                <p className="text-gray-500 text-sm">
                                    Detailed breakdown not available for this game.
                                    Play a new game to see per-dart statistics.
                                </p>
                            </div>
                        </div>
                    );
                }

                const { breakdown } = computeATCBreakdownFromDartDetails(dartDetails, player.id);
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
                                Darts thrown per number
                            </div>
                            <ResponsiveContainer width="100%" height={180} style={{ outline: "none" }}>
                                <BarChart
                                    data={breakdown}
                                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                    {...noFocusProps}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis
                                        dataKey="number"
                                        tick={{ fill: "#6b7280", fontSize: 8 }}
                                        tickFormatter={v => v === 25 ? "B" : v}
                                        interval={0}
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
        </>
    );
}