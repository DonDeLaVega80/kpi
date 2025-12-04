import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  icon,
  label,
  value,
  description,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg text-2xl",
            iconClassName || "bg-primary/10"
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

