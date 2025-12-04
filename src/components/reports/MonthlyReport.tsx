import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendChart, BugPieChart, TicketBarChart } from "@/components/ui";
import type { MonthlyKPI } from "@/types";

interface MonthlyReportProps {
  kpi: MonthlyKPI;
  history?: MonthlyKPI[];
  isTeamReport?: boolean;
}

export function MonthlyReport({ kpi, history = [], isTeamReport = false }: MonthlyReportProps) {
  // Prepare ticket breakdown data for bar chart
  const ticketData = useMemo(() => {
    return [
      {
        name: isTeamReport ? "Team" : "Developer",
        completed: kpi.completedTickets,
        onTime: kpi.onTimeTickets,
        late: kpi.lateTickets,
        reopened: kpi.reopenedTickets,
      },
    ];
  }, [kpi, isTeamReport]);

  // Prepare bug breakdown data for pie chart
  const bugData = useMemo(() => {
    const data = [];
    
    if (kpi.developerErrorBugs > 0) {
      data.push({
        name: "Developer Error",
        value: kpi.developerErrorBugs,
        color: "#ef4444", // Red
      });
    }
    
    if (kpi.conceptualBugs > 0) {
      data.push({
        name: "Conceptual",
        value: kpi.conceptualBugs,
        color: "#f59e0b", // Amber
      });
    }
    
    if (kpi.otherBugs > 0) {
      data.push({
        name: "Other",
        value: kpi.otherBugs,
        color: "#6b7280", // Gray
      });
    }

    return data;
  }, [kpi]);

  // Prepare trend data for line chart (last 6 months)
  const trendData = useMemo(() => {
    if (history.length === 0) return [];

    // Sort by year/month descending, take last 6
    const sorted = [...history]
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })
      .slice(0, 6)
      .reverse(); // Reverse to show oldest to newest

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return sorted.map((kpi) => ({
      month: `${months[kpi.month - 1]} ${kpi.year}`,
      delivery: kpi.deliveryScore,
      quality: kpi.qualityScore,
      overall: kpi.overallScore,
    }));
  }, [history]);

  return (
    <div className="space-y-6">
      {/* Summary Cards - already shown in Reports page, but can be duplicated here if needed */}
      
      {/* Ticket Breakdown */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Ticket Breakdown</h3>
            <p className="text-sm text-muted-foreground">
              Ticket completion metrics for this period
            </p>
          </div>
          
          {kpi.completedTickets > 0 ? (
            <TicketBarChart data={ticketData} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>No completed tickets in this period</p>
            </div>
          )}

          {/* Ticket Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{kpi.totalTickets}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {kpi.completedTickets}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
              <p className="text-2xl font-bold">
                {kpi.onTimeRate.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Reopened</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {kpi.reopenedTickets}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bug Breakdown */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Bug Breakdown</h3>
            <p className="text-sm text-muted-foreground">
              Bugs categorized by type and their KPI impact
            </p>
          </div>

          {kpi.totalBugs > 0 ? (
            <>
              <BugPieChart data={bugData} />

              {/* Bug Stats Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Total Bugs</p>
                  <p className="text-2xl font-bold">{kpi.totalBugs}</p>
                </div>
                <div className="rounded-lg border bg-red-50 dark:bg-red-950/30 p-3">
                  <p className="text-xs text-muted-foreground">Developer Errors</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {kpi.developerErrorBugs}
                  </p>
                </div>
                <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-3">
                  <p className="text-xs text-muted-foreground">Conceptual</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {kpi.conceptualBugs}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Other</p>
                  <p className="text-2xl font-bold">{kpi.otherBugs}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>No bugs reported in this period</p>
            </div>
          )}
        </div>
      </Card>

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Performance Trend</h3>
              <p className="text-sm text-muted-foreground">
                KPI scores over the last {trendData.length} months
              </p>
            </div>
            <TrendChart data={trendData} />
          </div>
        </Card>
      )}

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Delivery Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">On-Time Tickets:</span>
              <span className="font-medium">{kpi.onTimeTickets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Late Tickets:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {kpi.lateTickets}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">On-Time Rate:</span>
              <span className="font-medium">{kpi.onTimeRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Delivery Time:</span>
              <span className="font-medium">
                {kpi.avgDeliveryTime.toFixed(1)} days
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Quality Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Bugs:</span>
              <span className="font-medium">{kpi.totalBugs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Developer Errors:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {kpi.developerErrorBugs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conceptual Bugs:</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {kpi.conceptualBugs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Other Bugs:</span>
              <span className="font-medium">{kpi.otherBugs}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

