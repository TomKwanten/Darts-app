import { processShanghaiTurn } from "./ShanghaiLogic";

export function submitTurnShanghai(state) {
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
        round: state.round,
        maxRounds: state.maxRounds,
        submittedTurn: state.currentTurn,
    };

    const { pointsScored, isShanghai } = processShanghaiTurn(state.currentTurn, state.round);

    const realDarts = state.currentTurn.filter(d => d.number !== 0);
    const newDarts = { ...currentPlayer.darts };
    newDarts.total += realDarts.length;
    for (const dart of realDarts) {
        if (dart.multiplier === 1) newDarts.singles += 1;
        if (dart.multiplier === 2) newDarts.doubles += 1;
        if (dart.multiplier === 3) newDarts.triples += 1;
    }

    const newScore = currentPlayer.score + pointsScored;

    const updatedPlayers = state.players.map((player, index) => {
        if (index !== state.currentPlayerIndex) return player;
        return {
            ...player,
            score: newScore,
            darts: newDarts,
            shanghais: (player.shanghais ?? 0) + (isShanghai ? 1 : 0),
        };
    });

    const turnData = {
        player_id: currentPlayer.id,
        turn_number: state.turnNumber,
        points_scored: pointsScored,
        running_total: newScore,
        singles: realDarts.filter(d => d.multiplier === 1).length,
        doubles: realDarts.filter(d => d.multiplier === 2).length,
        triples: realDarts.filter(d => d.multiplier === 3).length,
    };

    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    const isLastPlayerOfRound = nextPlayerIndex === 0;

    let winnerObj = null;

    if (isShanghai) {
        winnerObj = {
            id: currentPlayer.id,
            name: currentPlayer.name,
            finalPlayers: updatedPlayers,
            isShanghai: true,
        };
    } else if (isLastPlayerOfRound && state.round >= state.maxRounds) {
        const highScore = Math.max(...updatedPlayers.map(p => p.score));
        const winner = updatedPlayers.find(p => p.score === highScore);
        winnerObj = {
            id: winner.id,
            name: winner.name,
            finalPlayers: updatedPlayers,
        };
    }

    const nextRound = isLastPlayerOfRound ? state.round + 1 : state.round;

    return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        currentTurn: [],
        winner: winnerObj,
        turnHistory: [...state.turnHistory, snapshot],
        turnNumber: state.turnNumber + 1,
        turns: [...state.turns, turnData],
        round: winnerObj ? state.round : nextRound,
    };
}
