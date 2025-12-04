export type KPITrend = "improving" | "stable" | "declining";

export interface MonthlyKPI {
  id: string;
  developerId: string;
  month: number;
  year: number;

  // Ticket Metrics
  totalTickets: number;
  completedTickets: number;
  onTimeTickets: number;
  lateTickets: number;
  reopenedTickets: number;

  // Time Metrics
  onTimeRate: number;
  avgDeliveryTime: number;

  // Bug Metrics
  totalBugs: number;
  developerErrorBugs: number;
  conceptualBugs: number;
  otherBugs: number;

  // Calculated Scores
  deliveryScore: number;
  qualityScore: number;
  overallScore: number;

  // Trend
  trend: KPITrend;

  generatedAt: Date;
}

export interface KPIConfig {
  deliveryWeight: number;
  qualityWeight: number;
  bugPenalties: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

