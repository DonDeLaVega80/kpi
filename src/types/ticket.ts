export type TicketStatus =
  | "assigned"
  | "in_progress"
  | "review"
  | "completed"
  | "reopened";

export type TicketComplexity = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  developerId: string;
  assignedDate: Date;
  dueDate: Date;
  completedDate?: Date;
  status: TicketStatus;
  estimatedHours?: number;
  actualHours?: number;
  complexity: TicketComplexity;
  reopenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  developerId: string;
  dueDate: string;
  complexity: TicketComplexity;
  estimatedHours?: number;
}

export interface UpdateTicketInput {
  id: string;
  title?: string;
  description?: string;
  developerId?: string;
  dueDate?: string;
  status?: TicketStatus;
  actualHours?: number;
}

