export function Bugs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bugs</h1>
          <p className="text-muted-foreground">
            Track and classify bugs by type
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Report Bug
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <span className="text-4xl">🐛</span>
        <h3 className="mt-4 text-lg font-semibold">Bug tracking</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bug list will be shown here (requires ticket selection)
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Full implementation coming in Phase 5
        </p>
      </div>
    </div>
  );
}

