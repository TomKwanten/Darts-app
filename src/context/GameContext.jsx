import { createContext, useReducer } from "react";
import { countHits, applyMarks, calculatePoints } from "../utils/cricketLogic";
import { process501Turn } from "../utils/501logic";

export const GameContext = createContext();

const initialState = {
    players: [],
    gameMode: null,
    finishMultiplier: 2,
    currentPlayerIndex: 0,
    currentTurn: [],
    winner: null,
    turnHistory: [],
    turnNumber: 1,
    turns: [],
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
                };
            case "ADD_DART":
                return { ...state, currentTurn: [...state.currentTurn, action.payload] };
            case "UNDO_DART": {
                // Within the current turn — just pop the last dart
                if (state.currentTurn.length > 0) {
                    return { ...state, currentTurn: state.currentTurn.slice(0, -1) };
                }
                // At the start of a turn — restore the previous committed turn
                if (state.turnHistory.length === 0) return state;
                const previous = state.turnHistory[state.turnHistory.length - 1];
                console.log("Restoring snapshot:", JSON.stringify(previous, null, 2));
                return {
                    ...previous,
                    currentTurn: previous.submittedTurn.slice(0, -1),
                    turnHistory: state.turnHistory.slice(0, -1),
                };
            }
            case "SUBMIT_TURN": {
                // Full snapshot of everything needed to restore this moment
                const snapshot = {
                    players: state.players,
                    currentPlayerIndex: state.currentPlayerIndex,
                    currentTurn: [],
                    winner: state.winner,
                    turnNumber: state.turnNumber,
                    turns: state.turns,
                    gameMode: state.gameMode,
                    finishMultiplier: state.finishMultiplier,
                    submittedTurn: state.currentTurn,
                };

                if (state.gameMode === "501") {
                    const currentPlayer = state.players[state.currentPlayerIndex];
                    const { finalScore, bust, win, dartsUsed } = process501Turn(
                        currentPlayer.score,
                        state.currentTurn,
                        state.finishMultiplier
                    );

                    const newDarts = { ...currentPlayer.darts };
                    for (const dart of state.currentTurn) {
                        newDarts.total += 1;
                        if (dart.multiplier === 1) newDarts.singles += 1;
                        if (dart.multiplier === 2) newDarts.doubles += 1;
                        if (dart.multiplier === 3) newDarts.triples += 1;
                    }

                    const updatedPlayers = state.players.map((player, index) => {
                        if (index !== state.currentPlayerIndex) return player;
                        return { ...player, score: finalScore, darts: newDarts };
                    });

                    const pointsScored = bust ? 0 : currentPlayer.score - finalScore;

                    const turnData = {
                        player_id: currentPlayer.id,
                        turn_number: state.turnNumber,
                        points_scored: pointsScored,
                        running_total: finalScore,
                        singles: state.currentTurn.filter(d => d.multiplier === 1).length,
                        doubles: state.currentTurn.filter(d => d.multiplier === 2).length,
                        triples: state.currentTurn.filter(d => d.multiplier === 3).length,
                    };

                    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
                    const winnerObj = win
                        ? { id: currentPlayer.id, name: currentPlayer.name, finalPlayers: updatedPlayers }
                        : null;

                    return {
                        ...state,
                        players: updatedPlayers,
                        currentPlayerIndex: nextPlayerIndex,
                        currentTurn: [],
                        winner: winnerObj,
                        turnHistory: [...state.turnHistory, snapshot],
                        turnNumber: state.turnNumber + 1,
                        turns: [...state.turns, turnData],
                    };
                }

                const hits = countHits(state.currentTurn);
                const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

                let currentPlayerTurnData = null;

                const updatedPlayers = state.players.map((player, index) => {
                    if (index !== state.currentPlayerIndex) return player;
                    const newMarks = applyMarks(player, hits);
                    const earnedPoints = calculatePoints(
                        { ...player, marks: newMarks },
                        hits,
                        state.players,
                        player.marks
                    );
                    const newDarts = { ...player.darts };
                    for (const dart of state.currentTurn) {
                        newDarts.total += 1;
                        if (dart.multiplier === 1) newDarts.singles += 1;
                        if (dart.multiplier === 2) newDarts.doubles += 1;
                        if (dart.multiplier === 3) newDarts.triples += 1;
                    }

                    currentPlayerTurnData = {
                        player_id: player.id,
                        turn_number: state.turnNumber,
                        points_scored: earnedPoints,
                        running_total: player.points + earnedPoints,
                        singles: newDarts.singles - player.darts.singles,
                        doubles: newDarts.doubles - player.darts.doubles,
                        triples: newDarts.triples - player.darts.triples,
                    };

                    return {
                        ...player,
                        marks: newMarks,
                        points: player.points + earnedPoints,
                        darts: newDarts,
                    };
                });

                const maxPoints = Math.max(...updatedPlayers.map(p => p.points));
                const winningPlayer = updatedPlayers.find(player => {
                    const allClosed = Object.entries(player.marks).every(([number, marks]) => {
                        const maxMarks = parseInt(number) === 25 ? 2 : 3;
                        return marks === maxMarks;
                    });
                    return allClosed && player.points === maxPoints;
                }) ?? null;

                return {
                    ...state,
                    players: updatedPlayers,
                    currentPlayerIndex: nextPlayerIndex,
                    currentTurn: [],
                    winner: winningPlayer ? { id: winningPlayer.id, name: winningPlayer.name, finalPlayers: updatedPlayers } : null,
                    turnHistory: [...state.turnHistory, snapshot],
                    turnNumber: state.turnNumber + 1,
                    turns: currentPlayerTurnData 
                        ? [...state.turns, currentPlayerTurnData]
                        : state.turns,
                };
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