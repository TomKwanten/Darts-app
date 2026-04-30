import { useLocation, Link } from "react-router-dom";
import GameDetailPlayers from "../components/GameDetailPlayers";
import { ScoreProgressionChart, ATCBreakdownCharts } from "../components/GameDetailCharts";
import GameDetail501, { computePlayerStats } from "../components/GameDetail501";

const GAME_MODE_LABEL = {
    cricket: "Cricket",
    "501": "501",
    "around-the-clock": "Around the Clock",
    "around-the-clock-solo": "Around the Clock",
    "shanghai": "Shanghai",
};

export default function GameDetail() {
    const { state } = useLocation();

    if (!state?.game) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">Game not found</p>
                <Link to="/stats"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ‹‹ Back to stats
                </Link>
            </div>
        );
    }

    const { game } = state;
    const hasTurns = Array.isArray(game.turns) && game.turns.length > 0;
    const is501 = game.game_mode === "501";
    const isATC = game.game_mode === "around-the-clock" || game.game_mode === "around-the-clock-solo";

    const chartData = hasTurns && !isATC ? (() => {
        const maxTurn = Math.max(...game.turns.map(t => t.turn_number));
        return Array.from({ length: maxTurn }, (_, i) => {
            const turnNum = i + 1;
            const entry = { turn: turnNum };
            for (const player of game.players) {
                const turnRow = game.turns.find(
                    t => t.turn_number === turnNum && t.player_id === player.id
                );
                entry[player.name ?? "Unknown"] = turnRow?.running_total ?? null;
            }
            return entry;
        });
    })() : [];

    const playerStats = (hasTurns && is501)
        ? game.players.map(player => ({
            player,
            ...computePlayerStats(player, game.turns, game.winner?.id),
        }))
        : [];

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
                        {GAME_MODE_LABEL[game.game_mode] ?? game.game_mode}
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(game.played_at).toLocaleDateString(undefined, {
                            day: "numeric", month: "long", year: "numeric"
                        })}
                        {game.winner && (
                            <span className="text-sm ml-2 font-black uppercase tracking-wider"
                                style={{ color: "#cc2200" }}>
                                · 🎯 {game.winner.name}
                            </span>
                        )}
                    </p>
                </div>
                <Link to="/stats"
                    className="text-sm uppercase tracking-widest text-gray-400 hover:text-gray-400 transition-colors">
                    ‹‹ Stats
                </Link>
            </div>

            {/* Players */}
            <GameDetailPlayers game={game} />

            {/* Score progression chart — not for ATC */}
            {hasTurns && !isATC && (
                <ScoreProgressionChart chartData={chartData} players={game.players} />
            )}

            {/* ATC: Number Breakdown per player */}
            {isATC && (
                <ATCBreakdownCharts game={game} />
            )}

            {/* 501-only: Key Stats + Score Bands */}
            {hasTurns && is501 && (
                <GameDetail501 playerStats={playerStats} game={game} />
            )}
        </div>
    );
}