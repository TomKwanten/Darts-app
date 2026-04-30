export const SEQUENCES = {
    sequential: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25],
    clockwise:  [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5, 25],
};

/**
 * Given the current target number and order, return the next target.
 * Returns null if the current target is Bull (25) — meaning the game is over.
 */
export function getNextTarget(currentTarget, order) {
    const seq = SEQUENCES[order];
    const idx = seq.indexOf(currentTarget);
    if (idx === -1 || idx === seq.length - 1) return null;
    return seq[idx + 1];
}

/**
 * Returns the progress index (0-based) of a target in the sequence.
 * Used for ranking players.
 */
export function getProgressIndex(target, order) {
    const seq = SEQUENCES[order];
    return seq.indexOf(target);
}

/**
 * Process a single Around the Clock turn dart-by-dart.
 * Returns { newTarget, win }
 *
 * @param {number} currentTarget - The number the player currently needs to hit
 * @param {Array}  darts         - Array of { number, multiplier }
 * @param {string} order         - "sequential" | "clockwise"
 */
export function processAroundTheClockTurn(currentTarget, darts, order) {
    let target = currentTarget;

    for (const dart of darts) {
        // Only a real hit (multiplier > 0) advances the target
        if (dart.number === target && dart.multiplier > 0) {
            const next = getNextTarget(target, order);
            if (next === null) {
                // Was on Bull and hit it — win
                return { newTarget: 25, win: true };
            }
            target = next;
        }
    }

    return { newTarget: target, win: false };
}