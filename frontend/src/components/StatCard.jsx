export default function StatCard({ label, value, cls }) {
  return (
    <div className="stat-card">
      <div className="stat-lbl">{label}</div>
      <div className={`stat-val ${cls || ""}`}>{value}</div>
    </div>
  );
}
