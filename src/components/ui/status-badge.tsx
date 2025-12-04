import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  secondary: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

// Auto-detect variant based on common status strings
function getVariantFromStatus(status: string): StatusVariant {
  const lower = status.toLowerCase();
  
  if (["completed", "resolved", "active", "success", "done"].includes(lower)) {
    return "success";
  }
  if (["in_progress", "in progress", "review", "pending"].includes(lower)) {
    return "warning";
  }
  if (["reopened", "error", "failed", "critical", "high", "inactive"].includes(lower)) {
    return "error";
  }
  if (["assigned", "new", "open", "low", "medium"].includes(lower)) {
    return "info";
  }
  
  return "default";
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || getVariantFromStatus(status);
  const displayText = status.replace(/_/g, " ");

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 font-medium capitalize",
        variantStyles[resolvedVariant],
        className
      )}
    >
      {displayText}
    </Badge>
  );
}

// Specific badge components for common use cases
export function TicketStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, StatusVariant> = {
    assigned: "default",
    in_progress: "info",
    review: "warning",
    completed: "success",
    reopened: "error",
  };
  return <StatusBadge status={status} variant={variantMap[status]} />;
}

export function BugSeverityBadge({ severity }: { severity: string }) {
  const variantMap: Record<string, StatusVariant> = {
    low: "default",
    medium: "warning",
    high: "error",
    critical: "error",
  };
  return <StatusBadge status={severity} variant={variantMap[severity]} />;
}

export function DeveloperRoleBadge({ role }: { role: string }) {
  const variantMap: Record<string, StatusVariant> = {
    junior: "default",
    mid: "info",
    senior: "secondary",
    lead: "success",
  };
  return <StatusBadge status={role} variant={variantMap[role]} />;
}

