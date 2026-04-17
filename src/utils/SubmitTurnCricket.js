import { countHits, applyMarks, calculatePoints } from "./cricketLogic";

export function submitTurnCricket(state) {
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
        const newBulls = { ...player.bulls };
        for (const dart of state.currentTurn) {
            if (dart.number === 0) continue; // skip miss darts
            newDarts.total += 1;
            if (dart.multiplier === 1) newDarts.singles += 1;
            if (dart.multiplier === 2) newDarts.doubles += 1;
            if (dart.multiplier === 3) newDarts.triples += 1;
            if (dart.number === 25 && dart.multiplier === 1) newBulls.green += 1;
            if (dart.number === 25 && dart.multiplier === 2) newBulls.red += 1;
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
            bulls: newBulls,
            gepikt: player.gepikt ?? 0,
        };
    });

    const maxPoints = Math.max(...updatedPlayers.map(p => p.points));
    const winningPlayer = updatedPlayers.find(player => {
        const allClosed = Object.entries(player.marks).every(([, marks]) => marks === 3);
        return allClosed && player.points === maxPoints;
    }) ?? null;

    return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        currentTurn: [],
        winner: winningPlayer
            ? { id: winningPlayer.id, name: winningPlayer.name, finalPlayers: updatedPlayers }
            : null,
        turnHistory: [...state.turnHistory, snapshot],
        turnNumber: state.turnNumber + 1,
        turns: currentPlayerTurnData
            ? [...state.turns, currentPlayerTurnData]
            : state.turns,
    };
}