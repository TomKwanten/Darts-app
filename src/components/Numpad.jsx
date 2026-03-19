import { useContext } from "react";
import { GameContext } from "../context/GameContext";

const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

export default function Numpad() {
    const { gameState, dispatch } = useContext(GameContext);
    const dartsThisTurn = gameState.currentTurn.length;

    function handleDart(number, multiplier) {
        if (dartsThisTurn >= 3) return;

        dispatch({
            type: "ADD_DART",
            payload: { number, multiplier }
        });
    }

    return (
        <div>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr" }}>
                <span></span>
                <span>Single</span>
                <span>Double</span>
                <span>Triple</span>
            </div>

            {/* One row per cricket number */}
            {NUMBERS.map((number) => (
                <div
                    key={number}
                    style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr" }}
                >
                    <span>{number === 25 ? "Bull" : number}</span>

                    <button
                        onClick={() => handleDart(number, 1)}
                        disabled={dartsThisTurn >= 3}
                    >
                        S
                    </button>

                    <button
                        onClick={() => handleDart(number, 2)}
                        disabled={dartsThisTurn >= 3}
                    >
                        D
                    </button>

                    {/* Triple disabled for Bull */}
                    <button
                        onClick={() => handleDart(number, 3)}
                        disabled={dartsThisTurn >= 3 || number === 25}
                    >
                        T
                    </button>
                </div>
            ))}

            {/* Dart counter + controls */}
            <p>Darts thrown: {dartsThisTurn} / 3</p>

            <button
                onClick={() => dispatch({ type: "UNDO_DART" })}
            >
                Undo
            </button>

            <button
                onClick={() => dispatch({ type: "SUBMIT_TURN" })}
                disabled={dartsThisTurn === 0}
            >
                Submit Turn
            </button>
        </div>
    );
}