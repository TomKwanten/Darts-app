import { useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { GameContext } from "../context/GameContext";
import { Link } from "react-router-dom";
import Numpad from "../components/Numpad";
import PlayerCard from "../components/PlayerCard";

export default function Game() {
    const { gameState, dispatch } = useContext(GameContext);
    const { players, currentPlayerIndex, winner } = gameState;

    const [stats, setStats] = useLocalStorage("cricket-stats", []);

    useEffect(() => {
        if (!winner) return;
        const gameSummary = {
            date: new Date().toISOString(),
            winner: winner.name,
            players: winner.finalPlayers.map(player => ({
                name: player.name,
                points: player.points,
                darts: { ...player.darts }
            }))
        };
        setStats(prevStats => [...prevStats, gameSummary]);
    }, [winner]);

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

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <h1 className="text-lg font-black uppercase tracking-tight text-gray-100">
                    Cricket
                </h1>
                <Link to="/stats"
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
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
                        onClick={() => dispatch({ type: "RESET_GAME" })}
                        className="mt-2 px-5 py-1 rounded-lg text-xs font-black uppercase tracking-widest text-white"
                        style={{ backgroundColor: "#cc2200" }}>
                        Play Again
                    </button>
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