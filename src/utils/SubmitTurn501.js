import { process501Turn } from "./501logic";

export function submitTurn501(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];

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

    const { finalScore, bust, win } = process501Turn(
        currentPlayer.score,
        state.currentTurn,
        state.finishMultiplier
    );

    const newDarts = { ...currentPlayer.darts };
    const newBulls = { ...currentPlayer.bulls };
    for (const dart of state.currentTurn) {
        newDarts.total += 1;
        if (dart.multiplier === 1) newDarts.singles += 1;
        if (dart.multiplier === 2) newDarts.doubles += 1;
        if (dart.multiplier === 3) newDarts.triples += 1;
        if (dart.number === 25 && dart.multiplier === 1) newBulls.green += 1;
        if (dart.number === 25 && dart.multiplier === 2) newBulls.red += 1;
    }

    const updatedPlayers = state.players.map((player, index) => {
        if (index !== state.currentPlayerIndex) return player;
        return { ...player, score: finalScore, darts: newDarts, bulls: newBulls };
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

export function bustTurn501(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const missDart = { number: 0, multiplier: 1 };
    const filledTurn = [
        ...state.currentTurn,
        ...Array(3 - state.currentTurn.length).fill(missDart),
    ];

    const snapshot = {
        players: state.players,
        currentPlayerIndex: state.currentPlayerIndex,
        currentTurn: [],
        winner: state.winner,
        turnNumber: state.turnNumber,
        turns: state.turns,
        gameMode: state.gameMode,
        finishMultiplier: state.finishMultiplier,
        submittedTurn: filledTurn,
    };

    const newDarts = { ...currentPlayer.darts };
    const newBulls = { ...currentPlayer.bulls };
    for (const dart of filledTurn) {
        newDarts.total += 1;
        if (dart.multiplier === 1) newDarts.singles += 1;
        if (dart.multiplier === 2) newDarts.doubles += 1;
        if (dart.multiplier === 3) newDarts.triples += 1;
        if (dart.number === 25 && dart.multiplier === 1) newBulls.green += 1;
        if (dart.number === 25 && dart.multiplier === 2) newBulls.red += 1;
    }

    const updatedPlayers = state.players.map((player, index) => {
        if (index !== state.currentPlayerIndex) return player;
        return { ...player, score: currentPlayer.score, darts: newDarts, bulls: newBulls };
    });

    const turnData = {
        player_id: currentPlayer.id,
        turn_number: state.turnNumber,
        points_scored: 0,
        running_total: currentPlayer.score,
        singles: filledTurn.filter(d => d.multiplier === 1).length,
        doubles: filledTurn.filter(d => d.multiplier === 2).length,
        triples: filledTurn.filter(d => d.multiplier === 3).length,
    };

    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

    return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        currentTurn: [],
        winner: null,
        turnHistory: [...state.turnHistory, snapshot],
        turnNumber: state.turnNumber + 1,
        turns: [...state.turns, turnData],
    };
}