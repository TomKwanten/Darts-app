import StatCard from "./StatCard";

export default function BullsCard({ greenBulls, redBulls }) {
    return (
        <StatCard title="Bulls">
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-800 py-3 px-4">
                    <div className="text-xl font-black tabular-nums text-gray-100">{greenBulls}</div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: "#22c55e" }} />
                        <span className="text-[9px] uppercase tracking-wider text-gray-500">Green Bull</span>
                    </div>
                </div>
                <div className="rounded-lg bg-gray-800 py-3 px-4">
                    <div className="text-xl font-black tabular-nums text-gray-100">{redBulls}</div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: "#cc2200" }} />
                        <span className="text-[9px] uppercase tracking-wider text-gray-500">Red Bull</span>
                    </div>
                </div>
            </div>
        </StatCard>
    );
}