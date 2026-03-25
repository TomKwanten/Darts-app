import { useContext, useEffect } from "react";
import { GameContext } from "../context/GameContext";
import Numpad from "../components/Numpad";
import PlayerCard from "../components/PlayerCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Link } from "react-router-dom";

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
        return <p>No game started. Go to setup first.</p>;
    }

    return (
        <div>
            <h1>Cricket</h1>
            {winner && (
                <div style={{ background: "gold", padding: "16px" }}>
                    <h2>{winner.name} wins!</h2>
                    <button onClick={() => dispatch({ type: "RESET_GAME" })}>Play Again</button>
                </div>
            )}
            <div style={{ display: "flex", gap: "16px" }}>
                {players.map((player, index) => (
                    <PlayerCard
                        key={player.name}
                        player={player}
                        isActive={index === currentPlayerIndex}
                    />
                ))}
            </div>
            <Numpad />
            <Link to="/stats">View Stats</Link>
        </div>
    );
}