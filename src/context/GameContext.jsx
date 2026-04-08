import { createContext, useReducer } from "react";
import { countHits, applyMarks, calculatePoints } from "../utils/cricketLogic";

export const GameContext = createContext();

const initialState = {
    players: [],
    currentPlayerIndex: 0,
    currentTurn: [],
    winner: null,
    history: [],
    turnNumber: 1,
    turns: [],
};

export default function GameProvider({ children }) {
    function gameReducer(state, action) {
        console.log("action:", action.type, action.payload);
        switch (action.type) {
            case "START_GAME":
                return { ...state, players: action.payload };
            case "ADD_DART":
                return { ...state, currentTurn: [...state.currentTurn, action.payload] };
            case "UNDO_DART":
                if (state.currentTurn.length > 0) {
                    return { ...state, currentTurn: state.currentTurn.slice(0, -1) };
                }
                if (state.history.length === 0) return state;
                const previous = state.history[state.history.length - 1];
                return {
                    ...previous,
                    currentTurn: previous.currentTurn.slice(0, -1),
                    history: state.history.slice(0, -1)
                };
            case "SUBMIT_TURN": {
                const snapshot = {
                    players: state.players,
                    currentPlayerIndex: state.currentPlayerIndex,
                    currentTurn: state.currentTurn,
                    winner: state.winner,
                };

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
                    history: [...state.history, snapshot],
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