import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { getPlayers, createPlayer, deletePlayer, renamePlayer } from "../utils/api";
import { SEQUENCES } from "../utils/ATCLogic";

const ACCENT_RED = "#cc2200";
const BOARD_GREEN = "#1a4731";

const MODE_LABELS = {
    cricket: "Cricket",
    "501": "501",
    "around-the-clock": "Around the Clock",
    "shanghai": "Shanghai",
};

export default function Setup() {
    const [playerName, setPlayerName] = useState("");
    const [allPlayers, setAllPlayers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [adding, setAdding] = useState(false);
    const [renameId, setRenameId] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [finishMultiplier, setFinishMultiplier] = useState(2);
    const [order, setOrder] = useState("sequential");
    const [solo, setSolo] = useState(false);
    const [maxRounds, setMaxRounds] = useState(7);

    const navigate = useNavigate();
    const location = useLocation();
    const gameMode = location.state?.gameMode;
    const { dispatch } = useContext(GameContext);
    const isATC = gameMode === "around-the-clock";
    const isShanghai = gameMode === "shanghai";

    useEffect(() => {
        if (!gameMode) navigate("/", { replace: true });
    }, [gameMode, navigate]);

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
        if (isATC && solo) {
            setSelectedIds(prev => prev.includes(id) ? [] : [id]);
        } else {
            setSelectedIds(prev =>
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        }
    }

    function handleSoloToggle(isSolo) {
        setSolo(isSolo);
        setSelectedIds([]);
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
        } finally {
            setAdding(false);
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

    async function handleRenamePlayer(id) {
        const trimmed = renameValue.trim();
        if (trimmed === "") return;
        try {
            const updated = await renamePlayer(id, trimmed);
            setAllPlayers(prev => prev.map(p => p.id === id ? updated : p));
            setRenameId(null);
            setRenameValue("");
        } catch {
            setError("Could not rename player.");
        }
    }

    function handleStartGame() {
        const selectedPlayers = allPlayers.filter(p => selectedIds.includes(p.id));
        const minPlayers = isATC && solo ? 1 : 2;
        if (selectedPlayers.length < minPlayers) return;

        const gamePlayers = selectedPlayers.map(player => {
            if (gameMode === "501") {
                return {
                    id: player.id,
                    name: player.name,
                    score: 501,
                    darts: { total: 0, singles: 0, doubles: 0, triples: 0 },
                    bulls: { green: 0, red: 0 },
                };
            }
            if (gameMode === "around-the-clock") {
                return {
                    id: player.id,
                    name: player.name,
                    currentTarget: SEQUENCES[order][0],
                    targetIndex: 0,
                    darts: { total: 0, singles: 0, doubles: 0, triples: 0 },
                };
            }
            if (gameMode === "shanghai") {
                return {
                    id: player.id,
                    name: player.name,
                    score: 0,
                    shanghais: 0,
                    darts: { total: 0, singles: 0, doubles: 0, triples: 0 },
                };
            }
            return {
                id: player.id,
                name: player.name,
                marks: { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 },
                points: 0,
                darts: { total: 0, singles: 0, doubles: 0, triples: 0 },
                bulls: { green: 0, red: 0 },
            };
        });

        dispatch({
            type: "START_GAME",
            payload: { players: gamePlayers, gameMode, finishMultiplier, order, solo, maxRounds },
        });
        navigate("/game");
    }

    const canStart = selectedIds.length >= (isATC && solo ? 1 : 2);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">

            {/* Title */}
            <div className="mb-10 text-center">
                <div className="text-xl uppercase tracking-[0.4em] text-gray-500 mb-2">
                    START
                </div>
                <h1 className="text-6xl font-black uppercase tracking-tight text-gray-100">
                    {MODE_LABELS[gameMode] ?? "Darts"}
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
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddPlayer(); }}
                            placeholder="Enter name..."
                            className="flex-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-100
                                       px-3 py-2 text-sm placeholder-gray-600
                                       focus:outline-none focus:border-gray-500"
                        />
                        <button
                            onClick={handleAddPlayer}
                            disabled={adding}
                            className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                       text-white transition-all duration-150 disabled:opacity-50"
                            style={{ backgroundColor: BOARD_GREEN }}
                        >
                            {adding ? "Adding..." : "Add"}
                        </button>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-xs text-red-400 mb-4">{error}</p>
                )}

                {/* ATC: Solo / Multiplayer toggle */}
                {isATC && (
                    <div className="mb-5">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                            Mode
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSoloToggle(false)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                           border transition-all duration-150"
                                style={{
                                    backgroundColor: !solo ? BOARD_GREEN : "transparent",
                                    borderColor: !solo ? BOARD_GREEN : "#374151",
                                    color: !solo ? "white" : "#6b7280",
                                }}
                            >
                                Multiplayer
                            </button>
                            <button
                                onClick={() => handleSoloToggle(true)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                           border transition-all duration-150"
                                style={{
                                    backgroundColor: solo ? BOARD_GREEN : "transparent",
                                    borderColor: solo ? BOARD_GREEN : "#374151",
                                    color: solo ? "white" : "#6b7280",
                                }}
                            >
                                Solo
                            </button>
                        </div>
                    </div>
                )}

                {/* Player list */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500">
                            {isATC && solo ? "Select Player" : "Select Players"}
                        </label>
                        {allPlayers.length > 0 && (
                            <button
                                onClick={() => {
                                    setEditMode(prev => !prev);
                                    setConfirmDeleteId(null);
                                    setRenameId(null);
                                    setRenameValue("");
                                }}
                                className="text-xs uppercase tracking-widest transition-colors duration-150"
                                style={{ color: editMode ? "white" : "#4b5563" }}
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
                                        className={`rounded-lg bg-gray-800 border px-3 py-2 transition-colors duration-150
                                            ${renameId === player.id ? "flex flex-col gap-2" : "flex items-center justify-between"}`}
                                        style={{
                                            borderColor: isSelected && !editMode ? "#22c55e" : "#374151",
                                            cursor: editMode ? "default" : "pointer"
                                        }}>
                                        {renameId === player.id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") handleRenamePlayer(player.id); }}
                                                    className="w-full rounded bg-gray-700 border border-gray-600 text-gray-100
                                                               px-2 py-1 text-sm focus:outline-none focus:border-gray-400"
                                                    autoFocus
                                                />
                                                <div className="flex gap-3 justify-end">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setRenameId(null); setRenameValue(""); }}
                                                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-150"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRenamePlayer(player.id); }}
                                                        className="text-xs font-black text-white hover:text-gray-300 transition-colors duration-150"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
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
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setRenameId(player.id); setRenameValue(player.name); }}
                                                                className="text-xs text-gray-500 hover:text-gray-300 px-1 transition-colors duration-150"
                                                            >
                                                                Rename
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(player.id); }}
                                                                className="text-xs font-black text-red-500 hover:text-red-400 px-1 transition-colors duration-150"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                                {!editMode && isSelected && (
                                                    <span className="text-xs font-black uppercase tracking-wider"
                                                        style={{ color: "#22c55e" }}>
                                                        ✓ {solo ? "Selected" : "Playing"}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* 501 finish option */}
                {gameMode === "501" && (
                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                            Finish On
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFinishMultiplier(2)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                           border transition-all duration-150"
                                style={{
                                    backgroundColor: finishMultiplier === 2 ? BOARD_GREEN : "transparent",
                                    borderColor: finishMultiplier === 2 ? BOARD_GREEN : "#374151",
                                    color: finishMultiplier === 2 ? "white" : "#6b7280",
                                }}
                            >
                                Double
                            </button>
                            <button
                                onClick={() => setFinishMultiplier(3)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                           border transition-all duration-150"
                                style={{
                                    backgroundColor: finishMultiplier === 3 ? BOARD_GREEN : "transparent",
                                    borderColor: finishMultiplier === 3 ? BOARD_GREEN : "#374151",
                                    color: finishMultiplier === 3 ? "white" : "#6b7280",
                                }}
                            >
                                Triple
                            </button>
                        </div>
                    </div>
                )}

                {/* ATC order option */}
                {isATC && (
                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                            Order
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOrder("sequential")}
                                className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                           border transition-all duration-150"
                                style={{
                                    backgroundColor: order === "sequential" ? BOARD_GREEN : "transparent",
                                    borderColor: order === "sequential" ? BOARD_GREEN : "#374151",
                                    color: order === "sequential" ? "white" : "#6b7280",
                                }}
                            >
                                1 ➔ 20
                            </button>
                            <button
                                onClick={() => setOrder("clockwise")}
                                className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                           border transition-all duration-150"
                                style={{
                                    backgroundColor: order === "clockwise" ? BOARD_GREEN : "transparent",
                                    borderColor: order === "clockwise" ? BOARD_GREEN : "#374151",
                                    color: order === "clockwise" ? "white" : "#6b7280",
                                }}
                            >
                                Clockwise
                            </button>
                        </div>
                    </div>
                )}

                {/* Shanghai rounds option */}
                {isShanghai && (
                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                            Rounds
                        </label>
                        <div className="flex gap-2">
                            {[7, 20].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setMaxRounds(r)}
                                    className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                                               border transition-all duration-150"
                                    style={{
                                        backgroundColor: maxRounds === r ? BOARD_GREEN : "transparent",
                                        borderColor: maxRounds === r ? BOARD_GREEN : "#374151",
                                        color: maxRounds === r ? "white" : "#6b7280",
                                    }}>
                                    {r === 7 ? "7 Rounds" : "20 Rounds"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Start button */}
                <button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-[0.15em]
                               text-white transition-all duration-200 disabled:opacity-40"
                    style={{ backgroundColor: ACCENT_RED }}>
                    Start Game ➔
                </button>
            </div>

            {/* Back link */}
            <Link to="/"
                className="mt-8 text-lg uppercase tracking-widest text-gray-400
                           hover:text-gray-400 transition-colors duration-150">
                ‹‹ Back
            </Link>
        </div>
    );
}