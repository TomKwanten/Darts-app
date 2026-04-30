import { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/GameContext";
import { Link, useNavigate, useBlocker } from "react-router-dom";
import Numpad from "../components/Numpad";
import PlayerCard from "../components/PlayerCard";
import { saveGame } from "../utils/api";
import { getProgressIndex } from "../utils/ATCLogic";

const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

let isSaving = false;

function computeRanks(players, gameMode, order) {
    const isATC = gameMode === "around-the-clock" || gameMode === "around-the-clock-solo";

    const sorted = [...players].sort((a, b) => {
        if (gameMode === "501") {
            return a.score - b.score;
        }
        if (isATC) {
            const progA = getProgressIndex(a.target, order ?? "sequential");
            const progB = getProgressIndex(b.target, order ?? "sequential");
            if (progB !== progA) return progB - progA;
            return a.darts.total - b.darts.total;
        }
        if (gameMode === "shanghai") {
            if (b.score !== a.score) return b.score - a.score;
            return a.darts.total - b.darts.total;
        }
        if (b.points !== a.points) return b.points - a.points;
        const closedA = NUMBERS.filter(n => a.marks[n] === 3).length;
        const closedB = NUMBERS.filter(n => b.marks[n] === 3).length;
        return closedB - closedA;
    });

    const rankMap = {};
    sorted.forEach((player, i) => {
        if (i === 0) {
            rankMap[player.name] = 1;
        } else {
            const prev = sorted[i - 1];
            let isTie = false;
            if (gameMode === "501") {
                isTie = player.score === prev.score;
            } else if (isATC) {
                isTie = getProgressIndex(player.target, order ?? "sequential") === getProgressIndex(prev.target, order ?? "sequential")
                    && player.darts.total === prev.darts.total;
            } else if (gameMode === "shanghai") {
                isTie = player.score === prev.score && player.darts.total === prev.darts.total;
            } else {
                const samePoints = player.points === prev.points;
                const sameClosed = NUMBERS.filter(n => player.marks[n] === 3).length ===
                    NUMBERS.filter(n => prev.marks[n] === 3).length;
                isTie = samePoints && sameClosed;
            }
            rankMap[player.name] = isTie ? rankMap[prev.name] : i + 1;
        }
    });

    return rankMap;
}

export default function Game() {
    const { gameState, dispatch } = useContext(GameContext);
    const { players, currentPlayerIndex, winner, turns, dartDetails, gameMode, currentTurn, finishMultiplier, order, solo, round } = gameState;
    const [saveError, setSaveError] = useState(false);
    const navigate = useNavigate();

    const isGameInProgress = players.length > 0 && !winner;
    const isSolo = gameMode === "around-the-clock-solo";

    const blocker = useBlocker(isGameInProgress);

    useEffect(() => {
        if (!winner) {
            isSaving = false;
            return;
        }

        if (isSaving) return;
        isSaving = true;

        const isATC = gameMode === "around-the-clock" || gameMode === "around-the-clock-solo";

        const gameSummary = {
            winner_id: winner.isSolo ? null : winner.id,
            game_mode: gameMode,
            players: winner.finalPlayers.map(player => ({
                id: player.id,
                points: gameMode === "shanghai"
                    ? player.score
                    : gameMode === "501"
                        ? (501 - player.score)
                        : (player.points ?? 0),
                total_darts: player.darts.total,
                singles: player.darts.singles,
                doubles: player.darts.doubles,
                triples: player.darts.triples,
                green_bulls: player.bulls?.green ?? 0,
                red_bulls: player.bulls?.red ?? 0,
                gepikt: player.gepikt ?? 0,
                shanghais: player.shanghais ?? 0,
            })),
            turns: turns,
            // Only send dart_details for ATC games
            ...(isATC && dartDetails?.length > 0 ? { dart_details: dartDetails } : {}),
        };

        console.log("Saving game:", JSON.stringify(gameSummary, null, 2));

        saveGame(gameSummary)
            .then(() => {
                navigate("/winner", { replace: true, state: { winner, gameMode, isSolo } });
            })
            .catch(() => {
                isSaving = false;
                setSaveError(true);
            });
    }, [winner]);

    const rankMap = computeRanks(players, gameMode, order);

    if (players.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">No game in progress</p>
                <Link to="/"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ‹‹ Back to setup
                </Link>
            </div>
        );
    }

    const gameModeLabel = {
        "501": "501",
        "cricket": "Cricket",
        "around-the-clock": "Around the Clock",
        "around-the-clock-solo": "Around the Clock",
        "shanghai": "Shanghai",
    }[gameMode] ?? gameMode;

    return (
        <div className="h-screen bg-gray-950 flex flex-col px-3 py-3 gap-2 overflow-hidden">

            {/* Abandon game modal */}
            {blocker.state === "blocked" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 mx-6 flex flex-col gap-4 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Game in progress</p>
                        <h2 className="text-lg font-black uppercase tracking-tight text-gray-100">
                            Abandon game?
                        </h2>
                        <p className="text-sm text-gray-400">This game will not be saved.</p>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => blocker.reset()}
                                className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors">
                                Keep playing
                            </button>
                            <button
                                onClick={() => {
                                    dispatch({ type: "RESET_GAME" });
                                    blocker.proceed();
                                }}
                                className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-white transition-colors"
                                style={{ backgroundColor: "#cc2200" }}>
                                Abandon
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-gray-100">
                        {gameModeLabel}
                    </h1>
                    {isSolo && (
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">Solo</span>
                    )}
                </div>
                <Link to="/stats"
                    className="text-sm uppercase tracking-widest text-gray-400 hover:text-gray-400 transition-colors">
                    Stats ➔
                </Link>
            </div>

            {/* Saving indicator */}
            {winner && (
                <div className="rounded-xl border p-3 text-center flex-shrink-0"
                    style={{ borderColor: "#cc2200", backgroundColor: "#1a0500" }}>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Saving...</p>
                    {saveError && (
                        <div>
                            <p className="mt-2 text-xs uppercase tracking-widest text-red-400">
                                Game could not be saved
                            </p>
                            <button
                                onClick={() => { dispatch({ type: "RESET_GAME" }); navigate("/"); }}
                                className="mt-2 px-5 py-1 rounded-lg text-xs font-black uppercase tracking-widest text-white"
                                style={{ backgroundColor: "#cc2200" }}>
                                Continue anyway
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Player cards */}
            <div className="flex gap-2 flex-shrink-0 overflow-x-auto pb-1"
                style={{ scrollSnapType: "x mandatory" }}>
                {players.map((player, index) => (
                    <div key={player.name}
                        className="flex-shrink-0"
                        style={{
                            width: players.length <= 4
                                ? `calc(${100 / players.length}% - ${(players.length - 1) * 8 / players.length}px)`
                                : "calc(25% - 6px)",
                            scrollSnapAlign: "start",
                        }}>
                        <PlayerCard
                            player={player}
                            isActive={index === currentPlayerIndex}
                            gameMode={gameMode}
                            currentTurn={index === currentPlayerIndex ? currentTurn : []}
                            players={players}
                            rank={isSolo ? null : rankMap[player.name]}
                            finishMultiplier={finishMultiplier}
                            order={order}
                            round={round}
                        />
                    </div>
                ))}
            </div>

            {/* Numpad */}
            <div className="flex-1 min-h-0">
                <Numpad />
            </div>
        </div>
    );
}