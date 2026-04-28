import StatCard from "./StatCard";
import StatGrid from "./StatGrid";

const CLOCKWISE_ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5,25];
const SEQUENTIAL_ORDER = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25];

function getStartNumber(order) {
    return order === "clockwise" ? 20 : 1;
}

function detectOrder(turns) {
    if (!turns || turns.length === 0) return "sequential";
    const first = turns[0];
    // If first running_total is 1 or 2, it's sequential (hit or stay on 1)
    return (first.running_total <= 2) ? "sequential" : "clockwise";
}

/**
 * Aggregate turns across multiple games to find which number
 * required the most turns (attempts) per hit.
 * Returns array of { number, tries, hits, misses, triesPerHit }
 */
function computeHardestNumbers(games, playerId) {
    const totals = {}; // number → { tries, hits }

    for (const game of games) {
        const playerTurns = game.turns
            ?.filter(t => t.player_id === playerId)
            .sort((a, b) => a.turn_number - b.turn_number) ?? [];

        if (playerTurns.length === 0) continue;

        const order = detectOrder(playerTurns);
        let prevTarget = getStartNumber(order);

        for (const turn of playerTurns) {
            const aimed = prevTarget;
            if (!totals[aimed]) totals[aimed] = { tries: 0, hits: 0 };
            totals[aimed].tries += 1;
            if (turn.points_scored === 1) totals[aimed].hits += 1;
            prevTarget = turn.running_total;
        }
    }

    return Object.entries(totals)
        .map(([num, { tries, hits }]) => ({
            number: parseInt(num),
            tries,
            hits,
            misses: tries - hits,
            triesPerHit: hits > 0 ? tries / hits : tries, // infinite if never hit
        }))
        .filter(d => d.tries > 0)
        .sort((a, b) => b.triesPerHit - a.triesPerHit);
}

export function calculateATCStats(games, playerId) {
    const mpGames = games.filter(g =>
        g.game_mode === "around-the-clock" && g.players.some(p => p.id === playerId)
    );
    const soloGames = games.filter(g =>
        g.game_mode === "around-the-clock-solo" && g.players.some(p => p.id === playerId)
    );

    if (mpGames.length === 0 && soloGames.length === 0) return null;

    let playerName = null;
    let mpWins = 0, mpTotalDarts = 0, mpTotalDartsWins = 0;
    let mpSingles = 0, mpDoubles = 0, mpTriples = 0, mpBestDarts = null;

    for (const game of mpGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        if (isWinner) {
            mpWins++;
            mpTotalDartsWins += player.total_darts;
            if (mpBestDarts === null || player.total_darts < mpBestDarts) mpBestDarts = player.total_darts;
        }
        mpTotalDarts += player.total_darts;
        mpSingles += player.singles;
        mpDoubles += player.doubles;
        mpTriples += player.triples;
    }

    let soloRuns = 0, soloTotalDarts = 0;
    let soloSingles = 0, soloDoubles = 0, soloTriples = 0;
    let soloBestDarts = null, soloCompletedDarts = 0, soloCompleted = 0;

    for (const game of soloGames) {
        const player = game.players.find(p => p.id === playerId);
        const isFinished = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        soloRuns++;
        soloTotalDarts += player.total_darts;
        soloSingles += player.singles;
        soloDoubles += player.doubles;
        soloTriples += player.triples;
        if (isFinished) {
            soloCompleted++;
            soloCompletedDarts += player.total_darts;
            if (soloBestDarts === null || player.total_darts < soloBestDarts) soloBestDarts = player.total_darts;
        }
    }

    // Hardest numbers across all ATC games combined
    const allATCGames = [...mpGames, ...soloGames];
    const hardestNumbers = computeHardestNumbers(allATCGames, playerId);

    return {
        playerName,
        hardestNumbers,
        multiplayer: mpGames.length === 0 ? null : {
            gamesPlayed: mpGames.length, wins: mpWins, losses: mpGames.length - mpWins,
            bestDarts: mpBestDarts,
            avgDartsPerWin: mpWins > 0 ? mpTotalDartsWins / mpWins : null,
            totalDarts: mpTotalDarts, singles: mpSingles, doubles: mpDoubles, triples: mpTriples,
            hitRate: mpTotalDarts > 0 ? ((mpSingles + mpDoubles + mpTriples) / mpTotalDarts) * 100 : 0,
        },
        solo: soloGames.length === 0 ? null : {
            runs: soloRuns, completed: soloCompleted,
            bestDarts: soloBestDarts,
            avgDartsPerRun: soloRuns > 0 ? soloTotalDarts / soloRuns : null,
            avgDartsPerCompletion: soloCompleted > 0 ? soloCompletedDarts / soloCompleted : null,
            totalDarts: soloTotalDarts, singles: soloSingles, doubles: soloDoubles, triples: soloTriples,
            hitRate: soloTotalDarts > 0 ? ((soloSingles + soloDoubles + soloTriples) / soloTotalDarts) * 100 : 0,
        },
    };
}

