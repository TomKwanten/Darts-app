/**
 * Process a 501 turn dart-by-dart.
 * Returns { finalScore, bust, win, dartsUsed }
 * Stops at the first bust or win mid-turn.
 */
export function process501Turn(currentScore, darts, finishMultiplier) {
    let remaining = currentScore;

    for (let i = 0; i < darts.length; i++) {
        const dart = darts[i];
        const scored = dart.number * dart.multiplier;
        const next = remaining - scored;

        if (next < 0 || next === 1) {
            // Bust — score reverts to what it was before this turn
            return { finalScore: currentScore, bust: true, win: false, dartsUsed: i + 1 };
        }

        if (next === 0) {
            if (dart.multiplier === finishMultiplier) {
                // Win
                return { finalScore: 0, bust: false, win: true, dartsUsed: i + 1 };
            } else {
                // Reached zero with wrong multiplier — bust
                return { finalScore: currentScore, bust: true, win: false, dartsUsed: i + 1 };
            }
        }

        remaining = next;
    }

    // Turn ended normally (no bust, no win)
    return { finalScore: remaining, bust: false, win: false, dartsUsed: darts.length };
}