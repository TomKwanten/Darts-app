import StatCard from "./StatCard";
import StatGrid from "./StatGrid";

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
    let soloTotalHits = 0;

    for (const game of soloGames) {
        const player = game.players.find(p => p.id === playerId);
        const isFinished = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        soloRuns++;
        soloTotalDarts += player.total_darts;
        soloSingles += player.singles;
        soloDoubles += player.doubles;
        soloTriples += player.triples;
        const playerTurns = game.turns.filter(t => t.player_id === playerId);
        for (const turn of playerTurns) soloTotalHits += turn.points_scored;
        if (isFinished) {
            soloCompleted++;
            soloCompletedDarts += player.total_darts;
            if (soloBestDarts === null || player.total_darts < soloBestDarts) soloBestDarts = player.total_darts;
        }
    }

    return {
        playerName,
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

    return (
        <div className="flex flex-col gap-4">
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