import { processAroundTheClockTurn } from "./ATCLogic";

export function submitTurnAroundTheClock(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Always pad to 3 darts — unthrown darts count as misses
    const fullTurn = [...state.currentTurn];
    while (fullTurn.length < 3) {
        fullTurn.push({ number: 0, multiplier: 0 });
    }

    const snapshot = {
        players: state.players,
        currentPlayerIndex: state.currentPlayerIndex,
        currentTurn: [],
        winner: state.winner,
        turnNumber: state.turnNumber,
        turns: state.turns,
        dartDetails: state.dartDetails,
        gameMode: state.gameMode,
        finishMultiplier: state.finishMultiplier,
        order: state.order,
        solo: state.solo,
        submittedTurn: fullTurn,
    };

    const { newTarget, win } = processAroundTheClockTurn(
        currentPlayer.currentTarget,
        fullTurn,
        state.order
    );

    const newDarts = { ...currentPlayer.darts };
    for (const dart of fullTurn) {
        newDarts.total += 1;
        if (dart.number === 0 || dart.multiplier === 0) continue;
        if (dart.multiplier === 1) newDarts.singles += 1;
        if (dart.multiplier === 2) newDarts.doubles += 1;
        if (dart.multiplier === 3) newDarts.triples += 1;
    }

    const realDarts = fullTurn.filter(d => d.number !== 0 && d.multiplier > 0);

    const updatedPlayers = state.players.map((player, index) => {
        if (index !== state.currentPlayerIndex) return player;
        return { ...player, currentTarget: newTarget, darts: newDarts };
    });

    const turnData = {
        player_id: currentPlayer.id,
        turn_number: state.turnNumber,
        points_scored: newTarget !== currentPlayer.currentTarget ? 1 : 0,
        running_total: newTarget,
        singles: realDarts.filter(d => d.multiplier === 1).length,
        doubles: realDarts.filter(d => d.multiplier === 2).length,
        triples: realDarts.filter(d => d.multiplier === 3).length,
    };

    const newDartDetails = fullTurn.map((dart, i) => ({
        player_id: currentPlayer.id,
        turn_number: state.turnNumber,
        dart_number: i + 1,
        number: dart.number,
        multiplier: dart.multiplier,
    }));

    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

    // Solo: still trigger game end but mark as solo so it won't count as a competitive win
    // Multiplayer: normal winner object
    let winnerObj = null;
    if (win) {
        winnerObj = {
            id: currentPlayer.id,
            name: currentPlayer.name,
            finalPlayers: updatedPlayers,
            isSolo: state.solo ?? false,
        };
    }

    return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        currentTurn: [],
        winner: winnerObj,
        turnHistory: [...state.turnHistory, snapshot],
        turnNumber: state.turnNumber + 1,
        turns: [...state.turns, turnData],
        dartDetails: [...(state.dartDetails ?? []), ...newDartDetails],
    };
}