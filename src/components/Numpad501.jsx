import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";

const NUMBERS_501 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

const MULTIPLIERS = [
    { label: "S", value: 1, full: "Single" },
    { label: "D", value: 2, full: "Double" },
    { label: "T", value: 3, full: "Triple" },
];

export default function Numpad501({ dartCounter, undoSubmit }) {
    const { gameState, dispatch } = useContext(GameContext);
    const dartsThisTurn = gameState.currentTurn.length;
    const turnFull = dartsThisTurn >= 3;

    const [selectedNumber, setSelectedNumber] = useState(null);

    function handleSelectNumber(n) {
        if (turnFull) return;
        setSelectedNumber(n);
    }

    function handleMultiplier(mult) {
        if (!selectedNumber || turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number: selectedNumber, multiplier: mult } });
        setSelectedNumber(null);
    }

    function handleMiss() {
        if (turnFull) return;
        dispatch({ type: "MISS_TURN" });
        setSelectedNumber(null);
    }

    function handleBust() {
        dispatch({ type: "BUST_TURN" });
        setSelectedNumber(null);
    }

    const missAndBust = (
        <div className="grid grid-cols-2 gap-2 flex-shrink-0 pt-1">
            <button
                onClick={handleMiss}
                disabled={turnFull}
                className="py-2 rounded-xl text-xs font-black uppercase tracking-wider
                        transition-all duration-150 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: "#78350f", color: "#fbbf24" }}>
                Miss
            </button>
            <button
                onClick={handleBust}
                disabled={turnFull}
                className="py-2 rounded-xl text-xs font-black uppercase tracking-wider
                        transition-all duration-150 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: "#78350f", color: "#fbbf24" }}>
                Bust
            </button>
        </div>
    );

    return (
        <div className="h-full flex flex-col rounded-2xl border border-gray-800 bg-gray-900 p-2 gap-1">
            {dartCounter}

            {/* Number hint */}
            <div className="text-center text-xs text-gray-500 flex-shrink-0">
                {turnFull
                    ? "turn full — submit"
                    : selectedNumber
                        ? `${selectedNumber === 25 ? "Bull" : selectedNumber} selected`
                        : "tap a number"}
            </div>

            {/* 1–20 grid */}
            <div className="flex-1 grid grid-cols-4 gap-3 min-h-0 p-2">
                {NUMBERS_501.map((n) => (
                    <button
                        key={n}
                        onClick={() => handleSelectNumber(n)}
                        disabled={turnFull}
                        className="rounded-lg text-lg font-black transition-all duration-150 active:scale-95"
                        style={{
                            backgroundColor: selectedNumber === n ? "#cc2200" : turnFull ? "#111827" : "#1a4731",
                            color: selectedNumber === n ? "#ffffff" : turnFull ? "#374151" : "#86efac",
                            cursor: turnFull ? "not-allowed" : "pointer",
                        }}>
                        {n}
                    </button>
                ))}
            </div>

            {/* Bull button (half-width, centred) */}
            <div className="grid grid-cols-3 gap-1 flex-shrink-0 pb-2">
                <div />
                <button
                    onClick={() => handleSelectNumber(25)}
                    disabled={turnFull}
                    className="py-5 rounded-lg text-sm font-black transition-all duration-150 active:scale-95"
                    style={{
                        backgroundColor: selectedNumber === 25 ? "#cc2200" : turnFull ? "#111827" : "#1a4731",
                        color: selectedNumber === 25 ? "#ffffff" : turnFull ? "#374151" : "#86efac",
                        cursor: turnFull ? "not-allowed" : "pointer",
                    }}>
                    Bull
                </button>
            </div>

            {/* S / D / T multiplier buttons */}
            <div className="grid grid-cols-3 gap-1 flex-shrink-0 pb-1">
                {MULTIPLIERS.map((m) => {
                    const isBullTriple = selectedNumber === 25 && m.value === 3;
                    const disabled = !selectedNumber || turnFull || isBullTriple;
                    return (
                        <button
                            key={m.value}
                            onClick={() => handleMultiplier(m.value)}
                            disabled={disabled}
                            className="py-3 rounded-xl text-xs font-black uppercase tracking-wider
                                       transition-all duration-150 active:scale-95"
                            style={{
                                backgroundColor: disabled ? "#111827" : "#cc2200",
                                color: disabled ? "#374151" : "#ffffff",
                                cursor: disabled ? "not-allowed" : "pointer",
                            }}>
                            {m.full}
                        </button>
                    );
                })}
            </div>

            {missAndBust}
            {undoSubmit}
        </div>
    );
}