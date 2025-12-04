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
  developerId: string;
  reportedBy?: string;
  title: string;
  description?: string;
  severity: BugSeverity;
  bugType: BugType;
  isResolved: boolean;
  resolvedDate?: string;
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
}
