const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

function renderMarks(count, number, allClosed) {
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

    return (
        <span className="flex gap-[2px] items-center justify-center">
            {Array.from({ length: maxMarks }).map((_, i) => (
                <span
                    key={i}
                    className="inline-block rounded-full transition-all duration-200"
                    style={{
                        width: "13px",
                        height: "13px",
                        backgroundColor: i < count ? "#cc2200" : "#374151",
                    }}
                />
            ))}
        </span>
    );
}

function dartLabel(dart) {
    if (dart.number === 0) return "Miss";
    const prefix = dart.multiplier === 2 ? "D" : dart.multiplier === 3 ? "T" : "S";
    const num = dart.number === 25 ? "B" : dart.number;
    return `${prefix}${num}`;
}

export default function PlayerCard({ player, isActive, gameMode, currentTurn, players }) {
    return (
        <div className="flex-1 rounded-xl border bg-gray-900 p-2 transition-all duration-300"
            style={{
                borderColor: isActive ? "#cc2200" : "#1f2937",
                boxShadow: isActive ? "0 0 16px #cc220044" : "none",
            }}>

            {/* Name + points (Cricket only) */}
            <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-sm font-black uppercase tracking-wide text-gray-100 truncate">
                    {player.name}
                </span>
                {gameMode === "cricket" && (
                    <span className="text-lg font-black tabular-nums" style={{ color: "#cc2200" }}>
                        {player.points}
                    </span>
                )}
            </div>

            {/* Active bar */}
            <div className="mb-2 h-[2px] rounded-full"
                style={{ backgroundColor: isActive ? "#cc2200" : "#1f2937" }} />

            {/* Current turn dart chips — always rendered for equal height */}
            <div className="flex gap-1 mb-2 px-1">
                {[0, 1, 2].map((i) => {
                    const dart = isActive ? currentTurn[i] : null;
                    return (
                        <div
                            key={i}
                            className="flex-1 rounded-md text-center text-[15px] font-black uppercase tracking-wide py-[3px] transition-all duration-150"
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
                        return (
                            <div key={number}
                                className="flex items-center justify-between px-1 py-[2px] rounded relative"
                                style={{ backgroundColor: allClosed ? "#080808" : closed ? "#0d0d0d" : "transparent" }}>
                                {allClosed && (
                                    <div className="absolute inset-x-0 top-1/2 h-[1px]"
                                        style={{ backgroundColor: "#374151" }} />
                                )}
                                <span className="text-xs font-bold tabular-nums w-6 text-right"
                                    style={{ color: allClosed ? "#1f2937" : closed ? "#374151" : "#9ca3af" }}>
                                    {number === 25 ? "B" : number}
                                </span>
                                <div className="flex items-center justify-end w-10">
                                    {renderMarks(player.marks[number], number, allClosed)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 501: remaining score */}
            {gameMode === "501" && (
                <div className="flex items-center justify-center py-2">
                    <span className="text-3xl font-black tabular-nums"
                        style={{ color: isActive ? "#cc2200" : "#9ca3af" }}>
                        {player.score}
                    </span>
                </div>
            )}
        </div>
    );
}