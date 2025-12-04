import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendChart } from "@/components/ui";
import { useKPI } from "@/hooks/useKPI";
import type { Developer } from "@/types";

interface DeveloperKPIProps {
  developer: Developer;
}

export function DeveloperKPI({ developer }: DeveloperKPIProps) {
  const { history, loading } = useKPI({
    developerId: developer.id,
    autoRefresh: true,
  });

  // Note: Team comparison can be added later by fetching all developers' KPIs

  // Prepare historical trend data
  const trendData = useMemo(() => {
    if (history.length === 0) return [];

    const sorted = [...history]
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .slice(-12); // Last 12 months

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

  // Calculate averages
  const avgDelivery = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((sum, k) => sum + k.deliveryScore, 0) / history.length;
  }, [history]);

  const avgQuality = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((sum, k) => sum + k.qualityScore, 0) / history.length;
  }, [history]);

  const avgOverall = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((sum, k) => sum + k.overallScore, 0) / history.length;
  }, [history]);

  // Get latest KPI
  const latestKPI = history.length > 0 
    ? history.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })[0]
    : null;

  // Calculate trend
  const trend = useMemo(() => {
    if (history.length < 2) return null;
    const sorted = [...history].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const recent = sorted.slice(-3);
    const older = sorted.slice(-6, -3);
    
    if (older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, k) => sum + k.overallScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, k) => sum + k.overallScore, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
  }, [history]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading KPI data...</p>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <span className="text-4xl">📊</span>
          <h3 className="mt-4 text-lg font-semibold">No KPI History</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate monthly reports to see performance trends
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Delivery Score
          </h3>
          <p className="mt-2 text-3xl font-bold">{avgDelivery.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latestKPI && `Latest: ${latestKPI.deliveryScore.toFixed(1)}%`}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Quality Score
          </h3>
          <p className="mt-2 text-3xl font-bold">{avgQuality.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latestKPI && `Latest: ${latestKPI.qualityScore.toFixed(1)}%`}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Overall Score
          </h3>
          <p className="mt-2 text-3xl font-bold">{avgOverall.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latestKPI && `Latest: ${latestKPI.overallScore.toFixed(1)}%`}
            {trend && (
              <span className="ml-2">
                {trend === "improving" && "📈"}
                {trend === "stable" && "➡️"}
                {trend === "declining" && "📉"}
              </span>
            )}
          </p>
        </Card>
      </div>

      {/* Historical Performance Graph */}
      {trendData.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Historical Performance</h3>
              <p className="text-sm text-muted-foreground">
                KPI scores over the last {trendData.length} months
              </p>
            </div>
            <TrendChart data={trendData} />
          </div>
        </Card>
      )}

      {/* Monthly Breakdown Table */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Monthly Breakdown</h3>
            <p className="text-sm text-muted-foreground">
              Detailed metrics for each month
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Month</th>
                  <th className="text-right p-2 font-medium">Tickets</th>
                  <th className="text-right p-2 font-medium">Bugs</th>
                  <th className="text-right p-2 font-medium">Delivery</th>
                  <th className="text-right p-2 font-medium">Quality</th>
                  <th className="text-right p-2 font-medium">Overall</th>
                  <th className="text-center p-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {history
                  .sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                  })
                  .slice(0, 12)
                  .map((kpi) => {
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
                    return (
                      <tr key={kpi.id} className="border-b">
                        <td className="p-2">
                          {months[kpi.month - 1]} {kpi.year}
                        </td>
                        <td className="text-right p-2">
                          {kpi.completedTickets}/{kpi.totalTickets}
                        </td>
                        <td className="text-right p-2">{kpi.totalBugs}</td>
                        <td className="text-right p-2 font-medium">
                          {kpi.deliveryScore.toFixed(1)}%
                        </td>
                        <td className="text-right p-2 font-medium">
                          {kpi.qualityScore.toFixed(1)}%
                        </td>
                        <td className="text-right p-2 font-bold">
                          {kpi.overallScore.toFixed(1)}%
                        </td>
                        <td className="text-center p-2">
                          {kpi.trend && (
                            <span className="text-lg">
                              {kpi.trend === "improving" && "📈"}
                              {kpi.trend === "stable" && "➡️"}
                              {kpi.trend === "declining" && "📉"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Performance Insights */}
      {latestKPI && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Latest Month Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">On-Time Rate:</span>
                <span className="font-medium">{latestKPI.onTimeRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Reopened Tickets:</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {latestKPI.reopenedTickets}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Developer Errors:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {latestKPI.developerErrorBugs}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Delivery Time:</span>
                <span className="font-medium">
                  {latestKPI.avgDeliveryTime.toFixed(1)} days
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Performance Insights
            </h3>
            <div className="space-y-2 text-sm">
              {avgOverall >= 80 && (
                <p className="text-green-600 dark:text-green-400">
                  ✓ Excellent overall performance
                </p>
              )}
              {avgOverall < 80 && avgOverall >= 60 && (
                <p className="text-amber-600 dark:text-amber-400">
                  ⚠ Good performance with room for improvement
                </p>
              )}
              {avgOverall < 60 && (
                <p className="text-red-600 dark:text-red-400">
                  ⚠ Performance below target - review needed
                </p>
              )}
              {latestKPI && latestKPI.reopenedTickets > 0 && (
                <p className="text-amber-600 dark:text-amber-400">
                  ⚠ {latestKPI.reopenedTickets} ticket(s) were reopened
                </p>
              )}
              {latestKPI && latestKPI.developerErrorBugs > 0 && (
                <p className="text-red-600 dark:text-red-400">
                  ⚠ {latestKPI.developerErrorBugs} developer error bug(s) reported
                </p>
              )}
              {trend === "improving" && (
                <p className="text-green-600 dark:text-green-400">
                  📈 Performance is improving over time
                </p>
              )}
              {trend === "declining" && (
                <p className="text-red-600 dark:text-red-400">
                  📉 Performance is declining - attention needed
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

