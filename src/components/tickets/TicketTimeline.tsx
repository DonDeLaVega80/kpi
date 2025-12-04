import { cn } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/types";

interface TicketTimelineProps {
  ticket: Ticket;
  className?: string;
}

// Define the standard workflow stages
const workflowStages: { status: TicketStatus; label: string; icon: string }[] = [
  { status: "assigned", label: "Assigned", icon: "📋" },
  { status: "in_progress", label: "In Progress", icon: "🔧" },
  { status: "review", label: "Review", icon: "👀" },
  { status: "completed", label: "Completed", icon: "✅" },
];

// Status order for comparison
const statusOrder: Record<TicketStatus, number> = {
  assigned: 0,
  in_progress: 1,
  review: 2,
  completed: 3,
  reopened: 1, // Reopened goes back to in_progress level
};

// Helper to format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TicketTimeline({ ticket, className }: TicketTimelineProps) {
  const currentStatusIndex = statusOrder[ticket.status];
  const isReopened = ticket.status === "reopened";

  // Build timeline events
  const events: { date: string; label: string; icon: string; type: "past" | "current" | "future" }[] = [];

  // Assigned event (always happened)
  events.push({
    date: ticket.assignedDate,
    label: "Assigned",
    icon: "📋",
    type: currentStatusIndex > 0 ? "past" : ticket.status === "assigned" ? "current" : "future",
  });

  // In Progress - infer from status
  if (currentStatusIndex >= 1 || isReopened) {
    events.push({
      date: ticket.updatedAt, // Approximate
      label: isReopened ? "Reopened → In Progress" : "Started",
      icon: isReopened ? "↩️" : "🔧",
      type: currentStatusIndex > 1 ? "past" : (ticket.status === "in_progress" || isReopened) ? "current" : "future",
    });
  } else {
    events.push({
      date: "",
      label: "In Progress",
      icon: "🔧",
      type: "future",
    });
  }

  // Review
  if (currentStatusIndex >= 2) {
    events.push({
      date: ticket.updatedAt,
      label: "In Review",
      icon: "👀",
      type: currentStatusIndex > 2 ? "past" : ticket.status === "review" ? "current" : "future",
    });
  } else {
    events.push({
      date: "",
      label: "Review",
      icon: "👀",
      type: "future",
    });
  }

  // Completed
  if (ticket.completedDate) {
    events.push({
      date: ticket.completedDate,
      label: "Completed",
      icon: "✅",
      type: ticket.status === "completed" ? "current" : "past",
    });
  } else {
    events.push({
      date: "",
      label: "Complete",
      icon: "✅",
      type: "future",
    });
  }

  return (
    <div className={cn("space-y-1", className)}>
      {/* Reopen warning */}
      {ticket.reopenCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-3 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
          <span>↩️</span>
          <span>
            Reopened {ticket.reopenCount} time{ticket.reopenCount > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          
          return (
            <div key={index} className="flex gap-3 pb-4 last:pb-0">
              {/* Timeline line and dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors",
                    event.type === "current" && "bg-primary border-primary text-primary-foreground",
                    event.type === "past" && "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400",
                    event.type === "future" && "bg-muted border-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {event.icon}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[16px]",
                      event.type === "past" || event.type === "current"
                        ? "bg-green-500"
                        : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 pt-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    event.type === "current" && "text-foreground",
                    event.type === "past" && "text-muted-foreground",
                    event.type === "future" && "text-muted-foreground/50"
                  )}
                >
                  {event.label}
                </p>
                {event.date && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.date)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key dates summary */}
      <div className="border-t pt-3 mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Assigned:</span>
          <span>{formatDateTime(ticket.assignedDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Due:</span>
          <span className={cn(
            new Date(ticket.dueDate) < new Date() && ticket.status !== "completed"
              ? "text-red-600 dark:text-red-400 font-medium"
              : ""
          )}>
            {formatDateTime(ticket.dueDate)}
          </span>
        </div>
        {ticket.completedDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed:</span>
            <span className={cn(
              new Date(ticket.completedDate) <= new Date(ticket.dueDate)
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}>
              {formatDateTime(ticket.completedDate)}
              {new Date(ticket.completedDate) <= new Date(ticket.dueDate) ? " ✓" : " (late)"}
            </span>
          </div>
        )}
        {ticket.estimatedHours && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated:</span>
            <span>{ticket.estimatedHours}h</span>
          </div>
        )}
        {ticket.actualHours && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Actual:</span>
            <span className={cn(
              ticket.estimatedHours && ticket.actualHours > ticket.estimatedHours
                ? "text-amber-600 dark:text-amber-400"
                : "text-green-600 dark:text-green-400"
            )}>
              {ticket.actualHours}h
              {ticket.estimatedHours && (
                <span className="text-muted-foreground ml-1">
                  ({ticket.actualHours <= ticket.estimatedHours ? "on budget" : "over budget"})
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact horizontal timeline for list views
export function TicketTimelineCompact({ ticket, className }: TicketTimelineProps) {
  const currentStatusIndex = statusOrder[ticket.status];
  const isReopened = ticket.status === "reopened";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {workflowStages.map((stage, index) => {
        const stageIndex = statusOrder[stage.status];
        const isPast = currentStatusIndex > stageIndex;
        const isCurrent = ticket.status === stage.status || (isReopened && stage.status === "in_progress");
        const isFuture = !isPast && !isCurrent;

        return (
          <div key={stage.status} className="flex items-center">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                isCurrent && "bg-primary text-primary-foreground",
                isPast && "bg-green-500 text-white",
                isFuture && "bg-muted text-muted-foreground"
              )}
              title={stage.label}
            >
              {isPast ? "✓" : stage.icon}
            </div>
            {index < workflowStages.length - 1 && (
              <div
                className={cn(
                  "w-4 h-0.5",
                  isPast ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
      {isReopened && (
        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
          ↩️ ×{ticket.reopenCount}
        </span>
      )}
    </div>
  );
}

