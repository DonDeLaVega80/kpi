import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendDataPoint {
  month: string;
  delivery: number;
  quality: number;
  overall: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  showDelivery?: boolean;
  showQuality?: boolean;
  showOverall?: boolean;
}

export function TrendChart({
  data,
  showDelivery = true,
  showQuality = true,
  showOverall = true,
}: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#6b7280", fontSize: 12 }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#6b7280", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            color: "#111827",
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
        />
        <Legend />
        {showDelivery && (
          <Line
            type="monotone"
            dataKey="delivery"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Delivery Score"
            dot={{ r: 4 }}
          />
        )}
        {showQuality && (
          <Line
            type="monotone"
            dataKey="quality"
            stroke="#10b981"
            strokeWidth={2}
            name="Quality Score"
            dot={{ r: 4 }}
          />
        )}
        {showOverall && (
          <Line
            type="monotone"
            dataKey="overall"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Overall Score"
            dot={{ r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

