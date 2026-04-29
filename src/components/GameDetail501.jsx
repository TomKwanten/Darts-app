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

export function computePlayerStats(player, turns, winnerId) {
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

export default function GameDetail501({ playerStats, game }) {
    return (
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
                                    {playerStats.map(({ player, bandCounts }) => {
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
    );
}