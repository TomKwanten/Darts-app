import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameProvider from "./context/GameContext";
import Setup from "./pages/Setup";
import Game from "./pages/Game";
import Stats from "./pages/Stats";

export default function App() {
    return (
        <GameProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Setup />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/stats" element={<Stats />} />
                </Routes>
            </BrowserRouter>
        </GameProvider>
    );
}