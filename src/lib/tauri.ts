import { invoke } from "@tauri-apps/api/core";
import type {
  Developer,
  CreateDeveloperInput,
  UpdateDeveloperInput,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  Bug,
  CreateBugInput,
  UpdateBugInput,
  MonthlyKPI,
} from "@/types";

// Developer commands
export async function createDeveloper(
  data: CreateDeveloperInput
): Promise<Developer> {
  return invoke("create_developer", { input: data });
}

export async function getAllDevelopers(): Promise<Developer[]> {
  return invoke("get_all_developers");
}

export async function getDeveloperById(id: string): Promise<Developer> {
  return invoke("get_developer_by_id", { id });
}

export async function updateDeveloper(
  data: UpdateDeveloperInput
): Promise<Developer> {
  return invoke("update_developer", { input: data });
}

export async function deleteDeveloper(id: string): Promise<void> {
  return invoke("delete_developer", { id });
}

// Ticket commands
export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  return invoke("create_ticket", { input: data });
}

export async function getAllTickets(): Promise<Ticket[]> {
  return invoke("get_all_tickets");
}

export async function getTicketsByDeveloper(
  developerId: string
): Promise<Ticket[]> {
  return invoke("get_tickets_by_developer", { developerId });
}

export async function updateTicket(data: UpdateTicketInput): Promise<Ticket> {
  return invoke("update_ticket", { input: data });
}

export async function updateTicketStatus(
  id: string,
  status: string
): Promise<Ticket> {
  return invoke("update_ticket_status", { id, status });
}

export async function completeTicket(
  id: string,
  actualHours?: number
): Promise<Ticket> {
  return invoke("complete_ticket", { id, actualHours });
}

export async function reopenTicket(id: string): Promise<Ticket> {
  return invoke("reopen_ticket", { id });
}

// Bug commands
export async function createBug(data: CreateBugInput): Promise<Bug> {
  return invoke("create_bug", { input: data });
}

export async function getBugsByTicket(ticketId: string): Promise<Bug[]> {
  return invoke("get_bugs_by_ticket", { ticketId });
}

export async function getBugsByDeveloper(developerId: string): Promise<Bug[]> {
  return invoke("get_bugs_by_developer", { developerId });
}

export async function updateBug(data: UpdateBugInput): Promise<Bug> {
  return invoke("update_bug", { input: data });
}

export async function resolveBug(id: string): Promise<Bug> {
  return invoke("resolve_bug", { id });
}

// KPI commands
export async function generateMonthlyKPI(
  developerId: string,
  month: number,
  year: number
): Promise<MonthlyKPI> {
  return invoke("generate_monthly_kpi", { developerId, month, year });
}

export async function getKPIHistory(developerId: string): Promise<MonthlyKPI[]> {
  return invoke("get_kpi_history", { developerId });
}

export async function getCurrentMonthKPI(
  developerId: string
): Promise<MonthlyKPI> {
  return invoke("get_current_month_kpi", { developerId });
}
