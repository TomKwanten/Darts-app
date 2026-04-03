import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GameProvider from "./context/GameContext";
import Setup from "./pages/Setup";
import Game from "./pages/Game";
import Stats from "./pages/Stats";

const router = createBrowserRouter([
    { path: "/", element: <Setup /> },
    { path: "/game", element: <Game /> },
    { path: "/stats", element: <Stats /> },
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