export default function MiniBarChart({ data, label = "Uploads" }) {
  if (!data?.length) {
    return <p className="text-sm text-slate-500">No upload activity in the last 30 days.</p>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">{label} (30 days)</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div
              className="w-full rounded-t bg-brand-600/80 hover:bg-brand-500 transition-all min-h-[4px]"
              style={{ height: `${Math.max(12, (d.count / max) * 96)}px` }}
              title={`${d.date}: ${d.count}`}
            />
            <span className="text-[9px] text-slate-600 truncate w-full text-center">
              {d.date.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
