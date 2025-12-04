import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatCard, StatusBadge, DeveloperRoleBadge } from "@/components/ui";
import { DeveloperKPI } from "@/components/reports";
import type { Developer } from "@/types";
import { useTickets } from "@/hooks/useTickets";
import { useBugs } from "@/hooks/useBugs";
import { cn } from "@/lib/utils";

interface DeveloperCardProps {
  developer: Developer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDeactivate: () => void;
}

export function DeveloperCard({
  developer,
  open,
  onOpenChange,
  onEdit,
  onDeactivate,
}: DeveloperCardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "kpi">("overview");
  const { tickets } = useTickets({ developerId: developer.id });
  const { bugs } = useBugs({ developerId: developer.id });

  // Calculate stats
  const totalTickets = tickets.length;
  const completedTickets = tickets.filter((t) => t.status === "completed").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress" || t.status === "review").length;
  const reopenedTickets = tickets.filter((t) => t.reopenCount > 0).length;
  
  const totalBugs = bugs.length;
  const developerErrorBugs = bugs.filter((b) => b.bugType === "developer_error").length;
  const resolvedBugs = bugs.filter((b) => b.isResolved).length;

  // Calculate completion rate
  const completionRate = totalTickets > 0 
    ? Math.round((completedTickets / totalTickets) * 100) 
    : 0;

  // Calculate on-time rate (tickets completed before due date)
  const onTimeTickets = tickets.filter((t) => {
    if (t.status !== "completed" || !t.completedDate) return false;
    return new Date(t.completedDate) <= new Date(t.dueDate);
  }).length;
  const onTimeRate = completedTickets > 0 
    ? Math.round((onTimeTickets / completedTickets) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <h2 className="text-xl font-bold">{developer.name}</h2>
              <p className="text-sm font-normal text-muted-foreground">
                {developer.email}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Developer Info */}
        <div className="flex flex-wrap items-center gap-3 border-b pb-4">
          <DeveloperRoleBadge role={developer.role} />
          {developer.team && (
            <span className="text-sm text-muted-foreground">
              Team: {developer.team}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Since: {developer.startDate}
          </span>
          <StatusBadge
            status={developer.isActive ? "Active" : "Inactive"}
            variant={developer.isActive ? "success" : "default"}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("kpi")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "kpi"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            KPI Report
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon="🎫"
                label="Total Tickets"
                value={totalTickets}
                description={`${inProgressTickets} in progress`}
                className="p-4"
              />
              <StatCard
                icon="✅"
                label="Completed"
                value={completedTickets}
                description={`${completionRate}% completion rate`}
                className="p-4"
              />
              <StatCard
                icon="⏱️"
                label="On-Time Delivery"
                value={`${onTimeRate}%`}
                description={`${onTimeTickets} of ${completedTickets} on time`}
                className="p-4"
              />
              <StatCard
                icon="🔄"
                label="Reopened"
                value={reopenedTickets}
                description="Tickets reopened"
                className="p-4"
              />
              <StatCard
                icon="🐛"
                label="Total Bugs"
                value={totalBugs}
                description={`${resolvedBugs} resolved`}
                className="p-4"
              />
              <StatCard
                icon="⚠️"
                label="Developer Errors"
                value={developerErrorBugs}
                description="Bugs attributed to developer"
                className="p-4"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={onEdit}>
                ✏️ Edit
              </Button>
              {developer.isActive && (
                <Button variant="outline" size="sm" onClick={onDeactivate}>
                  🚫 Deactivate
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/tickets?developer=${developer.id}`);
                }}
              >
                🎫 View Tickets
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/reports?developer=${developer.id}`);
                }}
              >
                📈 View Report
              </Button>
            </div>
          </>
        )}

        {activeTab === "kpi" && (
          <div className="pt-4">
            <DeveloperKPI developer={developer} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

