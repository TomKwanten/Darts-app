import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GameProvider from "./context/GameContext";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Game from "./pages/Game";
import Stats from "./pages/Stats";
import PlayerStats from "./pages/PlayerStats";
import GameDetail from "./pages/GameDetail";

const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/setup", element: <Setup /> },
    { path: "/game", element: <Game /> },
    { path: "/stats", element: <Stats /> },
    { path: "/stats/players/:id", element: <PlayerStats /> },
    { path: "/stats/games/:id", element: <GameDetail /> },
]);

export default function App() {
    return (
        <GameProvider>
            <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
                <RouterProvider router={router} />
            </div>
        </GameProvider>
    );
}