export default function ATCStats({ stats }) {
    if (!stats) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-gray-500 text-sm">No Around the Clock games yet.</p>
        </div>
    );

    const top3Hardest = stats.hardestNumbers?.slice(0, 3) ?? [];

    return (
        <div className="flex flex-col gap-4">

            {/* Hardest numbers — shown if we have enough data */}
            {top3Hardest.length > 0 && (
                <StatCard title="Hardest Numbers">
                    <div className="flex flex-col gap-2">
                        {top3Hardest.map((d, i) => (
                            <div key={d.number}
                                className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2">
                                <div className="text-xl font-black tabular-nums w-8 text-center"
                                    style={{ color: i === 0 ? "#cc2200" : i === 1 ? "#f59e0b" : "#6b7280" }}>
                                    {d.number === 25 ? "B" : d.number}
                                </div>
                                <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                                    {[
                                        { label: "Tries", value: d.tries },
                                        { label: "Hits", value: d.hits },
                                        { label: "Misses", value: d.misses },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <div className="text-sm font-black tabular-nums text-gray-100">{value}</div>
                                            <div className="text-[9px] uppercase tracking-wider text-gray-500">{label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black tabular-nums text-gray-100">
                                        {d.triesPerHit.toFixed(1)}
                                    </div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500">tries/hit</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </StatCard>
            )}

            {stats.multiplayer && (
                <>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-600 mt-1">Multiplayer</div>
                    <StatCard title="Record">
                        <div className="flex gap-4">
                            {[
                                { label: "Wins", value: stats.multiplayer.wins, color: "#cc2200" },
                                { label: "Losses", value: stats.multiplayer.losses, color: null },
                                { label: "Played", value: stats.multiplayer.gamesPlayed, color: null },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                    <div className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                        style={{ color: color ?? undefined }}>{value}</div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </StatCard>
                    <StatCard title="Performance">
                        <StatGrid items={[
                            { label: "Hit rate", value: `${stats.multiplayer.hitRate.toFixed(1)}%` },
                            { label: "Avg darts / win", value: stats.multiplayer.avgDartsPerWin != null ? stats.multiplayer.avgDartsPerWin.toFixed(1) : "—" },
                            { label: "Total darts", value: stats.multiplayer.totalDarts },
                            { label: "Best game", value: stats.multiplayer.bestDarts != null ? `${stats.multiplayer.bestDarts}` : "—" },
                        ]} />
                    </StatCard>
                    <StatCard title="Dart Types">
                        <StatGrid items={[
                            { label: "Singles", value: stats.multiplayer.singles },
                            { label: "Doubles", value: stats.multiplayer.doubles },
                            { label: "Triples", value: stats.multiplayer.triples },
                        ]} />
                    </StatCard>
                </>
            )}

            {stats.solo && (
                <>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-600 mt-2">Solo</div>
                    <StatCard title="Runs">
                        <div className="flex gap-4">
                            {[
                                { label: "Completed", value: stats.solo.completed, color: "#cc2200" },
                                { label: "Total runs", value: stats.solo.runs, color: null },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                                    <div className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                        style={{ color: color ?? undefined }}>{value}</div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </StatCard>
                    <StatCard title="Performance">
                        <StatGrid items={[
                            { label: "Hit rate", value: `${stats.solo.hitRate.toFixed(1)}%` },
                            { label: "Best run", value: stats.solo.bestDarts != null ? `${stats.solo.bestDarts} darts` : "—" },
                            { label: "Avg darts / run", value: stats.solo.avgDartsPerRun != null ? stats.solo.avgDartsPerRun.toFixed(1) : "—" },
                            { label: "Avg darts / finish", value: stats.solo.avgDartsPerCompletion != null ? stats.solo.avgDartsPerCompletion.toFixed(1) : "—" },
                            { label: "Total darts", value: stats.solo.totalDarts },
                        ]} />
                    </StatCard>
                    <StatCard title="Dart Types">
                        <StatGrid items={[
                            { label: "Singles", value: stats.solo.singles },
                            { label: "Doubles", value: stats.solo.doubles },
                            { label: "Triples", value: stats.solo.triples },
                        ]} />
                    </StatCard>
                </>
            )}
        </div>
    );
}