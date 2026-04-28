import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import GameProvider from "./context/GameContext";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Game from "./pages/Game";
import Winner from "./pages/Winner";
import Stats from "./pages/Stats";
import PlayerStats from "./pages/PlayerStats";
import GameDetail from "./pages/GameDetail";

function AppShell() {
    return (
        <GameProvider>
            <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
                <Outlet />
            </div>
        </GameProvider>
    );
}

const router = createBrowserRouter([
    {
        element: <AppShell />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/setup", element: <Setup /> },
            { path: "/game", element: <Game /> },
            { path: "/winner", element: <Winner /> },
            { path: "/stats", element: <Stats /> },
            { path: "/stats/players/:id", element: <PlayerStats /> },
            { path: "/stats/games/:id", element: <GameDetail /> },
        ],
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}