import { getCheckout } from "../utils/checkouts";

export default function PlayerCard501({ player, isActive, currentTurn, finishMultiplier }) {
    const turnTotal = isActive
        ? currentTurn.reduce((sum, d) => sum + d.number * d.multiplier, 0)
        : 0;
    const displayed = player.score - turnTotal;
    const isBust = displayed < 0 || displayed === 1;
    const isRunning = isActive && currentTurn.length > 0;
    const checkout = isActive && !isBust ? getCheckout(displayed, finishMultiplier) : null;

    return (
        <div className="flex flex-col items-center justify-center py-2 gap-1">
            <span className="text-3xl font-black tabular-nums"
                style={{
                    color: isBust ? "#f59e0b" : isRunning ? "#22c55e" : isActive ? "#cc2200" : "#9ca3af",
                }}>
                {displayed}
            </span>
            {checkout && (
                <div className="flex gap-1">
                    {checkout.split(" ").map((token, i) => (
                        <span
                            key={i}
                            className="text-[11px] font-bold rounded px-0.5 py-0.5"
                            style={{ color: "#22c55e", backgroundColor: "#1a4731" }}>
                            {token}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}