import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled,
  className,
  label,
  description,
  error,
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

// Pre-configured select fields for common use cases
export function DeveloperRoleSelect({
  value,
  onChange,
  ...props
}: Omit<SelectFieldProps, "options">) {
  const options: SelectOption[] = [
    { value: "junior", label: "Junior" },
    { value: "mid", label: "Mid" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
  ];
  return (
    <SelectField
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select role"
      {...props}
    />
  );
}

export function TicketStatusSelect({
  value,
  onChange,
  ...props
}: Omit<SelectFieldProps, "options">) {
  const options: SelectOption[] = [
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "completed", label: "Completed" },
    { value: "reopened", label: "Reopened" },
  ];
  return (
    <SelectField
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select status"
      {...props}
    />
  );
}

export function TicketComplexitySelect({
  value,
  onChange,
  ...props
}: Omit<SelectFieldProps, "options">) {
  const options: SelectOption[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];
  return (
    <SelectField
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select complexity"
      {...props}
    />
  );
}

export function BugSeveritySelect({
  value,
  onChange,
  ...props
}: Omit<SelectFieldProps, "options">) {
  const options: SelectOption[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];
  return (
    <SelectField
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select severity"
      {...props}
    />
  );
}

export function BugTypeSelect({
  value,
  onChange,
  ...props
}: Omit<SelectFieldProps, "options">) {
  const options: SelectOption[] = [
    { value: "developer_error", label: "Developer Error" },
    { value: "conceptual", label: "Conceptual" },
    { value: "requirement_change", label: "Requirement Change" },
    { value: "environment", label: "Environment" },
    { value: "third_party", label: "Third Party" },
  ];
  return (
    <SelectField
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select bug type"
      {...props}
    />
  );
}

