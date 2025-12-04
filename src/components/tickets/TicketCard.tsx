import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import {
  StatCard,
  TicketStatusBadge,
  StatusBadge,
  ConfirmDialog,
} from "@/components/ui";
import type { Ticket, TicketStatus, Developer } from "@/types";
import { useBugs } from "@/hooks/useBugs";

interface TicketCardProps {
  ticket: Ticket;
  developer?: Developer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onStatusChange: (status: TicketStatus) => Promise<void>;
  onComplete: (actualHours?: number) => Promise<void>;
  onReopen: () => Promise<void>;
}

// Status workflow: what statuses can transition to what
const statusTransitions: Record<TicketStatus, TicketStatus[]> = {
  assigned: ["in_progress"],
  in_progress: ["review", "assigned"],
  review: ["completed", "in_progress"],
  completed: [], // Can only reopen
  reopened: ["in_progress"],
};

// Helper to format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Helper to check if ticket is overdue
function isOverdue(ticket: Ticket): boolean {
  if (ticket.status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(ticket.dueDate);
  return dueDate < today;
}

// Helper to check if ticket was completed on time
function wasOnTime(ticket: Ticket): boolean | null {
  if (ticket.status !== "completed" || !ticket.completedDate) return null;
  return new Date(ticket.completedDate) <= new Date(ticket.dueDate);
}

export function TicketCard({
  ticket,
  developer,
  open,
  onOpenChange,
  onEdit,
  onStatusChange,
  onComplete,
  onReopen,
}: TicketCardProps) {
  const navigate = useNavigate();
  const { bugs } = useBugs({ ticketId: ticket.id });
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [actualHours, setActualHours] = useState<string>(
    ticket.actualHours?.toString() || ticket.estimatedHours?.toString() || ""
  );
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const overdue = isOverdue(ticket);
  const onTime = wasOnTime(ticket);
  const availableTransitions = statusTransitions[ticket.status];
  
  // Bug stats
  const totalBugs = bugs.length;
  const unresolvedBugs = bugs.filter((b) => !b.isResolved).length;
  const developerErrorBugs = bugs.filter((b) => b.bugType === "developer_error").length;

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setIsChangingStatus(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const hours = actualHours ? parseFloat(actualHours) : undefined;
      await onComplete(hours);
      setShowCompleteDialog(false);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReopen = async () => {
    setIsReopening(true);
    try {
      await onReopen();
      setShowReopenDialog(false);
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3">
              <span className="text-2xl">🎫</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold leading-tight">{ticket.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <TicketStatusBadge status={ticket.status} />
                  {overdue && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Overdue
                    </span>
                  )}
                  {onTime === true && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ On time
                    </span>
                  )}
                  {onTime === false && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ✗ Late
                    </span>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          {ticket.description && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Developer:</span>
              <p className="font-medium">{developer?.name || "Unknown"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Complexity:</span>
              <div className="mt-1">
                <StatusBadge
                  status={ticket.complexity}
                  variant={
                    ticket.complexity === "critical"
                      ? "error"
                      : ticket.complexity === "high"
                      ? "warning"
                      : ticket.complexity === "medium"
                      ? "info"
                      : "default"
                  }
                />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Assigned:</span>
              <p className="font-medium">{formatDate(ticket.assignedDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Due Date:</span>
              <p className={`font-medium ${overdue ? "text-red-600 dark:text-red-400" : ""}`}>
                {formatDate(ticket.dueDate)}
              </p>
            </div>
            {ticket.completedDate && (
              <div>
                <span className="text-muted-foreground">Completed:</span>
                <p className="font-medium">{formatDate(ticket.completedDate)}</p>
              </div>
            )}
            {ticket.estimatedHours && (
              <div>
                <span className="text-muted-foreground">Estimated:</span>
                <p className="font-medium">{ticket.estimatedHours}h</p>
              </div>
            )}
            {ticket.actualHours && (
              <div>
                <span className="text-muted-foreground">Actual:</span>
                <p className="font-medium">{ticket.actualHours}h</p>
              </div>
            )}
            {ticket.reopenCount > 0 && (
              <div>
                <span className="text-muted-foreground">Reopened:</span>
                <p className="font-medium text-red-600 dark:text-red-400">
                  {ticket.reopenCount} time{ticket.reopenCount > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Bug Stats */}
          {totalBugs > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Linked Bugs ({totalBugs})</h3>
              <div className="grid grid-cols-3 gap-2">
                <StatCard
                  icon="🐛"
                  label="Total"
                  value={totalBugs}
                  className="p-3"
                />
                <StatCard
                  icon="⚠️"
                  label="Unresolved"
                  value={unresolvedBugs}
                  className="p-3"
                />
                <StatCard
                  icon="❌"
                  label="Dev Errors"
                  value={developerErrorBugs}
                  className="p-3"
                />
              </div>
            </div>
          )}

          {/* Status Workflow */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Change Status</h3>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  disabled={isChangingStatus}
                >
                  → {status.replace("_", " ")}
                </Button>
              ))}
              
              {ticket.status === "review" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={isChangingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Mark Complete
                </Button>
              )}
              
              {ticket.status === "completed" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowReopenDialog(true)}
                  disabled={isChangingStatus}
                >
                  ↩ Reopen
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              ✏️ Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                navigate(`/bugs?ticket=${ticket.id}`);
              }}
            >
              🐛 View Bugs
            </Button>
            {developer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/developers?highlight=${developer.id}`);
                }}
              >
                👤 View Developer
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Mark Ticket Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will mark the ticket as completed and calculate if it was delivered on time.
            </p>
            <TextField
              label="Actual Hours (optional)"
              type="number"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              placeholder={ticket.estimatedHours?.toString() || "Enter hours"}
              description="How many hours did this ticket actually take?"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCompleting ? "Completing..." : "Complete Ticket"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reopen Confirmation */}
      <ConfirmDialog
        open={showReopenDialog}
        onOpenChange={setShowReopenDialog}
        title="Reopen Ticket"
        description={`Are you sure you want to reopen "${ticket.title}"? This will increment the reopen count (currently ${ticket.reopenCount}) and affect the developer's KPI score.`}
        confirmText="Reopen"
        variant="destructive"
        onConfirm={handleReopen}
        loading={isReopening}
      />
    </>
  );
}

