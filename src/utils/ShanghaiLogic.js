export function processShanghaiTurn(darts, round) {
    const roundDarts = darts.filter(d => d.number === round);
    const singles = roundDarts.filter(d => d.multiplier === 1).length;
    const doubles = roundDarts.filter(d => d.multiplier === 2).length;
    const triples = roundDarts.filter(d => d.multiplier === 3).length;
    const pointsScored = roundDarts.reduce((sum, d) => sum + d.number * d.multiplier, 0);
    const isShanghai = singles === 1 && doubles === 1 && triples === 1;
    return { pointsScored, isShanghai };
}
