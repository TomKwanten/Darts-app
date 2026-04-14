// Standard 501 checkout tables.
// Scores with no entry cannot be checked out — show nothing.
//
// Notation: S = single, D = double, T = triple, Bull = bullseye (50)

// ─── Double finish (standard) ────────────────────────────────────────────────
// Impossible scores (no entry): 169, 168, 166, 165, 163, 162, 159
export const DOUBLE_CHECKOUTS = {
    170: "T20 T20 Bull",
    167: "T20 T19 Bull",
    164: "T20 T18 Bull",
    161: "T20 T17 Bull",
    160: "T20 T20 D20",
    158: "T20 T20 D19",
    157: "T20 T19 D20",
    156: "T20 T20 D18",
    155: "T20 T19 D19",
    154: "T20 T18 D20",
    153: "T20 T19 D18",
    152: "T20 T20 D16",
    151: "T20 T17 D20",
    150: "T20 T18 D18",
    149: "T20 T19 D16",
    148: "T20 T16 D20",
    147: "T20 T17 D18",
    146: "T20 T18 D16",
    145: "T20 T15 D20",
    144: "T20 T20 D12",
    143: "T20 T17 D16",
    142: "T20 T14 D20",
    141: "T20 T19 D12",
    140: "T20 T16 D16",
    139: "T20 T13 D20",
    138: "T20 T18 D12",
    137: "T20 T15 D16",
    136: "T20 T20 D8",
    135: "T20 T17 D12",
    134: "T20 T14 D16",
    133: "T20 T19 D8",
    132: "T20 T16 D12",
    131: "T20 T13 D16",
    130: "T20 T18 D8",
    129: "T19 T16 D12",
    128: "T20 T16 D10",
    127: "T20 T17 D8",
    126: "T19 T19 D6",
    125: "T20 T15 D10",
    124: "T20 T14 D11",
    123: "T20 T13 D12",
    122: "T18 T18 D7",
    121: "T20 T11 D14",
    120: "T20 S20 D20",
    119: "T19 T12 D13",
    118: "T20 S18 D20",
    117: "T20 S17 D20",
    116: "T20 S16 D20",
    115: "T20 S15 D20",
    114: "T20 S14 D20",
    113: "T20 S13 D20",
    112: "T20 S12 D20",
    111: "T20 S11 D20",
    110: "T20 S10 D20",
    109: "T20 S9 D20",
    108: "T20 S8 D20",
    107: "T19 S10 D20",
    106: "T20 S6 D20",
    105: "T20 S5 D20",
    104: "T20 S4 D20",
    103: "T20 S3 D20",
    102: "T20 S2 D20",
    101: "T20 S1 D20",
    100: "T20 D20",
    99:  "T19 S10 D16",
    98:  "T20 D19",
    97:  "T19 D20",
    96:  "T20 D18",
    95:  "T19 D19",
    94:  "T18 D20",
    93:  "T19 D18",
    92:  "T20 D16",
    91:  "T17 D20",
    90:  "T18 D18",
    89:  "T19 D16",
    88:  "T16 D20",
    87:  "T17 D18",
    86:  "T18 D16",
    85:  "T15 D20",
    84:  "T20 D12",
    83:  "T17 D16",
    82:  "T14 D20",
    81:  "T19 D12",
    80:  "T16 D16",
    79:  "T13 D20",
    78:  "T18 D12",
    77:  "T15 D16",
    76:  "T20 D8",
    75:  "T17 D12",
    74:  "T14 D16",
    73:  "T19 D8",
    72:  "T16 D12",
    71:  "T13 D16",
    70:  "T18 D8",
    69:  "T19 D6",
    68:  "T20 D4",
    67:  "T17 D8",
    66:  "T10 D18",
    65:  "T19 D4",
    64:  "T16 D8",
    63:  "T13 D12",
    62:  "T10 D16",
    61:  "T15 D8",
    60:  "S20 D20",
    59:  "S19 D20",
    58:  "S18 D20",
    57:  "S17 D20",
    56:  "T16 D4",
    55:  "S15 D20",
    54:  "S14 D20",
    53:  "S13 D20",
    52:  "T12 D8",
    51:  "S11 D20",
    50:  "Bull",
    49:  "S9 D20",
    48:  "S8 D20",
    47:  "S15 D16",
    46:  "S6 D20",
    45:  "S5 D20",
    44:  "S4 D20",
    43:  "S3 D20",
    42:  "S10 D16",
    41:  "S9 D16",
    40:  "D20",
    39:  "S7 D16",
    38:  "D19",
    37:  "S5 D16",
    36:  "D18",
    35:  "S3 D16",
    34:  "D17",
    33:  "S1 D16",
    32:  "D16",
    31:  "S15 D8",
    30:  "D15",
    29:  "S13 D8",
    28:  "D14",
    27:  "S11 D8",
    26:  "D13",
    25:  "S9 D8",
    24:  "D12",
    23:  "S7 D8",
    22:  "D11",
    21:  "S5 D8",
    20:  "D10",
    19:  "S3 D8",
    18:  "D9",
    17:  "S1 D8",
    16:  "D8",
    15:  "S7 D4",
    14:  "D7",
    13:  "S5 D4",
    12:  "D6",
    11:  "S3 D4",
    10:  "D5",
    9:   "S1 D4",
    8:   "D4",
    7:   "S3 D2",
    6:   "D3",
    5:   "S1 D2",
    4:   "D2",
    3:   "S1 D1",
    2:   "D1",
};

// ─── Triple finish ────────────────────────────────────────────────────────────
// For scores that are exact multiples of 3 and ≤ 60, one dart finishes it (Txx).
// For scores above 60, the multi-dart route is the same as double finish
// (same setup darts) — only the final dart differs, and those paths are handled
// by the consumer swapping D→T for the last token when needed.
// This table covers only the 1-dart triple finishes.
export const TRIPLE_FINISHES = {
    60: "T20",
    57: "T19",
    54: "T18",
    51: "T17",
    48: "T16",
    45: "T15",
    42: "T14",
    39: "T13",
    36: "T12",
    33: "T11",
    30: "T10",
    27: "T9",
    24: "T8",
    21: "T7",
    18: "T6",
    15: "T5",
    12: "T4",
    9:  "T3",
    6:  "T2",
    3:  "T1",
};

/**
 * Returns a checkout suggestion string for the given score and finish mode,
 * or null if no checkout is possible.
 *
 * @param {number} score - Current remaining score
 * @param {number} finishMultiplier - 2 for double finish, 3 for triple finish
 * @returns {string|null}
 */
export function getCheckout(score, finishMultiplier) {
    if (score < 2 || score > 170) return null;

    if (finishMultiplier === 3) {
        // 1-dart triple finish
        if (TRIPLE_FINISHES[score]) return TRIPLE_FINISHES[score];
        // For multi-dart paths, fall through to double table —
        // the setup darts are identical; only the final dart changes.
        // We replace the trailing Dxx with the equivalent Txx where possible.
        const doubleRoute = DOUBLE_CHECKOUTS[score];
        if (!doubleRoute) return null;
        // Swap the last token if it's a double (Dxx → Txx)
        const tokens = doubleRoute.split(" ");
        const last = tokens[tokens.length - 1];
        if (last.startsWith("D")) {
            const num = parseInt(last.slice(1), 10);
            // Only swap if result ≤ 60 (valid triple)
            if (num * 3 <= 60) {
                tokens[tokens.length - 1] = `T${num}`;
                return tokens.join(" ");
            }
        }
        // Can't convert to a valid triple finish — no suggestion
        return null;
    }

    return DOUBLE_CHECKOUTS[score] ?? null;
}