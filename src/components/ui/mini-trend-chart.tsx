import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MiniTrendDataPoint {
  month: string;
  overall: number;
}

interface MiniTrendChartProps {
  data: MiniTrendDataPoint[];
  height?: number;
}

export function MiniTrendChart({ data, height = 200 }: MiniTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#6b7280", fontSize: 10 }}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "4px 8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, "Overall Score"]}
          labelStyle={{ fontSize: "11px", marginBottom: "4px" }}
        />
        <Line
          type="monotone"
          dataKey="overall"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

