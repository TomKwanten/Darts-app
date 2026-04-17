import { useContext } from "react";
import { GameContext } from "../context/GameContext";

const CRICKET_NUMBERS = [15, 16, 17, 18, 19, 20, 25];

const MULTIPLIERS = [
    { label: "S", value: 1, full: "Single" },
    { label: "D", value: 2, full: "Double" },
    { label: "T", value: 3, full: "Triple" },
];

export default function NumpadCricket({ dartCounter, undoSubmit }) {
    const { gameState, dispatch } = useContext(GameContext);
    const dartsThisTurn = gameState.currentTurn.length;
    const turnFull = dartsThisTurn >= 3;

    function handleDart(number, multiplier) {
        if (turnFull) return;
        dispatch({ type: "ADD_DART", payload: { number, multiplier } });
    }

    function handleMiss() {
        if (turnFull) return;
        dispatch({ type: "MISS_TURN" });
    }

    const missAndGepikt = (
        <div className="grid grid-cols-2 gap-2 flex-shrink-0 pt-1">
            <button
                onClick={handleMiss}
                disabled={turnFull}
                className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider
                           transition-all duration-150 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: "#78350f", color: "#fbbf24" }}>
                Miss
            </button>
            <button
                onClick={() => dispatch({ type: "GEPIKT" })}
                disabled={dartsThisTurn === 0}
                className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider
                           transition-all duration-150 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: "#1e1b4b", color: "#a78bfa" }}>
                Gepikt 🎯
            </button>
        </div>
    );

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

            {missAndGepikt}
            {undoSubmit}
        </div>
    );
}