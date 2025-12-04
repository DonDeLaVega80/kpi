import { useState, useEffect } from "react";
import { useDevelopers } from "@/hooks/useDevelopers";
import { useTickets } from "@/hooks/useTickets";
import { useBugs } from "@/hooks/useBugs";
import { getCurrentMonthKPI } from "@/lib/tauri";
import type { MonthlyKPI } from "@/types";

export function Dashboard() {
  const { developers, loading: loadingDevs } = useDevelopers();
  const { tickets, loading: loadingTickets } = useTickets();
  const { bugs, loading: loadingBugs } = useBugs();

  const [kpiScores, setKpiScores] = useState<MonthlyKPI[]>([]);
  const [loadingKPI, setLoadingKPI] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);

  const activeDevelopers = developers.filter((d) => d.isActive);
  const openTickets = tickets.filter((t) => t.status !== "completed");
  const completedTickets = tickets.filter((t) => t.status === "completed");
  const unresolvedBugs = bugs.filter((b) => !b.isResolved);

  // Fetch KPI for all active developers
  useEffect(() => {
    const fetchKPIs = async () => {
      if (activeDevelopers.length === 0) {
        setKpiScores([]);
        return;
      }

      setLoadingKPI(true);
      setKpiError(null);
      try {
        const scores = await Promise.all(
          activeDevelopers.map(async (dev) => {
            try {
              const kpi = await getCurrentMonthKPI(dev.id);
              return kpi;
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              setKpiError((prev) => (prev ? `${prev}\n${dev.name}: ${errorMsg}` : `${dev.name}: ${errorMsg}`));
              return null;
            }
          })
        );
        const validScores = scores.filter((s): s is MonthlyKPI => s !== null);
        setKpiScores(validScores);
        if (validScores.length === 0 && activeDevelopers.length > 0) {
          setKpiError("No KPI data found. Make sure you have tickets or bugs created this month.");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setKpiError(`Failed to fetch KPIs: ${errorMsg}`);
      } finally {
        setLoadingKPI(false);
      }
    };

    if (!loadingDevs && activeDevelopers.length > 0) {
      fetchKPIs();
    }
  }, [activeDevelopers.length, loadingDevs]);

  // Calculate average score
  const avgScore =
    kpiScores.length > 0
      ? kpiScores.reduce((sum, k) => sum + k.overallScore, 0) / kpiScores.length
      : null;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your team's performance
        </p>
      </div>

      {/* Error Display */}
      {kpiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">KPI Calculation Error:</p>
          <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap mt-1">{kpiError}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-2xl">
              👥
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Developers
              </p>
              <p className="text-2xl font-bold">
                {loadingDevs ? "..." : activeDevelopers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-2xl">
              🎫
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Open Tickets
              </p>
              <p className="text-2xl font-bold">
                {loadingTickets ? "..." : openTickets.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-2xl">
              ✅
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-bold">
                {loadingTickets ? "..." : completedTickets.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-2xl">
              📈
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Score
              </p>
              <p className={`text-2xl font-bold ${avgScore !== null ? getScoreColor(avgScore) : ""}`}>
                {loadingKPI || loadingDevs
                  ? "..."
                  : avgScore !== null
                  ? `${avgScore.toFixed(0)}%`
                  : "--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-2xl">
              🐛
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Unresolved Bugs
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {loadingBugs ? "..." : unresolvedBugs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-2xl">
              🚀
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Delivery Score
              </p>
              <p className={`text-2xl font-bold ${kpiScores.length > 0 ? getScoreColor(kpiScores.reduce((sum, k) => sum + k.deliveryScore, 0) / kpiScores.length) : ""}`}>
                {loadingKPI || loadingDevs
                  ? "..."
                  : kpiScores.length > 0
                  ? `${(kpiScores.reduce((sum, k) => sum + k.deliveryScore, 0) / kpiScores.length).toFixed(0)}%`
                  : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-2xl">
              ⭐
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Quality Score
              </p>
              <p className={`text-2xl font-bold ${kpiScores.length > 0 ? getScoreColor(kpiScores.reduce((sum, k) => sum + k.qualityScore, 0) / kpiScores.length) : ""}`}>
                {loadingKPI || loadingDevs
                  ? "..."
                  : kpiScores.length > 0
                  ? `${(kpiScores.reduce((sum, k) => sum + k.qualityScore, 0) / kpiScores.length).toFixed(0)}%`
                  : "--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Developer KPI Summary */}
      {kpiScores.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Team KPI Summary (Current Month)</h2>
          <div className="space-y-3">
            {kpiScores.map((kpi) => {
              const dev = developers.find((d) => d.id === kpi.developerId);
              return (
                <div
                  key={kpi.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                      👤
                    </div>
                    <div>
                      <p className="font-medium">{dev?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {kpi.completedTickets} tickets • {kpi.totalBugs} bugs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Delivery</p>
                      <p className={`font-bold ${getScoreColor(kpi.deliveryScore)}`}>
                        {kpi.deliveryScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Quality</p>
                      <p className={`font-bold ${getScoreColor(kpi.qualityScore)}`}>
                        {kpi.qualityScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Overall</p>
                      <p className={`font-bold ${getScoreColor(kpi.overallScore)}`}>
                        {kpi.overallScore.toFixed(0)}%
                      </p>
                    </div>
                    {kpi.trend && (
                      <div className="text-lg">
                        {kpi.trend === "improving" && "📈"}
                        {kpi.trend === "stable" && "➡️"}
                        {kpi.trend === "declining" && "📉"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            {completedTickets.slice(0, 3).map((ticket) => (
              <p key={ticket.id}>
                ✅ <span className="font-medium">{ticket.title}</span> completed
              </p>
            ))}
            {unresolvedBugs.slice(0, 2).map((bug) => (
              <p key={bug.id}>
                🐛 <span className="font-medium">{bug.title}</span> reported
              </p>
            ))}
            {completedTickets.length === 0 && unresolvedBugs.length === 0 && (
              <p>No recent activity</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Go to <span className="font-medium">Developers</span> to manage your team
            </p>
            <p className="text-sm text-muted-foreground">
              • Go to <span className="font-medium">Tickets</span> to assign work
            </p>
            <p className="text-sm text-muted-foreground">
              • Go to <span className="font-medium">Bugs</span> to track issues
            </p>
            <p className="text-sm text-muted-foreground">
              • Go to <span className="font-medium">Reports</span> to view detailed KPIs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
