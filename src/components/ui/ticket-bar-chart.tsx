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
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Legend />
        <Bar
          dataKey="completed"
          fill="hsl(var(--chart-1))"
          name="Completed"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="onTime"
          fill="hsl(var(--chart-2))"
          name="On-Time"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="late"
          fill="hsl(var(--destructive))"
          name="Late"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="reopened"
          fill="hsl(var(--chart-4))"
          name="Reopened"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

