import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField } from "@/components/ui/text-field";
import { SelectField, BugSeveritySelect } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";
import type { CreateBugInput, Bug, UpdateBugInput, Ticket } from "@/types";

// Validation schema
const bugSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  ticketId: z.string().min(1, "Ticket is required"),
  severity: z.enum(["low", "medium", "high", "critical"], {
    message: "Severity is required",
  }),
  bugType: z.enum(["developer_error", "conceptual", "requirement_change", "environment", "third_party"], {
    message: "Bug type is required",
  }),
});

type BugFormData = z.infer<typeof bugSchema>;

// Bug type definitions with descriptions and KPI impact
const bugTypes = [
  {
    value: "developer_error" as const,
    label: "Developer Error",
    description: "Coding mistake, oversight, or incorrect implementation",
    impact: "Full KPI deduction",
    icon: "❌",
    color: "border-red-500 bg-red-50 dark:bg-red-950/30",
    selectedColor: "border-red-500 bg-red-100 dark:bg-red-900/50 ring-2 ring-red-500",
  },
  {
    value: "conceptual" as const,
    label: "Conceptual / Misunderstanding",
    description: "Requirements were misunderstood or unclear",
    impact: "Minor KPI deduction",
    icon: "🤔",
    color: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
    selectedColor: "border-amber-500 bg-amber-100 dark:bg-amber-900/50 ring-2 ring-amber-500",
  },
  {
    value: "requirement_change" as const,
    label: "Requirement Change",
    description: "Specification changed after implementation",
    impact: "No KPI deduction",
    icon: "📝",
    color: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    selectedColor: "border-blue-500 bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500",
  },
  {
    value: "environment" as const,
    label: "Environment Issue",
    description: "Infrastructure, deployment, or configuration problem",
    impact: "No KPI deduction",
    icon: "🖥️",
    color: "border-gray-500 bg-gray-50 dark:bg-gray-950/30",
    selectedColor: "border-gray-500 bg-gray-100 dark:bg-gray-900/50 ring-2 ring-gray-500",
  },
  {
    value: "third_party" as const,
    label: "Third-Party Issue",
    description: "External dependency, API, or library problem",
    impact: "No KPI deduction",
    icon: "🔌",
    color: "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
    selectedColor: "border-purple-500 bg-purple-100 dark:bg-purple-900/50 ring-2 ring-purple-500",
  },
];

interface BugFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBugInput | UpdateBugInput) => Promise<void>;
  bug?: Bug;
  tickets: Ticket[];
  preselectedTicketId?: string;
}

export function BugFormDialog({
  open,
  onOpenChange,
  onSubmit,
  bug,
  tickets,
  preselectedTicketId,
}: BugFormDialogProps) {
  const isEditMode = !!bug;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BugFormData>({
    resolver: zodResolver(bugSchema),
    defaultValues: bug
      ? {
          title: bug.title,
          description: bug.description || "",
          ticketId: bug.ticketId,
          severity: bug.severity,
          bugType: bug.bugType,
        }
      : {
          title: "",
          description: "",
          ticketId: preselectedTicketId || "",
          severity: undefined,
          bugType: undefined,
        },
  });

  const ticketIdValue = watch("ticketId");
  const severityValue = watch("severity");
  const bugTypeValue = watch("bugType");

  // Get developer name from selected ticket
  const selectedTicket = useMemo(() => {
    return tickets.find((t) => t.id === ticketIdValue);
  }, [tickets, ticketIdValue]);

  // Reset form when bug changes or dialog opens
  useEffect(() => {
    if (open) {
      if (bug) {
        reset({
          title: bug.title,
          description: bug.description || "",
          ticketId: bug.ticketId,
          severity: bug.severity,
          bugType: bug.bugType,
        });
      } else {
        reset({
          title: "",
          description: "",
          ticketId: preselectedTicketId || "",
          severity: undefined,
          bugType: undefined,
        });
      }
    }
  }, [bug, open, reset, preselectedTicketId]);

  const onFormSubmit = async (data: BugFormData) => {
    try {
      if (isEditMode && bug) {
        await onSubmit({
          id: bug.id,
          ...data,
          description: data.description || undefined,
        });
      } else {
        await onSubmit({
          ...data,
          description: data.description || undefined,
        });
      }
      reset();
    } catch (error) {
      console.error("Failed to save bug:", error);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  // Build ticket options
  const ticketOptions = tickets.map((ticket) => ({
    value: ticket.id,
    label: ticket.title.length > 40 ? ticket.title.slice(0, 40) + "..." : ticket.title,
  }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Bug" : "Report Bug"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the bug information below."
              : "Report a new bug and classify it appropriately."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <TextField
            label="Title"
            placeholder="Brief description of the bug"
            {...register("title")}
            error={errors.title?.message}
          />

          <TextAreaField
            label="Description"
            placeholder="Detailed description of the bug, steps to reproduce, expected vs actual behavior..."
            {...register("description")}
            error={errors.description?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Ticket"
              value={ticketIdValue}
              onChange={(value) => setValue("ticketId", value, { shouldValidate: true })}
              options={ticketOptions}
              placeholder="Select ticket"
              error={errors.ticketId?.message}
            />

            <BugSeveritySelect
              label="Severity"
              value={severityValue}
              onChange={(value) => setValue("severity", value as BugFormData["severity"], { shouldValidate: true })}
              error={errors.severity?.message}
            />
          </div>

          {/* Developer info (auto-filled from ticket) */}
          {selectedTicket && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">
                Developer: <span className="font-medium text-foreground">Auto-assigned from ticket</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The bug will be linked to the developer assigned to this ticket.
              </p>
            </div>
          )}

          {/* Bug Type Selection - Prominent with descriptions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Bug Type <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Select the type that best describes the root cause. This affects KPI calculations.
            </p>
            
            <div className="grid gap-2">
              {bugTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue("bugType", type.value, { shouldValidate: true })}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                    bugTypeValue === type.value ? type.selectedColor : type.color,
                    "hover:opacity-90"
                  )}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                    <p className={cn(
                      "text-xs mt-1 font-medium",
                      type.value === "developer_error" && "text-red-600 dark:text-red-400",
                      type.value === "conceptual" && "text-amber-600 dark:text-amber-400",
                      (type.value === "requirement_change" || type.value === "environment" || type.value === "third_party") && "text-green-600 dark:text-green-400"
                    )}>
                      {type.impact}
                    </p>
                  </div>
                  {bugTypeValue === type.value && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
            {errors.bugType && (
              <p className="text-sm text-destructive">{errors.bugType.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Report Bug"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

