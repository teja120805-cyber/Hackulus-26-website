import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DensityChartProps {
  trend: number[];
  capacityThreshold: number;
}

export function DensityChart({ trend, capacityThreshold }: DensityChartProps) {
  const data = trend.map((value, i) => ({ index: i, value: Math.round(value) }));

  return (
    <div className="h-64 w-full rounded-xl border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="densityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b5773a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#b5773a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e1d8" vertical={false} />
          <XAxis dataKey="index" hide />
          <YAxis width={32} tick={{ fontSize: 11, fill: "#6b7268" }} domain={[0, "dataMax + 10"]} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: "#e4e1d8", fontSize: 12 }}
            labelFormatter={() => ""}
            formatter={(value) => [`${value}`, "Density"]}
          />
          <ReferenceLine
            y={capacityThreshold}
            stroke="#c94a34"
            strokeDasharray="4 4"
            label={{ value: "Threshold", position: "insideTopRight", fontSize: 11, fill: "#c94a34" }}
          />
          <Area type="monotone" dataKey="value" stroke="#b5773a" strokeWidth={2} fill="url(#densityFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
