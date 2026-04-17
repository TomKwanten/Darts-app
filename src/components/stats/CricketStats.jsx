import StatCard from "./StatCard";
import StatGrid from "./StatGrid";
import BullsCard from "./BullsCard";

export function calculateCricketStats(games, playerId) {
    const playerGames = games.filter(g =>
        g.game_mode === "cricket" && g.players.some(p => p.id === playerId)
    );

    if (playerGames.length === 0) return null;

    let wins = 0, totalDarts = 0, totalPoints = 0;
    let totalSingles = 0, totalDoubles = 0, totalTriples = 0;
    let totalGreenBulls = 0, totalRedBulls = 0, totalGepikt = 0;
    let bestGameDarts = null, playerName = null;

    for (const game of playerGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        if (isWinner) {
            wins++;
            if (bestGameDarts === null || player.total_darts < bestGameDarts) bestGameDarts = player.total_darts;
        }
        totalDarts += player.total_darts;
        totalPoints += player.points;
        totalSingles += player.singles;
        totalDoubles += player.doubles;
        totalTriples += player.triples;
        totalGreenBulls += player.green_bulls ?? 0;
        totalRedBulls += player.red_bulls ?? 0;
        totalGepikt += player.gepikt ?? 0;
    }

    const gamesPlayed = playerGames.length;
    const totalRounds = totalDarts / 3;
    const totalHits = totalSingles + totalDoubles * 2 + totalTriples * 3;

    return {
        playerName, gamesPlayed, wins, losses: gamesPlayed - wins,
        dartAvgPerGame: totalDarts / gamesPlayed,
        avgScorePerGame: totalPoints / gamesPlayed,
        avgTurnsPerGame: totalRounds / gamesPlayed,
        avgHitsPerGame: totalHits / gamesPlayed,
        avgHitsPerRound: totalHits / totalRounds,
        totalDoubles, doublesPercent: totalDarts > 0 ? (totalDoubles / totalDarts) * 100 : 0,
        totalTriples, triplesPercent: totalDarts > 0 ? (totalTriples / totalDarts) * 100 : 0,
        bestGameDarts, totalGreenBulls, totalRedBulls, totalGepikt,
    };
}

export default function CricketStats({ stats }) {
    if (!stats) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-gray-500 text-sm">No Cricket games yet.</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <StatCard title="Record">
                <div className="flex gap-4">
                    {[
                        { label: "Wins", value: stats.wins, color: "#cc2200" },
                        { label: "Losses", value: stats.losses, color: null },
                        { label: "Played", value: stats.gamesPlayed, color: null },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                            <div className={`text-2xl font-black ${color ? "" : "text-gray-100"}`}
                                style={{ color: color ?? undefined }}>{value}</div>
                            <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                        </div>
                    ))}
                </div>
            </StatCard>

            <StatCard title="Averages">
                <StatGrid items={[
                    { label: "Darts / game", value: stats.dartAvgPerGame.toFixed(1) },
                    { label: "Score / game", value: stats.avgScorePerGame.toFixed(1) },
                    { label: "Turns / game", value: stats.avgTurnsPerGame.toFixed(1) },
                    { label: "Hits / game", value: stats.avgHitsPerGame.toFixed(1) },
                    { label: "Hits / round", value: stats.avgHitsPerRound.toFixed(2) },
                ]} />
            </StatCard>

            <StatCard title="Doubles & Triples">
                <StatGrid items={[
                    { label: "Doubles", value: `${stats.totalDoubles} (${stats.doublesPercent.toFixed(1)}%)` },
                    { label: "Triples", value: `${stats.totalTriples} (${stats.triplesPercent.toFixed(1)}%)` },
                ]} />
            </StatCard>

            <BullsCard greenBulls={stats.totalGreenBulls} redBulls={stats.totalRedBulls} />

            <StatCard title="Gepikt">
                <div className="rounded-lg bg-gray-800 py-3 px-4">
                    <div className="text-2xl font-black tabular-nums"
                        style={{ color: "#a78bfa" }}>
                        {stats.totalGepikt}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">
                        Total times gepikt
                    </div>
                </div>
            </StatCard>

            <StatCard title="Best Game">
                <div className="rounded-lg bg-gray-800 py-3 px-4">
                    {stats.bestGameDarts !== null ? (
                        <>
                            <div className="text-2xl font-black tabular-nums text-gray-100">
                                {stats.bestGameDarts}
                                <span className="text-sm font-normal text-gray-500 ml-1">darts</span>
                            </div>
                            <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">
                                Fewest darts to win
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-gray-500">No wins yet</div>
                    )}
                </div>
            </StatCard>
        </div>
    );
}