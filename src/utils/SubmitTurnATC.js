import { processAroundTheClockTurn } from "./ATCLogic";

export function submitTurnAroundTheClock(state) {
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
        order: state.order,
        submittedTurn: state.currentTurn,
    };

    const { newTarget, win } = processAroundTheClockTurn(
        currentPlayer.target,
        state.currentTurn,
        state.order
    );

    const newDarts = { ...currentPlayer.darts };
    for (const dart of state.currentTurn) {
        if (dart.number === 0) continue; // skip miss darts
        newDarts.total += 1;
        if (dart.multiplier === 1) newDarts.singles += 1;
        if (dart.multiplier === 2) newDarts.doubles += 1;
        if (dart.multiplier === 3) newDarts.triples += 1;
    }

    const realDarts = state.currentTurn.filter(d => d.number !== 0);

    const updatedPlayers = state.players.map((player, index) => {
        if (index !== state.currentPlayerIndex) return player;
        return { ...player, target: newTarget, darts: newDarts };
    });

    const turnData = {
        player_id: currentPlayer.id,
        turn_number: state.turnNumber,
        points_scored: newTarget !== currentPlayer.target ? 1 : 0,
        running_total: newTarget,
        singles: realDarts.filter(d => d.multiplier === 1).length,
        doubles: realDarts.filter(d => d.multiplier === 2).length,
        triples: realDarts.filter(d => d.multiplier === 3).length,
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