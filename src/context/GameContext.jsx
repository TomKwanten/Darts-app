import { createContext, useReducer } from "react";
import { submitTurn501, bustTurn501 } from "../utils/SubmitTurn501.js";
import { submitTurnCricket } from "../utils/submitTurnCricket";
import { submitTurnAroundTheClock } from "../utils/SubmitTurnATC.js";

export const GameContext = createContext();

const initialState = {
    players: [],
    gameMode: null,
    finishMultiplier: 2,
    order: "sequential",
    currentPlayerIndex: 0,
    currentTurn: [],
    winner: null,
    turnHistory: [],
    turnNumber: 1,
    turns: [],
};

const submitHandlers = {
    "501": submitTurn501,
    "cricket": submitTurnCricket,
    "around-the-clock": submitTurnAroundTheClock,
};

export default function GameProvider({ children }) {
    function gameReducer(state, action) {
        console.log("action:", action.type, action.payload);
        switch (action.type) {
            case "START_GAME":
                return {
                    ...state,
                    players: action.payload.players,
                    gameMode: action.payload.gameMode,
                    finishMultiplier: action.payload.finishMultiplier,
                    order: action.payload.order ?? "sequential",
                };
            case "ADD_DART":
                return { ...state, currentTurn: [...state.currentTurn, action.payload] };
            case "UNDO_DART": {
                if (state.currentTurn.length > 0) {
                    return { ...state, currentTurn: state.currentTurn.slice(0, -1) };
                }
                if (state.turnHistory.length === 0) return state;
                const previous = state.turnHistory[state.turnHistory.length - 1];
                console.log("Restoring snapshot:", JSON.stringify(previous, null, 2));
                return {
                    ...previous,
                    currentTurn: previous.submittedTurn.slice(0, -1),
                    turnHistory: state.turnHistory.slice(0, -1),
                };
            }
            case "MISS_TURN": {
                const missDart = { number: 0, multiplier: 1 };
                const filledTurn = [
                    ...state.currentTurn,
                    ...Array(3 - state.currentTurn.length).fill(missDart),
                ];
                const handler = submitHandlers[state.gameMode];
                return handler({ ...state, currentTurn: filledTurn });
            }
            case "BUST_TURN":
                return bustTurn501(state);
            case "SUBMIT_TURN": {
                const handler = submitHandlers[state.gameMode];
                return handler(state);
            }
            case "RESET_GAME":
                return initialState;
            default:
                return state;
        }
    }

    const [gameState, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameContext.Provider value={{ gameState, dispatch }}>
            {children}
        </GameContext.Provider>
    );
}