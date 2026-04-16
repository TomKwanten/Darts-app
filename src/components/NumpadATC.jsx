import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { processAroundTheClockTurn } from "../utils/ATCLogic";

const MULTIPLIERS = [
    { label: "S", value: 1, full: "Single" },
    { label: "D", value: 2, full: "Double" },
    { label: "T", value: 3, full: "Triple" },
];

export default function NumpadATC({ dartCounter, undoSubmit }) {
    const { gameState, dispatch } = useContext(GameContext);
    const dartsThisTurn = gameState.currentTurn.length;
    const turnFull = dartsThisTurn >= 3;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Simulate the darts thrown so far this turn to get the live current target
    const { newTarget } = processAroundTheClockTurn(
        currentPlayer?.target ?? 1,
        gameState.currentTurn,
        gameState.order
    );
    const target = newTarget;
    const isBull = target === 25;

    function handleDart(multiplier) {
        if (turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number: target, multiplier } });
    }

    function handleMiss() {
        if (turnFull) return;
        dispatch({ type: "MISS_TURN" });
    }

    return (
        <div className="h-full flex flex-col rounded-2xl border border-gray-800 bg-gray-900 p-2 gap-2">
            {dartCounter}

            {/* Big target display */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">
                        Hit
                    </div>
                    <div className="text-7xl font-black tabular-nums transition-all duration-150"
                        style={{ color: "#cc2200" }}>
                        {isBull ? "Bull" : target}
                    </div>
                </div>

                {/* S / D / T buttons — Bull has no triple */}
                <div className="grid grid-cols-3 gap-3 w-full px-2">
                    {MULTIPLIERS.map((m) => {
                        const isBullTriple = isBull && m.value === 3;
                        const disabled = turnFull || isBullTriple;
                        return (
                            <button
                                key={m.value}
                                onClick={() => handleDart(m.value)}
                                disabled={disabled}
                                className="py-5 rounded-xl text-sm font-black uppercase tracking-wider
                                           transition-all duration-150 active:scale-95"
                                style={{
                                    backgroundColor: disabled ? "#111827" : "#1a4731",
                                    color: disabled ? "#374151" : "#86efac",
                                    cursor: disabled ? "not-allowed" : "pointer",
                                }}>
                                {m.full}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Miss button */}
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