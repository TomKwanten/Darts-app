import { useContext } from "react";
import { GameContext } from "../context/GameContext";

const CRICKET_NUMBERS = [15, 16, 17, 18, 19, 20, 25];
const NUMBERS_501 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25];

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

    const NUMBERS = gameMode === "501" ? NUMBERS_501 : CRICKET_NUMBERS;

    function handleDart(number, multiplier) {
        if (turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number, multiplier } });
    }

    function handleMiss() {
        if (turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number: 0, multiplier: 1 } });
    }

    return (
        <div className="h-full flex flex-col rounded-2xl border border-gray-800 bg-gray-900 p-2 gap-1">

            {/* Dart counter */}
            <div className="flex items-center justify-center gap-2 flex-shrink-0 py-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all duration-200"
                        style={{
                            backgroundColor: i < dartsThisTurn ? "#cc2200" : "#1f2937",
                            boxShadow: i < dartsThisTurn ? "0 0 5px #cc220088" : "none",
                        }}
                    />
                ))}
                <span className="text-xs text-gray-600 uppercase tracking-widest ml-1">
                    {dartsThisTurn} / 3
                </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-4 gap-1 flex-shrink-0">
                <div />
                {MULTIPLIERS.map((m) => (
                    <div key={m.value}
                        className="text-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        {m.full}
                    </div>
                ))}
            </div>

            {/* Number rows */}
            <div className="flex-1 flex flex-col gap-1 min-h-0">
                {NUMBERS.map((number) => (
                    <div key={number} className="flex-1 grid grid-cols-4 gap-1 items-center">
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

            {/* Miss button */}
            <div className="flex-shrink-0 pt-1">
                <button
                    onClick={handleMiss}
                    disabled={turnFull}
                    className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider
                               transition-all duration-150 active:scale-95 disabled:opacity-25"
                    style={{ backgroundColor: "#1f2937", color: "#6b7280" }}>
                    Miss
                </button>
            </div>

            {/* Undo + Submit */}
            <div className="grid grid-cols-2 gap-2 flex-shrink-0 pt-1">
                <button
                    onClick={() => dispatch({ type: "UNDO_DART" })}
                    disabled={dartsThisTurn === 0 && gameState.history.length === 0}
                    className="py-3 rounded-xl text-xs font-black uppercase tracking-wider
                               transition-all duration-150 active:scale-95 disabled:opacity-25"
                    style={{ backgroundColor: "#1f2937", color: "#9ca3af" }}>
                    ← Undo
                </button>
                <button
                    onClick={() => dispatch({ type: "SUBMIT_TURN" })}
                    disabled={dartsThisTurn === 0}
                    className="py-3 rounded-xl text-xs font-black uppercase tracking-wider
                               text-white transition-all duration-200 active:scale-95 disabled:opacity-25"
                    style={{
                        backgroundColor: dartsThisTurn > 0 ? "#cc2200" : "#374151",
                        boxShadow: dartsThisTurn > 0 ? "0 0 12px #cc220055" : "none",
                    }}>
                    Submit →
                </button>
            </div>
        </div>
    );
}