import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface BugPieData {
  name: string;
  value: number;
  color: string;
}

interface BugPieChartProps {
  data: BugPieData[];
}

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#6b7280", // Gray
];

export function BugPieChart({ data }: BugPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data as any}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) => {
            const name = entry.name || "";
            const percent = entry.percent || 0;
            return `${name}: ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            color: "#111827",
          }}
        />
        <Legend
          formatter={(value) => {
            const item = data.find((d) => d.name === value);
            return item ? `${value} (${item.value})` : value;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

