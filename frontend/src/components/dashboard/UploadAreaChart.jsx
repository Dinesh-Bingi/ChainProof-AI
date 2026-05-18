import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function UploadAreaChart({ data = [] }) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    uploads: d.count,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
        No uploads in the last 30 days
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Area
            type="monotone"
            dataKey="uploads"
            stroke="#a78bfa"
            strokeWidth={2}
            fill="url(#uploadGradient)"
            dot={{ r: 3, fill: "#c4b5fd", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#e9d5ff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
