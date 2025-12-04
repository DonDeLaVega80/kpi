export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View monthly KPI reports and performance trends
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <span className="text-4xl">📈</span>
        <h3 className="mt-4 text-lg font-semibold">KPI Reports</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance reports will be generated here
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Full implementation coming in Phase 6
        </p>
      </div>

      {/* Preview of what's coming */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Delivery Score
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on on-time completion
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Quality Score
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on bug rate
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Overall Score
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Weighted average
          </p>
        </div>
      </div>
    </div>
  );
}
