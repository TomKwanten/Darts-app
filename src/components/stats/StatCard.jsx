export default function StatCard({ title, children }) {
    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
            <div className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">{title}</div>
            {children}
        </div>
    );
}