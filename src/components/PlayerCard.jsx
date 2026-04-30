import PlayerCardCricket from "./PlayerCardCricket";
import PlayerCard501 from "./PlayerCard501";
import PlayerCardAroundTheClock from "./PlayerCardATC";
import PlayerCardShanghai from "./PlayerCardShanghai";

const RANK_COLORS = {
    1: "#f59e0b", // gold
    2: "#9ca3af", // silver
    3: "#b45309", // bronze
};

function getRankColor(rank) {
    return RANK_COLORS[rank] ?? "#374151";
}

function dartLabel(dart) {
    if (dart.number === 0 || dart.multiplier === 0) return "Miss";
    const prefix = dart.multiplier === 2 ? "D" : dart.multiplier === 3 ? "T" : "S";
    const num = dart.number === 25 ? "B" : dart.number;
    return `${prefix}${num}`;
}

export default function PlayerCard({ player, isActive, gameMode, currentTurn, players, rank, finishMultiplier, order, round }) {
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

            {/* Row 2: Rank + points + gepikt */}
            <div className="flex items-center justify-between px-0.5 mb-1">
                {rank && (
                    <span
                        className="text-[10px] font-black tabular-nums uppercase tracking-wide"
                        style={{ color: getRankColor(rank) }}>
                        #{rank}
                    </span>
                )}
                {gameMode === "cricket" && (
                    <div className="flex items-center gap-2 ml-auto">
                        {player.gepikt > 0 && (
                            <span className="text-[10px] font-black uppercase tracking-wide"
                                style={{ color: "#a78bfa" }}>
                                🎯 {player.gepikt}
                            </span>
                        )}
                        <span className="text-sm font-black tabular-nums" style={{ color: "#cc2200" }}>
                            {player.points}
                        </span>
                    </div>
                )}
            </div>

            {/* Active bar */}
            <div className="mb-1.5 h-[2px] rounded-full"
                style={{ backgroundColor: isActive ? "#cc2200" : "#1f2937" }} />

            {/* Current turn dart chips */}
            <div className="flex gap-0.5 mb-1.5 px-0.5">
                {[0, 1, 2].map((i) => {
                    const dart = isActive ? currentTurn[i] : null;
                    const isMiss = dart && (dart.number === 0 || dart.multiplier === 0);
                    return (
                        <div
                            key={i}
                            className="flex-1 rounded-md text-center text-[11px] font-black uppercase tracking-wide py-[2px] transition-all duration-150 min-w-0"
                            style={{
                                backgroundColor: dart
                                    ? (dart.gepikt ? "#78350f" : isMiss ? "#374151" : "#1a4731")
                                    : (isActive ? "#1f2937" : "transparent"),
                                color: dart
                                    ? (dart.gepikt ? "#fbbf24" : isMiss ? "#6b7280" : "#86efac")
                                    : "transparent",
                            }}>
                            {dart ? dartLabel(dart) : "·"}
                        </div>
                    );
                })}
            </div>

            {/* Mode-specific bottom section */}
            {gameMode === "cricket" && (
                <PlayerCardCricket
                    player={player}
                    isActive={isActive}
                    currentTurn={currentTurn}
                    players={players}
                />
            )}
            {gameMode === "501" && (
                <PlayerCard501
                    player={player}
                    isActive={isActive}
                    currentTurn={currentTurn}
                    finishMultiplier={finishMultiplier}
                />
            )}
            {(gameMode === "around-the-clock" || gameMode === "around-the-clock-solo") && (
                <PlayerCardAroundTheClock
                    player={player}
                    isActive={isActive}
                    order={order}
                    currentTurn={currentTurn}
                />
            )}
            {gameMode === "shanghai" && (
                <PlayerCardShanghai
                    player={player}
                    isActive={isActive}
                    currentTurn={currentTurn}
                    round={round}
                />
            )}
        </div>
    );
}