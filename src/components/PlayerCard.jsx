const NUMBERS = [15, 16, 17, 18, 19, 20, 25];

function renderMarks(count) {
    if (count === 0) return "";
    if (count === 1) return "/";
    if (count === 2) return "X";
    if (count === 3) return "✓";
}

export default function PlayerCard({ player, isActive }) {
    return (
        <div style={{
            border: isActive ? "3px solid blue" : "1px solid gray",
            padding: "12px"
        }}>
            <h2>{player.name}</h2>
            <p>Points: {player.points}</p>

            <table>
                <tbody>
                    {NUMBERS.map((number) => (
                        <tr key={number}>
                            <td>{number === 25 ? "Bull" : number}</td>
                            <td>{renderMarks(player.marks[number])}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}