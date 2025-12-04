import { useDevelopers } from "@/hooks/useDevelopers";
import { useTickets } from "@/hooks/useTickets";

export function Dashboard() {
  const { developers, loading: loadingDevs } = useDevelopers();
  const { tickets, loading: loadingTickets } = useTickets();

  const activeDevelopers = developers.filter((d) => d.isActive);
  const openTickets = tickets.filter((t) => t.status !== "completed");
  const completedTickets = tickets.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your team's performance
        </p>
      </div>

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
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">
            Activity feed coming in Phase 5...
          </p>
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
              • Go to <span className="font-medium">Reports</span> to view KPIs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
