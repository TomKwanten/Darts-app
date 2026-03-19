import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";

export default function Setup() {
    const [playerName, setPlayerName] = useState("");
    const [playerNames, setPlayerNames] = useState([]);
    const navigate = useNavigate();
    const { dispatch } = useContext(GameContext);

    return (
        <div>
            <input 
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                placeholder="name input"
            />
            <button onClick={() => {
                if (playerName.trim() !== "") {
                    setPlayerNames([...playerNames, playerName.trim()]);
                    setPlayerName("");
                }
            }}>
                Add Player
            </button>
            <ul>
                {playerNames.map((name) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>

            <button onClick={() => {
                if (playerNames.length >= 2) {
                    const players = playerNames.map(name => ({ 
                        name, 
                        marks: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 }, 
                        points: 0 
                    }));
                    dispatch({ type: "START_GAME", payload: players });
                    navigate("/game");
                }
            }}>
                Start Game
            </button>
        </div>
        
    );
}