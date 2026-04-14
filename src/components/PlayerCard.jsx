import { getCheckout } from "../utils/checkouts";

const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

const RANK_COLORS = {
    1: "#f59e0b", // gold
    2: "#9ca3af", // silver
    3: "#b45309", // bronze
};

function getRankColor(rank) {
    return RANK_COLORS[rank] ?? "#374151"; // grey for 4th+
}

function computePendingHits(currentTurn, number) {
    // Sum multipliers of darts that hit this number
    return currentTurn.reduce((sum, dart) => {
        if (dart.number === number) return sum + dart.multiplier;
        return sum;
    }, 0);
}

function renderMarks(count, number, allClosed, pendingHits = 0) {
    const maxMarks = 3;
    const isBull = number === 25;
    const closed = count === maxMarks;

    if (closed || allClosed) {
        return (
            <span className="font-black text-sm leading-none"
                style={{ color: allClosed ? "#374151" : (isBull ? "#d4a017" : "#cc2200") }}>
                ✕
            </span>
        );
    }

    // How many pending hits actually land (can't exceed remaining slots)
    const remaining = maxMarks - count;
    const pendingLanding = Math.min(pendingHits, remaining);

    return (
        <span className="flex gap-[2px] items-center justify-end">
            {Array.from({ length: maxMarks }).map((_, i) => {
                const isConfirmed = i < count;
                const isPending = !isConfirmed && i < count + pendingLanding;
                return (
                    <span
                        key={i}
                        className="inline-block rounded-full transition-all duration-200"
                        style={{
                            width: "10px",
                            height: "10px",
                            backgroundColor: isConfirmed
                                ? "#cc2200"      // confirmed hit — red
                                : isPending
                                    ? "#22c55e"  // pending hit — green
                                    : "#374151", // empty — dark grey
                        }}
                    />
                );
            })}
        </span>
    );
}

function dartLabel(dart) {
    if (dart.number === 0) return "Miss";
    const prefix = dart.multiplier === 2 ? "D" : dart.multiplier === 3 ? "T" : "S";
    const num = dart.number === 25 ? "B" : dart.number;
    return `${prefix}${num}`;
}

export default function PlayerCard({ player, isActive, gameMode, currentTurn, players, rank, finishMultiplier }) {
    return (
        <div className="flex-1 rounded-xl border bg-gray-900 p-1.5 transition-all duration-300"
            style={{
                borderColor: isActive ? "#cc2200" : "#1f2937",
                boxShadow: isActive ? "0 0 16px #cc220044" : "none",
            }}>

            {/* Row 1: Name */}
            <div className="px-0.5 mb-0.5">
                <span className="text-xs font-black uppercase tracking-wide text-gray-100 truncate block">
                    {player.name}
                </span>
            </div>

            {/* Row 2: Rank + points */}
            <div className="flex items-center justify-between px-0.5 mb-1">
                {rank && (
                    <span
                        className="text-[10px] font-black tabular-nums uppercase tracking-wide"
                        style={{ color: getRankColor(rank) }}>
                        #{rank}
                    </span>
                )}
                {gameMode === "cricket" && (
                    <span className="text-sm font-black tabular-nums ml-auto" style={{ color: "#cc2200" }}>
                        {player.points}
                    </span>
                )}
            </div>

            {/* Active bar */}
            <div className="mb-1.5 h-[2px] rounded-full"
                style={{ backgroundColor: isActive ? "#cc2200" : "#1f2937" }} />

            {/* Current turn dart chips */}
            <div className="flex gap-0.5 mb-1.5 px-0.5">
                {[0, 1, 2].map((i) => {
                    const dart = isActive ? currentTurn[i] : null;
                    return (
                        <div
                            key={i}
                            className="flex-1 rounded-md text-center text-[11px] font-black uppercase tracking-wide py-[2px] transition-all duration-150 min-w-0"
                            style={{
                                backgroundColor: dart ? "#1a4731" : (isActive ? "#1f2937" : "transparent"),
                                color: dart ? "#86efac" : "transparent",
                            }}>
                            {dart ? dartLabel(dart) : "·"}
                        </div>
                    );
                })}
            </div>

            {/* Cricket: marks grid */}
            {gameMode === "cricket" && (
                <div className="flex flex-col gap-[2px]">
                    {NUMBERS.map((number) => {
                        const maxMarks = 3;
                        const allClosed = players
                            ? players.every(p => p.marks[number] === maxMarks)
                            : false;
                        const closed = player.marks[number] === maxMarks;
                        const pendingHits = isActive
                            ? computePendingHits(currentTurn, number)
                            : 0;
                        return (
                            <div key={number}
                                className="flex items-center justify-between px-0.5 py-[2px] rounded relative"
                                style={{ backgroundColor: allClosed ? "#080808" : closed ? "#0d0d0d" : "transparent" }}>
                                {allClosed && (
                                    <div className="absolute inset-x-0 top-1/2 h-[1px]"
                                        style={{ backgroundColor: "#374151" }} />
                                )}
                                <span className="text-[11px] font-bold tabular-nums w-5 text-right shrink-0"
                                    style={{ color: allClosed ? "#1f2937" : closed ? "#374151" : "#9ca3af" }}>
                                    {number === 25 ? "B" : number}
                                </span>
                                <div className="flex items-center justify-end flex-1 pl-1">
                                    {renderMarks(player.marks[number], number, allClosed, pendingHits)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 501: remaining score */}
            {gameMode === "501" && (() => {
                const turnTotal = isActive
                    ? currentTurn.reduce((sum, d) => sum + d.number * d.multiplier, 0)
                    : 0;
                const displayed = player.score - turnTotal;
                const isBust = displayed < 0 || displayed === 1;
                const isRunning = isActive && currentTurn.length > 0;
                const checkout = isActive && !isBust ? getCheckout(displayed, finishMultiplier) : null;

                return (
                    <div className="flex flex-col items-center justify-center py-2 gap-1">
                        <span className="text-3xl font-black tabular-nums"
                            style={{
                                color: isBust ? "#f59e0b" : isRunning ? "#22c55e" : isActive ? "#cc2200" : "#9ca3af",
                            }}>
                            {displayed}
                        </span>
                        {checkout && (
                            <div className="flex gap-1">
                                {checkout.split(" ").map((token, i) => (
                                    <span
                                        key={i}
                                        className="text-[11px] font-bold rounded px-0.5 py-0.5"
                                        style={{ color: "#22c55e", backgroundColor: "#1a4731" }}
                                    >
                                        {token}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
}