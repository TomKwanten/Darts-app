import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { processShanghaiTurn } from "../utils/ShanghaiLogic";

const MULTIPLIERS = [
    { label: "Single", value: 1 },
    { label: "Double", value: 2 },
    { label: "Triple", value: 3 },
];

export default function NumpadShanghai({ dartCounter, undoSubmit }) {
    const { gameState, dispatch } = useContext(GameContext);
    const dartsThisTurn = gameState.currentTurn.length;
    const turnFull = dartsThisTurn >= 3;
    const { round } = gameState;

    const { pointsScored, isShanghai } = processShanghaiTurn(gameState.currentTurn, round);

    function handleDart(multiplier) {
        if (turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number: round, multiplier } });
    }

    function handleMiss() {
        if (turnFull) return;
        dispatch({ type: "MISS_TURN" });
    }

    return (
        <div className="h-full flex flex-col rounded-2xl border border-gray-800 bg-gray-900 p-2 gap-2">
            {dartCounter}

            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">
                        Round {round} — Throwing at
                    </div>
                    <div className="text-7xl font-black tabular-nums transition-all duration-150"
                        style={{ color: "#cc2200" }}>
                        {round}
                    </div>
                    {pointsScored > 0 && (
                        <div className="text-sm font-black mt-1"
                            style={{ color: isShanghai ? "#f59e0b" : "#22c55e" }}>
                            +{pointsScored}{isShanghai ? " — Shanghai!" : ""}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3 w-full px-2">
                    {MULTIPLIERS.map((m) => (
                        <button
                            key={m.value}
                            onClick={() => handleDart(m.value)}
                            disabled={turnFull}
                            className="py-5 rounded-xl text-sm font-black uppercase tracking-wider
                                       transition-all duration-150 active:scale-95 disabled:opacity-25"
                            style={{
                                backgroundColor: "#1a4731",
                                color: "#86efac",
                            }}>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0">
                <button
                    onClick={handleMiss}
                    disabled={turnFull}
                    className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider
                               transition-all duration-150 active:scale-95 disabled:opacity-25"
                    style={{ backgroundColor: "#78350f", color: "#fbbf24" }}>
                    Miss
                </button>
            </div>

            {undoSubmit}
        </div>
    );
}
