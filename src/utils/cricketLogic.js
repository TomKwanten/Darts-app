export function countHits(currentTurn) {
    const hits = {};

    for (const dart of currentTurn) {
        hits[dart.number] = (hits[dart.number] || 0) + dart.multiplier;
    }
    return hits;

}

export function applyMarks(player, hits) {
    const newMarks = {};

    for (const number in player.marks) {
        const currentMarks = player.marks[number];
        const hitOnNumber = hits[number] || 0;
        const maxMarks = parseInt(number) === 25 ? 2 : 3; // Bull can only be hit twice
        newMarks[number] = Math.min(currentMarks + hitOnNumber, maxMarks);
    }
    return newMarks;
}

export function calculatePoints(player, hits, allPlayers, originalMarks) {
    let points = 0;
    const opponents = allPlayers.filter(p => p.name !== player.name);

    for (const number in hits) {
        const maxMarks = parseInt(number) === 25 ? 2 : 3; // Bull can only be hit twice
        const playerClosed = player.marks[number] === maxMarks;
        const allOpponentsClosed = opponents.every(p => p.marks[number] === maxMarks);
        const hitsOnNumber = hits[number] || 0;

        console.log("number:", number);
        console.log("playerClosed:", playerClosed);
        console.log("allOpponentsClosed:", allOpponentsClosed);
        console.log("hitsOnNumber:", hitsOnNumber);

        if (!playerClosed || allOpponentsClosed) {
            continue;
        }

        const marksBeforeTurn = originalMarks[number] || 0;
        const excess = Math.max((marksBeforeTurn + hitsOnNumber) - maxMarks, 0);

        console.log("marksBeforeTurn:", marksBeforeTurn, "hitsOnNumber:", hitsOnNumber, "excess:", excess);

        points += excess * parseInt(number);
    }
    console.log("points earned this turn:", points);
    return points;

}