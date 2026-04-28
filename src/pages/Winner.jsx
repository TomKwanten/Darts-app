import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";

const NO_POINTS_MODES = ["around-the-clock", "around-the-clock-solo"];

export default function Winner() {
    const { dispatch } = useContext(GameContext);
    const { state } = useLocation();
    const navigate = useNavigate();

    const winner = state?.winner;
    const gameMode = state?.gameMode;
    const isSolo = state?.isSolo;
    const isATC = gameMode === "around-the-clock" || gameMode === "around-the-clock-solo";
    const isATCMultiplayer = gameMode === "around-the-clock";

    if (!winner) {
        navigate("/", { replace: true });
        return null;
    }

    const showPoints = !NO_POINTS_MODES.includes(gameMode);

    function handlePlayAgain() {
        dispatch({ type: "RESET_GAME" });
        navigate("/");
    }

    function getPlayerStat(player) {
        if (isATCMultiplayer) {
            // Show how far each player got — their current target at game end
            const target = player.currentTarget;
            const label = target === 25 ? "Bull" : target;
            const isWinner = player.id === winner.id;
            // Winner reached the end, show "Finished"
            return isWinner ? "Finished" : `Reached ${label}`;
        }
        if (showPoints) {
            const points = gameMode === "shanghai"
                ? player.score
                : gameMode === "501"
                    ? (501 - player.score)
                    : (player.points ?? 0);
            return `${points} pts · ${player.darts.total} darts`;
        }
        // ATC solo — show darts
        return `${player.darts.total} darts`;
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 gap-6">
            <div className="w-full max-w-sm rounded-2xl border p-6 text-center"
                style={{ borderColor: "#cc2200", backgroundColor: "#1a0500" }}>

                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">
                    {isSolo ? "Finished!" : "Winner"}
                </p>

                {winner.isShanghai && (
                    <p className="text-sm font-black uppercase tracking-[0.2em] mb-1"
                        style={{ color: "#f59e0b" }}>
                        Shanghai!
                    </p>
                )}

                <h1 className="text-4xl font-black uppercase tracking-tight mb-4"
                    style={{ color: "#cc2200" }}>
                    {winner.name}
                </h1>

                {isSolo && winner.finalPlayers?.[0] && (
                    <p className="text-sm text-gray-400 mb-4">
                        {winner.finalPlayers[0].darts.total} darts
                    </p>
                )}

                {/* Final scores */}
                <div className="flex flex-col gap-2 mb-6">
                    {winner.finalPlayers?.map(player => {
                        const isWinnerPlayer = player.id === winner.id;
                        return (
                            <div key={player.id}
                                className="flex items-center justify-between rounded-lg px-3 py-2"
                                style={{ backgroundColor: isWinnerPlayer ? "#2a0800" : "#111827" }}>
                                <span className="text-sm font-black uppercase tracking-wide"
                                    style={{ color: isWinnerPlayer ? "#cc2200" : "#6b7280" }}>
                                    {isWinnerPlayer ? "🎯 " : ""}{player.name}
                                </span>
                                <span className="text-sm tabular-nums"
                                    style={{ color: isWinnerPlayer ? "#cc2200" : "#4b5563" }}>
                                    {getPlayerStat(player)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handlePlayAgain}
                    className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-[0.15em] text-white"
                    style={{ backgroundColor: "#cc2200" }}>
                    Play Again
                </button>
            </div>
        </div>
    );
}