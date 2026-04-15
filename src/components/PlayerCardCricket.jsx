const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

function computePendingHits(currentTurn, number) {
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
                                ? "#cc2200"
                                : isPending
                                    ? "#22c55e"
                                    : "#374151",
                        }}
                    />
                );
            })}
        </span>
    );
}

export default function PlayerCardCricket({ player, isActive, currentTurn, players }) {
    return (
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
    );
}