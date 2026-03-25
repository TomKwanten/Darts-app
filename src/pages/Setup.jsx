import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { Link } from "react-router-dom";

const ACCENT_RED = "#cc2200";
const BOARD_GREEN = "#1a4731";

export default function Setup() {
    const [playerName, setPlayerName] = useState("");
    const [playerNames, setPlayerNames] = useState([]);
    const navigate = useNavigate();
    const { dispatch } = useContext(GameContext);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">

            {/* Title */}
            <div className="mb-10 text-center">
                <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-2">
                    START
                </div>
                <h1 className="text-6xl font-black uppercase tracking-tight text-gray-100">
                    Cricket
                </h1>
                <div className="mt-2 h-1 w-16 mx-auto rounded-full"
                    style={{ backgroundColor: ACCENT_RED }} />
            </div>

            {/* Card */}
            <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">

                {/* Input row */}
                <div className="mb-5">
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                        Player Name
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={playerName} 
                            onChange={(e) => setPlayerName(e.target.value)} 
                            placeholder="Enter name..."
                            className="flex-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-100
                                        px-3 py-2 text-sm placeholder-gray-600 
                                        focus:outline-none focus:border-gray-500"
                        />
                        <button 
                            onClick={() => {
                                if (playerName.trim() !== "") {
                                    setPlayerNames([...playerNames, playerName.trim()]);
                                    setPlayerName("");
                                }
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                        text-white transtion-all duration-150"
                            style={{ backgroundColor: BOARD_GREEN }}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Player list */}
                <div className="mb-6 min-h-[80px]">
                    {playerNames.length === 0 ? (
                        <p className="text-xs text-gray-600 italic text-center pt-4">
                            Add at least 2 players to start
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {playerNames.map((name) => (
                                <li key={name}
                                    className="flex items-center gap-3 rounded-lg
                                               bg-gray-800 border border-gray-700 px-3 py-2">
                                    <span className="text-sm font-semibold text-gray-100">
                                        {name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Start button */}
                <button
                    onClick={() => {
                        if (playerNames.length >= 2) {
                            const players = playerNames.map(name => ({
                                name,
                                marks: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 },
                                points: 0,
                                darts: { total: 0, singles: 0, doubles: 0, triples: 0 }
                            }));
                            dispatch({ type: "START_GAME", payload: players });
                            navigate("/game");
                        }
                    }}
                    className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-[0.15em]
                               text-white transition-all duration-200"
                    style={{ backgroundColor: ACCENT_RED }}>
                    Start Game →
                </button>
            </div>

            {/* Footer link */}
            <Link to="/stats"
                className="mt-8 text-xs uppercase tracking-widest text-gray-600
                           hover:text-gray-400 transition-colors duration-150">
                View Stats →
            </Link>
        </div>
    );
}