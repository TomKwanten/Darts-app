import { useLocalStorage } from "../hooks/useLocalStorage";
import { Link } from "react-router-dom";

function calculateCareerStats(stats) {
    const players = {};

    for (const game of stats) {
        for (const player of game.players) {
            if (!players[player.name]) {
                players[player.name] = {
                    name: player.name,
                    gamesPlayed: 0,
                    wins: 0,
                    totalDarts: 0,
                    singles: 0,
                    doubles: 0,
                    triples: 0,
                };
            }

            const career = players[player.name];
            career.gamesPlayed += 1;
            career.wins += game.winner === player.name ? 1 : 0;
            career.totalDarts += player.darts.total;
            career.singles += player.darts.singles;
            career.doubles += player.darts.doubles;
            career.triples += player.darts.triples;
        }
    }

    return Object.values(players);
}

export default function Stats() {
    const [stats] = useLocalStorage("cricket-stats", []);

    if (stats.length === 0) {
        return (
            <div>
                <h1>Stats</h1>
                <p>No games played yet.</p>
                <Link to="/">Back to setup</Link>
            </div>
        );
    }

    const careerStats = calculateCareerStats(stats);

    return (
        <div>
            <h1>Stats</h1>
            <Link to="/">Back to setup</Link>

            <h2>Career stats</h2>
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Games</th>
                        <th>Wins</th>
                        <th>Total darts</th>
                        <th>Singles</th>
                        <th>Doubles</th>
                        <th>Triples</th>
                    </tr>
                </thead>
                <tbody>
                    {careerStats.map(player => (
                        <tr key={player.name}>
                            <td>{player.name}</td>
                            <td>{player.gamesPlayed}</td>
                            <td>{player.wins}</td>
                            <td>{player.totalDarts}</td>
                            <td>{player.singles}</td>
                            <td>{player.doubles}</td>
                            <td>{player.triples}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Game history</h2>
            {stats.map((game, index) => (
                <div key={index} style={{ border: "1px solid gray", padding: "12px", marginBottom: "12px" }}>
                    <p><strong>Date:</strong> {new Date(game.date).toLocaleString()}</p>
                    <p><strong>Winner:</strong> {game.winner}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Points</th>
                                <th>Total darts</th>
                                <th>Singles</th>
                                <th>Doubles</th>
                                <th>Triples</th>
                            </tr>
                        </thead>
                        <tbody>
                            {game.players.map(player => (
                                <tr key={player.name}>
                                    <td>{player.name}</td>
                                    <td>{player.points}</td>
                                    <td>{player.darts.total}</td>
                                    <td>{player.darts.singles}</td>
                                    <td>{player.darts.doubles}</td>
                                    <td>{player.darts.triples}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}