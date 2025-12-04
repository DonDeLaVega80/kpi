export type BugSeverity = "low" | "medium" | "high" | "critical";

export type BugType =
  | "developer_error"
  | "conceptual"
  | "requirement_change"
  | "environment"
  | "third_party";

export interface Bug {
  id: string;
  ticketId: string;
  /** The developer who introduced the bug (KPI impact applies to this developer) */
  developerId: string;
  reportedBy?: string;
  title: string;
  description?: string;
  severity: BugSeverity;
  bugType: BugType;
  isResolved: boolean;
  resolvedDate?: string;
  /** The developer who resolved/fixed the bug (can be different from developerId) */
  resolvedByDeveloperId?: string;
  /** The ticket created to fix this bug (optional) */
  fixTicketId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBugInput {
  ticketId: string;
  title: string;
  description?: string;
  severity: BugSeverity;
  bugType: BugType;
  reportedBy?: string;
}

export interface UpdateBugInput {
  id: string;
  title?: string;
  description?: string;
  severity?: BugSeverity;
  bugType?: BugType;
  isResolved?: boolean;
  /** The developer who resolved the bug */
  resolvedByDeveloperId?: string;
  /** The ticket created to fix this bug */
  fixTicketId?: string;
}
