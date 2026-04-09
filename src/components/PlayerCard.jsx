const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

function renderMarks(count, number) {
    const isBull = number === 25;
    const maxMarks = isBull ? 2 : 3;
    const closed = count === maxMarks;

    if (closed) {
        return (
            <span className="font-black text-xs leading-none" style={{ color: isBull ? "#d4a017" : "#cc2200" }}>
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
                        width: "5px",
                        height: "5px",
                        backgroundColor: i < count ? "#cc2200" : "#374151",
                    }}
                />
            ))}
        </span>
    );
}

export default function PlayerCard({ player, isActive, gameMode }) {
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
                    <span className="text-sm font-black tabular-nums" style={{ color: "#cc2200" }}>
                        {player.points}
                    </span>
                )}
            </div>

            {/* Active bar */}
            <div className="mb-2 h-[2px] rounded-full"
                style={{ backgroundColor: isActive ? "#cc2200" : "#1f2937" }} />

            {/* Cricket: marks grid */}
            {gameMode === "cricket" && (
                <div className="flex flex-col gap-[2px]">
                    {NUMBERS.map((number) => {
                        const isBull = number === 25;
                        const maxMarks = isBull ? 2 : 3;
                        const closed = player.marks[number] === maxMarks;
                        return (
                            <div key={number}
                                className="flex items-center justify-between px-1 py-[2px] rounded"
                                style={{ backgroundColor: closed ? "#0d0d0d" : "transparent" }}>
                                <span className="text-xs font-bold tabular-nums w-6 text-right"
                                    style={{ color: closed ? "#374151" : "#9ca3af" }}>
                                    {isBull ? "B" : number}
                                </span>
                                <div className="flex items-center justify-end w-10">
                                    {renderMarks(player.marks[number], number)}
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