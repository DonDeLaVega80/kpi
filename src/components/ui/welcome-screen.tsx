import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { UserPlus, Ticket, Bug, BarChart3 } from "lucide-react";

interface WelcomeScreenProps {
  onDismiss: () => void;
}

export function WelcomeScreen({ onDismiss }: WelcomeScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-4xl">
            🎯
          </div>
          <CardTitle className="text-3xl">Welcome to KPI Tool!</CardTitle>
          <CardDescription className="text-base mt-2">
            Track developer performance through tickets, bugs, and KPI metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">1. Add Developers</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Start by adding your team members with their roles and start dates.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold">2. Create Tickets</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Assign tickets to developers and track completion, on-time delivery, and reopens.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <Bug className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold">3. Report Bugs</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Classify bugs by type to fairly assess quality. Only developer errors affect KPI.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">4. View Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate monthly KPI reports with delivery, quality, and overall scores.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => { navigate("/developers"); onDismiss(); }} size="lg">
              Get Started
            </Button>
            <Button onClick={onDismiss} variant="outline" size="lg">
              Explore Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

