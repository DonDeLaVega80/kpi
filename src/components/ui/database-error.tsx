import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DatabaseErrorProps {
  error: string;
  onRetry?: () => void;
}

export function DatabaseError({ error, onRetry }: DatabaseErrorProps) {
  const navigate = useNavigate();
  const isCorrupted = error.toLowerCase().includes("corrupt") || 
                      error.toLowerCase().includes("malformed") ||
                      error.toLowerCase().includes("not a database");

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle>Database Error</CardTitle>
              <CardDescription className="mt-1">
                {isCorrupted 
                  ? "The database file appears to be corrupted"
                  : "An error occurred while accessing the database"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Error Details:</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>

          {isCorrupted && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">
                Database Corruption Detected
              </p>
              <p className="text-sm text-amber-700">
                Your database file may be corrupted. You can restore from a backup or start fresh.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {isCorrupted && (
              <>
                <Button
                  onClick={() => navigate("/settings")}
                  variant="default"
                  className="flex-1 min-w-[150px]"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Go to Settings
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  className="flex-1 min-w-[150px]"
                >
                  Restore from Backup
                </Button>
              </>
            )}
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex-1 min-w-[150px]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>

          {isCorrupted && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> If you don't have a backup, you may need to delete the corrupted database file 
                at <code className="text-xs bg-background px-1 py-0.5 rounded">~/Library/Application Support/kpi-tool/kpi.db</code> 
                and restart the application to start fresh.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

