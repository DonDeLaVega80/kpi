import { Button } from "@/components/ui/button";

export function App() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">🎯 KPI Tool</h1>
          <p className="text-muted-foreground text-lg">
            Developer Performance Tracking
          </p>

          <div className="flex gap-4 mt-8">
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="rounded-lg border bg-card p-6 text-center">
              <h3 className="text-2xl font-semibold">👥</h3>
              <p className="mt-2 font-medium">Developers</p>
              <p className="text-sm text-muted-foreground">
                Manage your team
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <h3 className="text-2xl font-semibold">🎫</h3>
              <p className="mt-2 font-medium">Tickets</p>
              <p className="text-sm text-muted-foreground">
                Track assignments
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <h3 className="text-2xl font-semibold">📈</h3>
              <p className="mt-2 font-medium">Reports</p>
              <p className="text-sm text-muted-foreground">
                Monthly KPI stats
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
