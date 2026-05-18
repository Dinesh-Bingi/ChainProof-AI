import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#34d399", "#fbbf24", "#94a3b8"];

export default function StatusPieChart({ verified = 0, flagged = 0, pending = 0 }) {
  const data = [
    { name: "Verified", value: verified },
    { name: "Flagged", value: flagged },
    { name: "Pending", value: pending },
  ].filter((d) => d.value > 0);

  const total = verified + flagged + pending;

  if (!total) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-slate-500">
        No proof data yet
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
    </div>
  );
}
