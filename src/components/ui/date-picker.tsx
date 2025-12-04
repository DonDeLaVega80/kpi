import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
  min,
  max,
}: DatePickerProps) {
  return (
    <Input
      type="date"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn("w-full", className)}
      min={min}
      max={max}
    />
  );
}

// Controlled version for react-hook-form
interface DateFieldProps extends DatePickerProps {
  error?: string;
  label?: string;
  description?: string;
}

export function DateField({
  label,
  description,
  error,
  ...props
}: DateFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
        </label>
      )}
      <DatePicker {...props} />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

