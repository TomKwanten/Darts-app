export default function StatGrid({ items }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {items.map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-800 py-3 px-4">
                    <div className="text-xl font-black tabular-nums text-gray-100">{value}</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                </div>
            ))}
        </div>
    );
}