import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TicketBarData {
  name: string;
  completed: number;
  onTime: number;
  late: number;
  reopened: number;
}

interface TicketBarChartProps {
  data: TicketBarData[];
}

export function TicketBarChart({ data }: TicketBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#6b7280", fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            color: "#111827",
          }}
        />
        <Legend />
        <Bar
          dataKey="completed"
          fill="#3b82f6"
          name="Completed"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="onTime"
          fill="#10b981"
          name="On-Time"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="late"
          fill="#ef4444"
          name="Late"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="reopened"
          fill="#f59e0b"
          name="Reopened"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

