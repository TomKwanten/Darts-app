import StatCard from "./StatCard";
import StatGrid from "./StatGrid";
import BullsCard from "./BullsCard";

export function calculate501Stats(games, playerId) {
    const playerGames = games.filter(g =>
        g.game_mode === "501" && g.players.some(p => p.id === playerId)
    );

    if (playerGames.length === 0) return null;

    let wins = 0, totalDartsWins = 0, bestGameDarts = null;
    let totalPointsNonBust = 0, totalNonBustTurns = 0, playerName = null;
    let totalGreenBulls = 0, totalRedBulls = 0;

    for (const game of playerGames) {
        const player = game.players.find(p => p.id === playerId);
        const isWinner = game.winner?.id === playerId;
        if (!playerName) playerName = player.name;
        if (isWinner) {
            wins++;
            totalDartsWins += player.total_darts;
            if (bestGameDarts === null || player.total_darts < bestGameDarts) bestGameDarts = player.total_darts;
        }
        const playerTurns = game.turns.filter(t => t.player_id === playerId);
        for (const turn of playerTurns) {
            if (turn.points_scored > 0) {
                totalPointsNonBust += turn.points_scored;
                totalNonBustTurns++;
            }
        }
        totalGreenBulls += player.green_bulls ?? 0;
        totalRedBulls += player.red_bulls ?? 0;
    }

    const gamesPlayed = playerGames.length;
    return {
        playerName, gamesPlayed, wins, losses: gamesPlayed - wins,
        checkouts: wins,
        checkoutRate: (wins / gamesPlayed) * 100,
        avgDartsPerWin: wins > 0 ? totalDartsWins / wins : null,
        bestGameDarts,
        avgPerTurn: totalNonBustTurns > 0 ? totalPointsNonBust / totalNonBustTurns : null,
        totalGreenBulls, totalRedBulls,
    };
}

export default function Stats501({ games, playerId }) {
    const s = calculate501Stats(games, playerId);

    if (!s) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-gray-500 text-sm">No 501 games yet.</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <StatCard title="Record">
                <div className="flex gap-4">
                    {[
                        { label: "Wins", value: s.wins, color: "#cc2200" },
                        { label: "Losses", value: s.losses, color: null },
                        { label: "Played", value: s.gamesPlayed, color: null },
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
                    { label: "Avg per turn", value: s.avgPerTurn != null ? s.avgPerTurn.toFixed(1) : "—" },
                    { label: "Avg darts / win", value: s.avgDartsPerWin != null ? s.avgDartsPerWin.toFixed(1) : "—" },
                ]} />
            </StatCard>

            <StatCard title="Checkout">
                <StatGrid items={[
                    { label: "Checkouts", value: s.checkouts },
                    { label: "Checkout rate", value: `${s.checkoutRate.toFixed(1)}%` },
                ]} />
            </StatCard>

            <BullsCard greenBulls={s.totalGreenBulls} redBulls={s.totalRedBulls} />

            <StatCard title="Best Game">
                <div className="rounded-lg bg-gray-800 py-3 px-4">
                    {s.bestGameDarts !== null ? (
                        <>
                            <div className="text-2xl font-black tabular-nums text-gray-100">
                                {s.bestGameDarts}
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