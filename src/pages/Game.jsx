import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import Numpad from "../components/Numpad";
import PlayerCard from "../components/PlayerCard";

export default function Game() {
    const { gameState, dispatch } = useContext(GameContext);
    const { players, currentPlayerIndex, winner } = gameState;

    if (players.length === 0) {
        return <p>No game started. Go to setup first.</p>;
    }

    return (
        <div>
            <h1>Cricket</h1>

            {winner && (
                <div style={{ background: "gold", padding: "16px" }}>
                    <h2>🎯 {winner} wins!</h2>
                    <button onClick={() => dispatch({ type: "RESET_GAME" })}>
                        Play Again
                    </button>
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
        </div>
    );
}