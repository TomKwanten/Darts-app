import { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";

const CRICKET_NUMBERS = [15, 16, 17, 18, 19, 20, 25];
const NUMBERS_501 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

const MULTIPLIERS = [
    { label: "S", value: 1, full: "Single" },
    { label: "D", value: 2, full: "Double" },
    { label: "T", value: 3, full: "Triple" },
];

export default function Numpad() {
    const { gameState, dispatch } = useContext(GameContext);
    const { gameMode } = gameState;
    const dartsThisTurn = gameState.currentTurn.length;
    const turnFull = dartsThisTurn >= 3;

    const [selectedNumber, setSelectedNumber] = useState(null);

    function handleDart(number, multiplier) {
        if (turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number, multiplier } });
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

    function handleSelectNumber(n) {
        if (turnFull) return;
        setSelectedNumber(n);
    }

    function handleMultiplier(mult) {
        if (!selectedNumber || turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number: selectedNumber, multiplier: mult } });
        setSelectedNumber(null);
    }

    // Reset selectedNumber when turn advances (new player's turn)
    // This is handled naturally because dartsThisTurn resets to 0 after SUBMIT_TURN

    const dartCounter = (
        <div className="flex items-center justify-center gap-2 flex-shrink-0 py-1">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-all duration-200"
                    style={{
                        backgroundColor: i < dartsThisTurn ? "#cc2200" : "#1f2937",
                        boxShadow: i < dartsThisTurn ? "0 0 6px #cc220099" : "none",
                    }}
                />
            ))}
            <span className="text-xs text-gray-600 uppercase tracking-widest ml-1">
                {dartsThisTurn} / 3
            </span>
        </div>
    );

    const undoSubmit = (
        <div className="grid grid-cols-2 gap-2 flex-shrink-0 pt-1">
            <button
                onClick={() => {
                    dispatch({ type: "UNDO_DART" });
                    setSelectedNumber(null);
                }}
                disabled={dartsThisTurn === 0 && gameState.turnHistory.length === 0}
                className="py-3 rounded-xl text-sm font-black uppercase tracking-wider
                           transition-all duration-150 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: "#1f2937", color: "#9ca3af" }}>
                Undo
            </button>
            <button
                onClick={() => {
                    dispatch({ type: "SUBMIT_TURN" });
                    setSelectedNumber(null);
                }}
                disabled={dartsThisTurn === 0}
                className="py-3 rounded-xl text-sm font-black uppercase tracking-wider
                           text-white transition-all duration-200 active:scale-95 disabled:opacity-25"
                style={{
                    backgroundColor: dartsThisTurn > 0 ? "#cc2200" : "#374151",
                    boxShadow: dartsThisTurn > 0 ? "0 0 12px #cc220055" : "none",
                }}>
                Submit
            </button>
        </div>
    );

    const missButton = (
        <div className="flex-shrink-0 pt-1">
            <button
                onClick={handleMiss}
                disabled={turnFull}
                className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider
                           transition-all duration-150 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: "#78350f", color: "#fbbf24" }}>
                Miss
            </button>
        </div>
    );

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

    if (gameMode === "501") {
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

    // --- Cricket numpad (unchanged) ---
    return (
        <div className="h-full flex flex-col rounded-2xl border border-gray-800 bg-gray-900 p-2 gap-1">
            {dartCounter}

            <div className="grid grid-cols-4 gap-1 flex-shrink-0">
                <div />
                {MULTIPLIERS.map((m) => (
                    <div key={m.value}
                        className="text-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        {m.full}
                    </div>
                ))}
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-0">
                {CRICKET_NUMBERS.map((number) => (
                    <div key={number} className="flex-1 grid grid-cols-4 gap-2 items-center">
                        <div className="text-center font-black text-sm text-gray-300">
                            {number === 25 ? "Bull" : number}
                        </div>
                        {MULTIPLIERS.map((m) => {
                            const isBullTriple = number === 25 && m.value === 3;
                            const disabled = turnFull || isBullTriple;
                            return (
                                <button
                                    key={m.value}
                                    onClick={() => handleDart(number, m.value)}
                                    disabled={disabled}
                                    className="h-full rounded-lg text-sm font-black uppercase
                                               transition-all duration-150 active:scale-95"
                                    style={{
                                        backgroundColor: disabled ? "#111827" : "#1a4731",
                                        color: disabled ? "#374151" : "#86efac",
                                        cursor: disabled ? "not-allowed" : "pointer",
                                    }}>
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {missButton}
            {undoSubmit}
        </div>
    );
}