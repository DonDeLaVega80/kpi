import { useState, useMemo } from "react";
import { useDevelopers } from "@/hooks/useDevelopers";
import { useKPI } from "@/hooks/useKPI";
import { generateMonthlyKPI } from "@/lib/tauri";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { MonthlyKPI } from "@/types";

// Get current month/year
const now = new Date();
const currentMonth = now.getMonth() + 1; // 1-12
const currentYear = now.getFullYear();

// Month names
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Generate year options (current year and 2 years back)
const getYearOptions = () => {
  const years = [];
  for (let i = 0; i < 3; i++) {
    years.push(currentYear - i);
  }
  return years;
};

export function Reports() {
  const { developers, loading: loadingDevs } = useDevelopers();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [allDevelopersKPI, setAllDevelopersKPI] = useState<MonthlyKPI | null>(null);

  const activeDevelopers = developers.filter((d) => d.isActive);

  // Get KPI for selected developer/month
  const { currentKPI, history, loading: loadingKPI, generateKPI } = useKPI({
    developerId: selectedDeveloperId !== "all" ? selectedDeveloperId : undefined,
    autoRefresh: false, // Don't auto-refresh, we'll generate manually
  });

  // Find KPI for selected month/year in history
  const selectedMonthKPI = useMemo(() => {
    if (selectedDeveloperId === "all") return null;
    return history.find(
      (kpi) => kpi.month === selectedMonth && kpi.year === selectedYear
    );
  }, [history, selectedMonth, selectedYear, selectedDeveloperId]);

  // Aggregate KPIs for all developers
  const aggregateKPIs = (kpis: MonthlyKPI[]): MonthlyKPI | null => {
    if (kpis.length === 0) return null;

    const aggregated: MonthlyKPI = {
      id: `aggregated-${selectedYear}-${selectedMonth}`,
      developerId: "all",
      month: selectedMonth,
      year: selectedYear,
      totalTickets: kpis.reduce((sum, k) => sum + k.totalTickets, 0),
      completedTickets: kpis.reduce((sum, k) => sum + k.completedTickets, 0),
      onTimeTickets: kpis.reduce((sum, k) => sum + k.onTimeTickets, 0),
      lateTickets: kpis.reduce((sum, k) => sum + k.lateTickets, 0),
      reopenedTickets: kpis.reduce((sum, k) => sum + k.reopenedTickets, 0),
      onTimeRate: kpis.reduce((sum, k) => sum + k.onTimeRate, 0) / kpis.length,
      avgDeliveryTime: kpis.reduce((sum, k) => sum + k.avgDeliveryTime, 0) / kpis.length,
      totalBugs: kpis.reduce((sum, k) => sum + k.totalBugs, 0),
      developerErrorBugs: kpis.reduce((sum, k) => sum + k.developerErrorBugs, 0),
      conceptualBugs: kpis.reduce((sum, k) => sum + k.conceptualBugs, 0),
      otherBugs: kpis.reduce((sum, k) => sum + k.otherBugs, 0),
      deliveryScore: kpis.reduce((sum, k) => sum + k.deliveryScore, 0) / kpis.length,
      qualityScore: kpis.reduce((sum, k) => sum + k.qualityScore, 0) / kpis.length,
      overallScore: kpis.reduce((sum, k) => sum + k.overallScore, 0) / kpis.length,
      trend: undefined, // Can't determine trend for aggregated
      generatedAt: new Date().toISOString(),
    };

    return aggregated;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      if (selectedDeveloperId === "all") {
        // Generate KPI for all active developers and aggregate
        const kpis = await Promise.all(
          activeDevelopers.map((dev) =>
            generateMonthlyKPI(dev.id, selectedMonth, selectedYear).catch(
              (err) => {
                console.error(`Failed to generate KPI for ${dev.name}:`, err);
                return null;
              }
            )
          )
        );
        const validKPIs = kpis.filter((k): k is MonthlyKPI => k !== null);
        const aggregated = aggregateKPIs(validKPIs);
        setAllDevelopersKPI(aggregated);
      } else {
        // Generate for single developer
        await generateKPI(selectedMonth, selectedYear);
      }
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine which KPI to display
  const displayKPI = useMemo(() => {
    if (selectedDeveloperId === "all") {
      return allDevelopersKPI;
    }
    return selectedMonthKPI || currentKPI;
  }, [selectedDeveloperId, allDevelopersKPI, selectedMonthKPI, currentKPI]);

  const hasData = displayKPI !== null && displayKPI !== undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View monthly KPI reports and performance trends
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Report Filters</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Month Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Developer Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Developer</label>
              <Select
                value={selectedDeveloperId}
                onValueChange={setSelectedDeveloperId}
                disabled={loadingDevs}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select developer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Developers</SelectItem>
                  {activeDevelopers.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">Action</label>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || loadingDevs || activeDevelopers.length === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
          </div>

          {generationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm text-red-600 dark:text-red-400">
                {generationError}
              </p>
            </div>
          )}

          {selectedDeveloperId === "all" && (
            <p className="text-sm text-muted-foreground">
              Generate a team-wide aggregated report for all active developers
            </p>
          )}
        </div>
      </Card>

      {/* Report Display */}
      {loadingKPI && selectedDeveloperId !== "all" ? (
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        </Card>
      ) : hasData ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedDeveloperId === "all"
                    ? "Team Overview"
                    : activeDevelopers.find((d) => d.id === selectedDeveloperId)
                        ?.name || "Developer"}{" "}
                  - {months[selectedMonth - 1]} {selectedYear}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedDeveloperId === "all"
                    ? `Aggregated data from ${activeDevelopers.length} developers`
                    : displayKPI.generatedAt
                    ? `Generated: ${new Date(displayKPI.generatedAt).toLocaleDateString()}`
                    : "Real-time preview"}
                </p>
              </div>
              {displayKPI.trend && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {displayKPI.trend === "improving" && "📈"}
                    {displayKPI.trend === "stable" && "➡️"}
                    {displayKPI.trend === "declining" && "📉"}
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {displayKPI.trend}
                  </span>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Delivery Score
                </h3>
                <p className="mt-2 text-3xl font-bold">
                  {displayKPI.deliveryScore.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {displayKPI.onTimeTickets} / {displayKPI.completedTickets}{" "}
                  on-time
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Quality Score
                </h3>
                <p className="mt-2 text-3xl font-bold">
                  {displayKPI.qualityScore.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {displayKPI.totalBugs} bugs ({displayKPI.developerErrorBugs}{" "}
                  developer errors)
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Overall Score
                </h3>
                <p className="mt-2 text-3xl font-bold">
                  {displayKPI.overallScore.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Weighted average
                </p>
              </div>
            </div>

            {/* Detailed metrics will be added in Phase 7.3 */}
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Detailed charts and breakdowns coming in Phase 7.3
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl">📈</span>
            <h3 className="mt-4 text-lg font-semibold">No Report Data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedDeveloperId === "all"
                ? "Click 'Generate Report' to create an aggregated team report for this month"
                : "Click 'Generate Report' to create a KPI report for this month"}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
