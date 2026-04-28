import { SEQUENCES, getProgressIndex, processAroundTheClockTurn } from "../utils/ATCLogic";

export default function PlayerCardAroundTheClock({ player, isActive, order, currentTurn }) {
    console.log("PlayerCardATC render — player.currentTarget:", player.currentTarget, "player.target:", player.target);
    const seq = SEQUENCES[order ?? "sequential"];
    const total = seq.length;

    const liveTarget = isActive && currentTurn?.length > 0
        ? processAroundTheClockTurn(player.currentTarget, currentTurn, order ?? "sequential").newTarget
        : player.currentTarget;

    const progressIndex = getProgressIndex(liveTarget, order ?? "sequential");
    const completed = progressIndex;
    const targetLabel = liveTarget === 25 ? "Bull" : liveTarget;
    const isLive = isActive && liveTarget !== player.currentTarget;

    return (
        <div className="flex flex-col items-center gap-1 py-1">
            {/* Current target */}
            <span
                className="text-4xl font-black tabular-nums transition-all duration-150"
                style={{ color: isActive ? (isLive ? "#22c55e" : "#cc2200") : "#9ca3af" }}>
                {targetLabel}
            </span>

            {/* Progress bar */}
            <div className="w-full rounded-full overflow-hidden"
                style={{ height: "6px", backgroundColor: "#1f2937" }}>
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                        width: `${(completed / (total - 1)) * 100}%`,
                        backgroundColor: isActive ? (isLive ? "#22c55e" : "#cc2200") : "#374151",
                    }}
                />
            </div>

            {/* Progress label */}
            <span className="text-[10px] uppercase tracking-widest tabular-nums"
                style={{ color: "#4b5563" }}>
                {completed}/{total - 1}
            </span>

            {/* Singles / Doubles / Triples */}
            <div className="w-full grid grid-cols-3 gap-1 mt-1">
                {[
                    { label: "S", value: player.darts.singles },
                    { label: "D", value: player.darts.doubles },
                    { label: "T", value: player.darts.triples },
                ].map(({ label, value }) => (
                    <div key={label}
                        className="flex flex-col items-center rounded-md py-[3px]"
                        style={{ backgroundColor: "#111827" }}>
                        <span className="text-lg font-black tabular-nums text-gray-100">
                            {value}
                        </span>
                        <span className="text-[12px] uppercase tracking-wider"
                            style={{ color: "#4b5563" }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}