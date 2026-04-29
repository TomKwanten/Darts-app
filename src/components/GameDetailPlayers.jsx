import { Link } from "react-router-dom";

const PLAYER_COLOURS = [
    "#cc2200",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ec4899",
];

const NO_POINTS_MODES = ["around-the-clock", "around-the-clock-solo"];

export default function GameDetailPlayers({ game }) {
    const isATC = game.game_mode === "around-the-clock" || game.game_mode === "around-the-clock-solo";
    const isShanghai = game.game_mode === "shanghai";
    const showPoints = !NO_POINTS_MODES.includes(game.game_mode);
    const showMisses = isATC || isShanghai;

    return (
        <div className="mb-8">
            <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">
                Players
            </div>
            <div className="flex flex-col gap-2">
                {game.players.map((player, index) => {
                    const isWinner = game.winner && player.name === game.winner.name;
                    const colour = PLAYER_COLOURS[index % PLAYER_COLOURS.length];
                    const misses = player.total_darts - player.singles - player.doubles - player.triples;

                    const cardContent = (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                                        style={{ backgroundColor: colour }} />
                                    <span className="text-sm font-black uppercase tracking-wide text-gray-100">
                                        {player.name ?? "Unknown"}
                                    </span>
                                    {isWinner && (
                                        <span className="text-xs font-black uppercase tracking-wider"
                                            style={{ color: "#cc2200" }}>
                                            🎯 Winner
                                        </span>
                                    )}
                                </div>
                                {showPoints && (
                                    <span className="text-xs tabular-nums text-gray-500">
                                        {player.points} pts
                                    </span>
                                )}
                            </div>

                            <div className={`grid gap-1 text-center ${showMisses ? "grid-cols-5" : "grid-cols-4"}`}>
                                {[
                                    { label: "Darts", value: player.total_darts },
                                    { label: "Singles", value: player.singles },
                                    { label: "Doubles", value: player.doubles },
                                    { label: "Triples", value: player.triples },
                                    ...(showMisses ? [{ label: "Misses", value: misses }] : []),
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-lg bg-gray-800 py-1 px-1">
                                        <div className="text-sm font-black tabular-nums text-gray-100">
                                            {value ?? 0}
                                        </div>
                                        <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-[1px]">
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    );

                    // Entire card is clickable if player has an id
                    if (player.id) {
                        return (
                            <Link
                                key={player.id}
                                to={`/stats/players/${player.id}`}
                                state={{ fromGameMode: game.game_mode }}
                                className="block rounded-xl border border-gray-800 bg-gray-900 p-3 active:opacity-70 transition-opacity">
                                {cardContent}
                            </Link>
                        );
                    }

                    return (
                        <div key={player.name}
                            className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                            {cardContent}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}