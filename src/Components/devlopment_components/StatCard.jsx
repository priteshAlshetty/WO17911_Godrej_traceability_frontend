export default function StatCard({ label, value, unit }) {

  const roundedValue = typeof value === 'number' ? Number(value).toFixed(2) : value;

  return (
    <div className="stat-card">

      <div className="label">{label}</div>

      <div className="value">
        {roundedValue} <span>{unit}</span>
      </div>

    </div>
  );
}