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
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          domain={[0, 100]}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
        />
        <Legend />
        {showDelivery && (
          <Line
            type="monotone"
            dataKey="delivery"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            name="Delivery Score"
            dot={{ r: 4 }}
          />
        )}
        {showQuality && (
          <Line
            type="monotone"
            dataKey="quality"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name="Quality Score"
            dot={{ r: 4 }}
          />
        )}
        {showOverall && (
          <Line
            type="monotone"
            dataKey="overall"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            name="Overall Score"
            dot={{ r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

