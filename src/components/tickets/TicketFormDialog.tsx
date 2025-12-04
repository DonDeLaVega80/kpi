import { useEffect } from "react";
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
import { DateField } from "@/components/ui/date-picker";
import { SelectField, TicketComplexitySelect } from "@/components/ui/select-field";
import type { CreateTicketInput, Ticket, UpdateTicketInput, Developer } from "@/types";

// Validation schema
const ticketSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  developerId: z.string().min(1, "Developer is required"),
  dueDate: z.string().min(1, "Due date is required"),
  complexity: z.enum(["low", "medium", "high", "critical"], {
    message: "Complexity is required",
  }),
  estimatedHours: z.number().min(0).optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => Promise<void>;
  ticket?: Ticket;
  developers: Developer[];
}

export function TicketFormDialog({
  open,
  onOpenChange,
  onSubmit,
  ticket,
  developers,
}: TicketFormDialogProps) {
  const isEditMode = !!ticket;

  // Get tomorrow's date for min date
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket
      ? {
          title: ticket.title,
          description: ticket.description || "",
          developerId: ticket.developerId,
          dueDate: ticket.dueDate,
          complexity: ticket.complexity,
          estimatedHours: ticket.estimatedHours,
        }
      : {
          title: "",
          description: "",
          developerId: "",
          dueDate: "",
          complexity: undefined,
          estimatedHours: undefined,
        },
  });

  const developerIdValue = watch("developerId");
  const complexityValue = watch("complexity");
  const dueDateValue = watch("dueDate");

  // Reset form when ticket changes
  useEffect(() => {
    if (open) {
      if (ticket) {
        reset({
          title: ticket.title,
          description: ticket.description || "",
          developerId: ticket.developerId,
          dueDate: ticket.dueDate,
          complexity: ticket.complexity,
          estimatedHours: ticket.estimatedHours,
        });
      } else {
        reset({
          title: "",
          description: "",
          developerId: "",
          dueDate: "",
          complexity: undefined,
          estimatedHours: undefined,
        });
      }
    }
  }, [ticket, open, reset]);

  const onFormSubmit = async (data: TicketFormData) => {
    try {
      if (isEditMode && ticket) {
        await onSubmit({
          id: ticket.id,
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
      console.error("Failed to save ticket:", error);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  // Build developer options
  const developerOptions = developers.map((dev) => ({
    value: dev.id,
    label: `${dev.name} (${dev.role})`,
  }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Ticket" : "Create Ticket"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the ticket information below."
              : "Create a new ticket and assign it to a developer."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <TextField
            label="Title"
            placeholder="Implement user authentication"
            {...register("title")}
            error={errors.title?.message}
          />

          <TextAreaField
            label="Description"
            placeholder="Detailed description of the task..."
            {...register("description")}
            error={errors.description?.message}
          />

          <SelectField
            label="Developer"
            value={developerIdValue}
            onChange={(value) => setValue("developerId", value, { shouldValidate: true })}
            options={developerOptions}
            placeholder="Select developer"
            error={errors.developerId?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <DateField
              label="Due Date"
              value={dueDateValue}
              onChange={(value) => setValue("dueDate", value, { shouldValidate: true })}
              error={errors.dueDate?.message}
              min={isEditMode ? undefined : today}
            />

            <TicketComplexitySelect
              label="Complexity"
              value={complexityValue}
              onChange={(value) => setValue("complexity", value as TicketFormData["complexity"], { shouldValidate: true })}
              error={errors.complexity?.message}
            />
          </div>

          <TextField
            label="Estimated Hours"
            type="number"
            placeholder="8"
            {...register("estimatedHours", { valueAsNumber: true })}
            error={errors.estimatedHours?.message}
            description="Optional estimate for planning"
          />

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
                : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

