import StatCard from "./StatCard";
import StatGrid from "./StatGrid";

export function calculateShanghaiStats(games, playerId) {
    const shanghaiGames = games.filter(g =>
        g.game_mode === "shanghai" && g.players.some(p => p.id === playerId)
    );

    if (shanghaiGames.length === 0) return null;

    let playerName = null;
    let wins = 0, totalPoints = 0, bestScore = null;
    let totalDarts = 0, singles = 0, doubles = 0, triples = 0;
    let shanghais = 0;

    for (const game of shanghaiGames) {
        const player = game.players.find(p => p.id === playerId);
        if (!playerName) playerName = player.name;

        if (game.winner?.id === playerId) wins++;

        totalPoints += player.points;
        totalDarts += player.total_darts;
        singles += player.singles;
        doubles += player.doubles;
        triples += player.triples;
        shanghais += player.shanghais ?? 0;

        if (bestScore === null || player.points > bestScore) bestScore = player.points;
    }

    return {
        playerName,
        gamesPlayed: shanghaiGames.length,
        wins,
        losses: shanghaiGames.length - wins,
        shanghais,
        avgScore: shanghaiGames.length > 0 ? totalPoints / shanghaiGames.length : 0,
        bestScore,
        avgDartsPerGame: shanghaiGames.length > 0 ? totalDarts / shanghaiGames.length : 0,
        totalDarts,
        singles,
        doubles,
        triples,
        hitRate: totalDarts > 0 ? ((singles + doubles + triples) / totalDarts) * 100 : 0,
    };
}

export default function ShanghaiStats({ stats }) {
    if (!stats) return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-gray-500 text-sm">No Shanghai games yet.</p>
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
                            <div className="text-2xl font-black text-gray-100"
                                style={{ color: color ?? undefined }}>{value}</div>
                            <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                        </div>
                    ))}
                </div>
            </StatCard>

            <StatCard title="Shanghai">
                <div className="flex gap-4">
                    <div className="flex-1 text-center rounded-lg bg-gray-800 py-3">
                        <div className="text-2xl font-black" style={{ color: "#f59e0b" }}>{stats.shanghais}</div>
                        <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Career Shanghais</div>
                    </div>
                </div>
            </StatCard>

            <StatCard title="Performance">
                <StatGrid items={[
                    { label: "Avg score / game", value: stats.avgScore.toFixed(1) },
                    { label: "Best score", value: stats.bestScore ?? "—" },
                    { label: "Hit rate", value: `${stats.hitRate.toFixed(1)}%` },
                    { label: "Avg darts / game", value: stats.avgDartsPerGame.toFixed(1) },
                    { label: "Total darts", value: stats.totalDarts },
                ]} />
            </StatCard>

            <StatCard title="Dart Types">
                <StatGrid items={[
                    { label: "Singles", value: stats.singles },
                    { label: "Doubles", value: stats.doubles },
                    { label: "Triples", value: stats.triples },
                ]} />
            </StatCard>
        </div>
    );
}
