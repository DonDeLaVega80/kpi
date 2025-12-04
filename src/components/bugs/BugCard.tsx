import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge, ConfirmDialog } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Bug, BugType, Ticket, Developer } from "@/types";

interface BugCardProps {
  bug: Bug;
  ticket?: Ticket;
  developer?: Developer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onResolve: () => Promise<void>;
  onReclassify: (bugType: BugType) => Promise<void>;
}

// Bug type definitions with descriptions and KPI impact
const bugTypes: {
  value: BugType;
  label: string;
  description: string;
  impact: string;
  icon: string;
  color: string;
  selectedColor: string;
  impactColor: string;
}[] = [
  {
    value: "developer_error",
    label: "Developer Error",
    description: "Coding mistake, oversight, or incorrect implementation",
    impact: "Full KPI deduction",
    icon: "❌",
    color: "border-red-500 bg-red-50 dark:bg-red-950/30",
    selectedColor: "border-red-500 bg-red-100 dark:bg-red-900/50 ring-2 ring-red-500",
    impactColor: "text-red-600 dark:text-red-400",
  },
  {
    value: "conceptual",
    label: "Conceptual / Misunderstanding",
    description: "Requirements were misunderstood or unclear",
    impact: "Minor KPI deduction",
    icon: "🤔",
    color: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
    selectedColor: "border-amber-500 bg-amber-100 dark:bg-amber-900/50 ring-2 ring-amber-500",
    impactColor: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "requirement_change",
    label: "Requirement Change",
    description: "Specification changed after implementation",
    impact: "No KPI deduction",
    icon: "📝",
    color: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    selectedColor: "border-blue-500 bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500",
    impactColor: "text-green-600 dark:text-green-400",
  },
  {
    value: "environment",
    label: "Environment Issue",
    description: "Infrastructure, deployment, or configuration problem",
    impact: "No KPI deduction",
    icon: "🖥️",
    color: "border-gray-500 bg-gray-50 dark:bg-gray-950/30",
    selectedColor: "border-gray-500 bg-gray-100 dark:bg-gray-900/50 ring-2 ring-gray-500",
    impactColor: "text-green-600 dark:text-green-400",
  },
  {
    value: "third_party",
    label: "Third-Party Issue",
    description: "External dependency, API, or library problem",
    impact: "No KPI deduction",
    icon: "🔌",
    color: "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
    selectedColor: "border-purple-500 bg-purple-100 dark:bg-purple-900/50 ring-2 ring-purple-500",
    impactColor: "text-green-600 dark:text-green-400",
  },
];

// Severity colors
const severityVariant: Record<string, "error" | "warning" | "info" | "default"> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "default",
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

export function BugCard({
  bug,
  ticket,
  developer,
  open,
  onOpenChange,
  onEdit,
  onResolve,
  onReclassify,
}: BugCardProps) {
  const navigate = useNavigate();
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showReclassifyDialog, setShowReclassifyDialog] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [selectedBugType, setSelectedBugType] = useState<BugType>(bug.bugType);

  const currentBugType = bugTypes.find((t) => t.value === bug.bugType);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve();
      setShowResolveDialog(false);
    } finally {
      setIsResolving(false);
    }
  };

  const handleReclassify = async () => {
    if (selectedBugType === bug.bugType) {
      setShowReclassifyDialog(false);
      return;
    }
    setIsReclassifying(true);
    try {
      await onReclassify(selectedBugType);
      setShowReclassifyDialog(false);
    } finally {
      setIsReclassifying(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3">
              <span className="text-2xl">🐛</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold leading-tight">{bug.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={bug.severity} variant={severityVariant[bug.severity]} />
                  {bug.isResolved ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Resolved
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      ⚠ Open
                    </span>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          {bug.description && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm whitespace-pre-wrap">{bug.description}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Ticket:</span>
              <p className="font-medium">{ticket?.title || "Unknown"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Developer:</span>
              <p className="font-medium">{developer?.name || "Unknown"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Reported:</span>
              <p className="font-medium">{formatDate(bug.createdAt)}</p>
            </div>
            {bug.resolvedDate && (
              <div>
                <span className="text-muted-foreground">Resolved:</span>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {formatDate(bug.resolvedDate)}
                </p>
              </div>
            )}
          </div>

          {/* Bug Classification */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Bug Classification</h3>
            {currentBugType && (
              <div className={cn(
                "flex items-start gap-3 p-3 rounded-lg border-2",
                currentBugType.selectedColor
              )}>
                <span className="text-2xl">{currentBugType.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{currentBugType.label}</p>
                  <p className="text-sm text-muted-foreground">{currentBugType.description}</p>
                  <p className={cn("text-sm mt-1 font-medium", currentBugType.impactColor)}>
                    {currentBugType.impact}
                  </p>
                </div>
              </div>
            )}
            {!bug.isResolved && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSelectedBugType(bug.bugType);
                  setShowReclassifyDialog(true);
                }}
              >
                🔄 Reclassify Bug Type
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {!bug.isResolved && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowResolveDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                ✓ Mark Resolved
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEdit}>
              ✏️ Edit
            </Button>
            {ticket && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/tickets?highlight=${ticket.id}`);
                }}
              >
                🎫 View Ticket
              </Button>
            )}
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

      {/* Resolve Confirmation */}
      <ConfirmDialog
        open={showResolveDialog}
        onOpenChange={setShowResolveDialog}
        title="Resolve Bug"
        description={`Are you sure you want to mark "${bug.title}" as resolved? This indicates the bug has been fixed.`}
        confirmText="Resolve"
        variant="default"
        onConfirm={handleResolve}
        loading={isResolving}
      />

      {/* Reclassify Dialog */}
      <Dialog open={showReclassifyDialog} onOpenChange={setShowReclassifyDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reclassify Bug Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the correct classification for this bug. This affects how the bug impacts the developer's KPI score.
            </p>
            
            <div className="grid gap-2">
              {bugTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedBugType(type.value)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                    selectedBugType === type.value ? type.selectedColor : type.color,
                    "hover:opacity-90"
                  )}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                    <p className={cn("text-xs mt-1 font-medium", type.impactColor)}>
                      {type.impact}
                    </p>
                  </div>
                  {selectedBugType === type.value && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowReclassifyDialog(false)}
                disabled={isReclassifying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReclassify}
                disabled={isReclassifying || selectedBugType === bug.bugType}
              >
                {isReclassifying ? "Saving..." : "Update Classification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

