import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import NumpadCricket from "./NumpadCricket";
import Numpad501 from "./Numpad501";
import NumpadAroundTheClock from "./NumpadATC";

export default function Numpad() {
    const { gameState, dispatch } = useContext(GameContext);
    const { gameMode } = gameState;
    const dartsThisTurn = gameState.currentTurn.length;

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
                onClick={() => dispatch({ type: "UNDO_DART" })}
                disabled={dartsThisTurn === 0 && gameState.turnHistory.length === 0}
                className="py-3 rounded-xl text-sm font-black uppercase tracking-wider
                           transition-all duration-150 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: "#1f2937", color: "#9ca3af" }}>
                Undo
            </button>
            <button
                onClick={() => dispatch({ type: "SUBMIT_TURN" })}
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

    if (gameMode === "501") return <Numpad501 dartCounter={dartCounter} undoSubmit={undoSubmit} />;
    if (gameMode === "cricket") return <NumpadCricket dartCounter={dartCounter} undoSubmit={undoSubmit} />;
    if (gameMode === "around-the-clock" || gameMode === "around-the-clock-solo") return <NumpadAroundTheClock dartCounter={dartCounter} undoSubmit={undoSubmit} />;
    return null;
}