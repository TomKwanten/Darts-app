import { useNavigate, Link } from "react-router-dom";

const ACCENT_RED = "#cc2200";
const BOARD_GREEN = "#1a4731";

const GAME_MODES = [
    {
        id: "cricket",
        label: "Cricket",
        description: "Close 15–20 and Bull, score points to win.",
        available: true,
    },
    {
        id: "501",
        label: "501",
        description: "Count down from 501. Finish on a double or triple.",
        available: true,
    },
];

export default function Home() {
    const navigate = useNavigate();

    function handleSelectMode(modeId) {
        navigate("/setup", { state: { gameMode: modeId } });
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">

            {/* Title */}
            <div className="mb-10 text-center">
                <div className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-2">
                    Select Game Mode
                </div>
                <h1 className="text-6xl font-black uppercase tracking-tight text-gray-100">
                    Darts
                </h1>
                <div className="mt-2 h-1 w-16 mx-auto rounded-full"
                    style={{ backgroundColor: ACCENT_RED }} />
            </div>

            {/* Mode cards */}
            <div className="w-full max-w-sm flex flex-col gap-4">
                {GAME_MODES.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => mode.available && handleSelectMode(mode.id)}
                        disabled={!mode.available}
                        className="w-full rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl
                                   text-left transition-all duration-150 disabled:opacity-40"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xl font-black uppercase tracking-tight text-gray-100">
                                {mode.label}
                            </span>
                            {mode.available && (
                                <span
                                    className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full"
                                    style={{ backgroundColor: "#14532d", color: "#22c55e" }}>
                                    Play →
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">{mode.description}</p>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <Link to="/stats"
                className="mt-10 text-xs uppercase tracking-widest text-gray-600
                           hover:text-gray-400 transition-colors duration-150">
                View Stats →
            </Link>
        </div>
    );
}