import { createContext, useReducer } from "react";
import { submitTurn501, bustTurn501 } from "../utils/SubmitTurn501.js";
import { submitTurnCricket } from "../utils/submitTurnCricket";
import { submitTurnAroundTheClock } from "../utils/SubmitTurnATC.js";
import { submitTurnShanghai } from "../utils/SubmitTurnShanghai.js";
import { processAroundTheClockTurn } from "../utils/ATCLogic.js";

export const GameContext = createContext();

const initialState = {
    players: [],
    gameMode: null,
    finishMultiplier: 2,
    order: "sequential",
    solo: false,
    round: 1,
    maxRounds: 7,
    currentPlayerIndex: 0,
    currentTurn: [],
    winner: null,
    turnHistory: [],
    turnNumber: 1,
    turns: [],
    dartDetails: [],
};

const submitHandlers = {
    "501": submitTurn501,
    "cricket": submitTurnCricket,
    "around-the-clock": submitTurnAroundTheClock,
    "around-the-clock-solo": submitTurnAroundTheClock,
    "shanghai": submitTurnShanghai,
};

export default function GameProvider({ children }) {
    function gameReducer(state, action) {
        console.log("action:", action.type, action.payload);
        switch (action.type) {
            case "START_GAME":
                return {
                    ...initialState,
                    players: action.payload.players.map(p => ({ ...p, gepikt: 0 })),
                    gameMode: action.payload.gameMode,
                    finishMultiplier: action.payload.finishMultiplier,
                    order: action.payload.order ?? "sequential",
                    solo: action.payload.solo ?? false,
                    round: 1,
                    maxRounds: action.payload.maxRounds ?? 7,
                };

            case "ADD_DART":
                return { ...state, currentTurn: [...state.currentTurn, action.payload] };

            // ATC-specific: add one dart, auto-submit after the 3rd or immediately on win
            case "ADD_DART_ATC": {
                const newTurn = [...state.currentTurn, action.payload];
                const { win } = processAroundTheClockTurn(
                    state.players[state.currentPlayerIndex]?.currentTarget,
                    newTurn,
                    state.order
                );
                if (win || newTurn.length >= 3) {
                    return submitTurnAroundTheClock({ ...state, currentTurn: newTurn });
                }
                return { ...state, currentTurn: newTurn };
            }

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

            case "GEPIKT": {
                if (state.currentTurn.length === 0) return state;
                const updatedTurn = state.currentTurn.map((dart, i) =>
                    i === state.currentTurn.length - 1 ? { ...dart, gepikt: true } : dart
                );
                const updatedPlayers = state.players.map((player, i) =>
                    i === state.currentPlayerIndex
                        ? { ...player, gepikt: (player.gepikt ?? 0) + 1 }
                        : player
                );
                return { ...state, currentTurn: updatedTurn, players: updatedPlayers };
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