import { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/GameContext";
import { Link, useNavigate, useBlocker } from "react-router-dom";
import Numpad from "../components/Numpad";
import PlayerCard from "../components/PlayerCard";
import { saveGame } from "../utils/api";

const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

function computeRanks(players, gameMode) {
    const sorted = [...players].sort((a, b) => {
        if (gameMode === "501") {
            return a.score - b.score; // lower remaining = better
        }
        // Cricket: points desc, then closed numbers desc
        if (b.points !== a.points) return b.points - a.points;
        const closedA = NUMBERS.filter(n => a.marks[n] === 3).length;
        const closedB = NUMBERS.filter(n => b.marks[n] === 3).length;
        return closedB - closedA;
    });

    // Build rank map — ties get the same rank
    const rankMap = {};
    sorted.forEach((player, i) => {
        if (i === 0) {
            rankMap[player.name] = 1;
        } else {
            const prev = sorted[i - 1];
            const samePoints = player.points === prev.points;
            const sameClosed = gameMode !== "501" &&
                NUMBERS.filter(n => player.marks[n] === 3).length ===
                NUMBERS.filter(n => prev.marks[n] === 3).length;
            const sameScore = gameMode === "501" && player.score === prev.score;
            const isTie = gameMode === "501" ? sameScore : (samePoints && sameClosed);
            rankMap[player.name] = isTie ? rankMap[prev.name] : i + 1;
        }
    });

    return rankMap;
}

export default function Game() {
    const { gameState, dispatch } = useContext(GameContext);
    const { players, currentPlayerIndex, winner, turns, gameMode, currentTurn, finishMultiplier } = gameState;
    const [saveError, setSaveError] = useState(false);
    const Navigate = useNavigate();

    const isGameInProgress = players.length > 0 && !winner;

    const blocker = useBlocker(isGameInProgress);

    useEffect(() => {
        if (!winner) return;
        const gameSummary = {
            winner_id: winner.id,
            game_mode: gameMode,
            players: winner.finalPlayers.map(player => ({
                id: player.id,
                points: gameMode === "501" ? (501 - player.score) : player.points,
                total_darts: player.darts.total,
                singles: player.darts.singles,
                doubles: player.darts.doubles,
                triples: player.darts.triples,
            })),
            turns: turns,
        };
        console.log("Saving game:", JSON.stringify(gameSummary, null, 2));
        saveGame(gameSummary).catch(() => {
            setSaveError(true);
        });
    }, [winner]);

    const rankMap = computeRanks(players, gameMode);

    if (players.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">No game in progress</p>
                <Link to="/"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
                    ← Back to setup
                </Link>
            </div>
        );
    }

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
                <h1 className="text-xl font-black uppercase tracking-tight text-gray-100">
                    {gameMode === "501" ? "501" : "Cricket"}
                </h1>
                <Link to="/stats"
                    className="text-sm uppercase tracking-widest text-gray-400 hover:text-gray-400 transition-colors">
                    Stats →
                </Link>
            </div>

            {/* Winner banner */}
            {winner && (
                <div className="rounded-xl border p-3 text-center flex-shrink-0"
                    style={{ borderColor: "#cc2200", backgroundColor: "#1a0500" }}>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Winner</p>
                    <h2 className="text-2xl font-black uppercase tracking-tight"
                        style={{ color: "#cc2200" }}>
                        {winner.name}
                    </h2>
                    <button
                        onClick={() => { dispatch({ type: "RESET_GAME" }); setSaveError(false); Navigate("/"); }}
                        className="mt-2 px-5 py-1 rounded-lg text-xs font-black uppercase tracking-widest text-white"
                        style={{ backgroundColor: "#cc2200" }}>
                        Play Again
                    </button>
                    {saveError && (
                        <p className="mt-2 text-xs uppercase tracking-widest text-red-400">
                            Game could not be saved
                        </p>
                    )}
                </div>
            )}

            {/* Player cards — horizontal scroll for 5+ players */}
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
                            rank={rankMap[player.name]}
                            finishMultiplier={finishMultiplier}
                        />
                    </div>
                ))}
            </div>

            {/* Numpad — takes remaining space */}
            <div className="flex-1 min-h-0">
                <Numpad />
            </div>
        </div>
    );
}