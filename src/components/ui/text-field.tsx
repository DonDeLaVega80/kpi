import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export function TextField({
  label,
  description,
  error,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
        </label>
      )}
      <Input {...props} aria-invalid={!!error} />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

export function TextAreaField({
  label,
  description,
  error,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
        </label>
      )}
      <Textarea {...props} aria-invalid={!!error} />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

