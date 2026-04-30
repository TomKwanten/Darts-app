import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { processAroundTheClockTurn } from "../utils/ATCLogic";

const MULTIPLIERS = [
    { label: "S", value: 1, full: "Single" },
    { label: "D", value: 2, full: "Double" },
    { label: "T", value: 3, full: "Triple" },
];

export default function NumpadATC({ undoSubmit }) {
    const { gameState, dispatch } = useContext(GameContext);
    const { currentTurn, currentPlayerIndex, players } = gameState;
    const dartsThisTurn = currentTurn.length;
    const turnFull = dartsThisTurn >= 3;

    const currentPlayer = players[currentPlayerIndex];

    const { newTarget } = processAroundTheClockTurn(
        currentPlayer?.currentTarget ?? 1,
        currentTurn,
        gameState.order
    );
    const target = newTarget;
    const isBull = target === 25;

    // Dart indicator — which dart we're on (1, 2, 3)
    const dartIndex = dartsThisTurn + 1;

    function handleDart(multiplier) {
        if (turnFull) return;
        dispatch({
            type: "ADD_DART_ATC",
            payload: { number: target, multiplier },
        });
    }

    function handleMiss() {
        if (turnFull) return;
        // Miss on the current target number — not a generic 0
        dispatch({
            type: "ADD_DART_ATC",
            payload: { number: target, multiplier: 0 },
        });
    }

    return (
        <div className="h-full flex flex-col rounded-2xl border border-gray-800 bg-gray-900 p-2 gap-2">

            {/* Dart counter — shows which dart we're on */}
            <div className="flex gap-1 px-1 pt-1">
                {[1, 2, 3].map((d) => {
                    const thrown = d <= dartsThisTurn;
                    const current = d === dartIndex && !turnFull;
                    return (
                        <div
                            key={d}
                            className="flex-1 h-1.5 rounded-full transition-all duration-150"
                            style={{
                                backgroundColor: thrown
                                    ? "#cc2200"
                                    : current
                                        ? "#374151"
                                        : "#1f2937",
                            }}
                        />
                    );
                })}
            </div>

            {/* Big target display */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">
                        Dart {Math.min(dartIndex, 3)} — Hit
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