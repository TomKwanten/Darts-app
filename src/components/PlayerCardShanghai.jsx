import { processShanghaiTurn } from "../utils/ShanghaiLogic";

export default function PlayerCardShanghai({ player, isActive, currentTurn, round }) {
    const live = isActive && currentTurn?.length > 0
        ? processShanghaiTurn(currentTurn, round)
        : null;

    const displayScore = live ? player.score + live.pointsScored : player.score;
    const isLive = live && live.pointsScored > 0;

    return (
        <div className="flex flex-col items-center gap-1 py-1">
            <span
                className="text-4xl font-black tabular-nums transition-all duration-150"
                style={{ color: isActive ? (isLive ? "#22c55e" : "#cc2200") : "#9ca3af" }}>
                {displayScore}
            </span>

            <span className="text-[10px] uppercase tracking-widest" style={{ color: "#4b5563" }}>
                Round {round}
            </span>

            {live?.isShanghai && (
                <span className="text-xs font-black uppercase tracking-wider"
                    style={{ color: "#f59e0b" }}>
                    Shanghai!
                </span>
            )}

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
