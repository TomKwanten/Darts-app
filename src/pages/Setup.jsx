import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { Link } from "react-router-dom";
import { getPlayers, createPlayer, deletePlayer } from "../utils/api";

const ACCENT_RED = "#cc2200";
const BOARD_GREEN = "#1a4731";

export default function Setup() {
    const [playerName, setPlayerName] = useState("");
    const [allPlayers, setAllPlayers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const navigate = useNavigate();
    const { dispatch } = useContext(GameContext);

    useEffect(() => {
        getPlayers()
            .then(data => {
                setAllPlayers(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load players.");
                setLoading(false);
            });
    }, []);

    function togglePlayer(id) {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }

    async function handleAddPlayer() {
        const trimmed = playerName.trim();
        if (trimmed === "") return;
        try {
            const newPlayer = await createPlayer(trimmed);
            setAllPlayers(prev => [...prev, newPlayer]);
            setPlayerName("");
        } catch {
            setError("Could not add player.");
        }
    }

    async function handleDeletePlayer(id) {
        try {
            await deletePlayer(id);
            setAllPlayers(prev => prev.filter(p => p.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
        } catch {
            setError("Could not delete player.");
        }
    }

    const selectedPlayers = allPlayers.filter(p => selectedIds.includes(p.id));

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
                        Add New Player
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
                            onClick={handleAddPlayer}
                            className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                        text-white transition-all duration-150"
                            style={{ backgroundColor: BOARD_GREEN }}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-xs text-red-400 mb-4">{error}</p>
                )}

                {/* Player list */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500">
                            Select Players
                        </label>
                        {allPlayers.length > 0 && (
                            <button
                                onClick={() => { setEditMode(prev => !prev); setConfirmDeleteId(null); }}
                                className="text-xs uppercase tracking-widest transition-colors duration-150"
                                style={{ color: editMode ? BOARD_GREEN : "#4b5563" }}
                            >
                                {editMode ? "Done" : "Edit"}
                            </button>
                        )}
                    </div>
                    {loading ? (
                        <div className="flex justify-center pt-4">
                            <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : allPlayers.length === 0 ? (
                        <p className="text-xs text-gray-600 italic text-center pt-4">
                            No players yet — add some above
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {allPlayers.map((player) => {
                                const isSelected = selectedIds.includes(player.id);
                                return (
                                    <li key={player.id}
                                        onClick={() => !editMode && togglePlayer(player.id)}
                                        className="flex items-center justify-between rounded-lg
                                                   bg-gray-800 border px-3 py-2 transition-colors duration-150"
                                        style={{
                                            borderColor: isSelected && !editMode ? BOARD_GREEN : "#374151",
                                            cursor: editMode ? "default" : "pointer"
                                        }}>
                                        <span className="text-sm font-semibold text-gray-100">
                                            {player.name}
                                        </span>
                                        {editMode && (
                                            confirmDeleteId === player.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                                        className="text-xs text-gray-500 hover:text-gray-300 px-1 transition-colors duration-150"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeletePlayer(player.id); setConfirmDeleteId(null); }}
                                                        className="text-xs font-black text-red-500 hover:text-red-400 px-1 transition-colors duration-150"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(player.id); }}
                                                    className="text-xs font-black text-red-500 hover:text-red-400 px-1 transition-colors duration-150"
                                                >
                                                    ✕
                                                </button>
                                            )
                                        )}
                                        {!editMode && isSelected && (
                                            <span className="text-xs font-bold uppercase tracking-wider"
                                                style={{ color: BOARD_GREEN }}>
                                                ✓ Playing
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Start button */}
                <button
                    onClick={() => {
                        if (selectedPlayers.length >= 2) {
                            const gamePlayers = selectedPlayers.map(player => ({
                                id: player.id,
                                name: player.name,
                                marks: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 },
                                points: 0,
                                darts: { total: 0, singles: 0, doubles: 0, triples: 0 }
                            }));
                            dispatch({ type: "START_GAME", payload: gamePlayers });
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