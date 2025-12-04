export const DEVELOPER_ROLES = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
] as const;

export const TICKET_STATUSES = [
  { value: "assigned", label: "Assigned", color: "gray" },
  { value: "in_progress", label: "In Progress", color: "yellow" },
  { value: "review", label: "In Review", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "reopened", label: "Reopened", color: "red" },
] as const;

export const TICKET_COMPLEXITIES = [
  { value: "low", label: "Low", color: "green" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "orange" },
  { value: "critical", label: "Critical", color: "red" },
] as const;

export const BUG_SEVERITIES = [
  { value: "low", label: "Low", color: "green" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "orange" },
  { value: "critical", label: "Critical", color: "red" },
] as const;

export const BUG_TYPES = [
  {
    value: "developer_error",
    label: "Developer Error",
    description: "Bug caused by developer's code",
    impact: "High KPI impact",
  },
  {
    value: "conceptual",
    label: "Conceptual",
    description: "Misunderstanding of requirements/specs",
    impact: "Minor KPI impact",
  },
  {
    value: "requirement_change",
    label: "Requirement Change",
    description: "Requirements changed after implementation",
    impact: "No KPI impact",
  },
  {
    value: "environment",
    label: "Environment",
    description: "Environment/configuration issues",
    impact: "No KPI impact",
  },
  {
    value: "third_party",
    label: "Third Party",
    description: "External dependency issues",
    impact: "No KPI impact",
  },
] as const;

export const KPI_TRENDS = [
  { value: "improving", label: "Improving", color: "green" },
  { value: "stable", label: "Stable", color: "yellow" },
  { value: "declining", label: "Declining", color: "red" },
] as const;

export const DEFAULT_KPI_CONFIG = {
  deliveryWeight: 0.5,
  qualityWeight: 0.5,
  bugPenalties: {
    critical: 15,
    high: 10,
    medium: 5,
    low: 2,
  },
};

