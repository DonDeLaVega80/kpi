import { useState, useEffect, useCallback } from "react";
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketStatus } from "@/types";
import {
  getAllTickets,
  getTicketsByDeveloper,
  createTicket as createTicketApi,
  updateTicket as updateTicketApi,
  updateTicketStatus as updateTicketStatusApi,
  completeTicket as completeTicketApi,
  reopenTicket as reopenTicketApi,
} from "@/lib/tauri";

interface UseTicketsOptions {
  developerId?: string;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTicket: (input: CreateTicketInput) => Promise<Ticket>;
  updateTicket: (input: UpdateTicketInput) => Promise<Ticket>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  completeTicket: (id: string, actualHours?: number) => Promise<Ticket>;
  reopenTicket: (id: string) => Promise<Ticket>;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { developerId } = options;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = developerId
        ? await getTicketsByDeveloper(developerId)
        : await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTicket = useCallback(
    async (input: CreateTicketInput): Promise<Ticket> => {
      const ticket = await createTicketApi(input);
      await refresh();
      return ticket;
    },
    [refresh]
  );

  const updateTicket = useCallback(
    async (input: UpdateTicketInput): Promise<Ticket> => {
      const ticket = await updateTicketApi(input);
      await refresh();
      return ticket;
    },
    [refresh]
  );

  const updateTicketStatus = useCallback(
    async (id: string, status: TicketStatus): Promise<Ticket> => {
      const ticket = await updateTicketStatusApi(id, status);
      await refresh();
      return ticket;
    },
    [refresh]
  );

  const completeTicket = useCallback(
    async (id: string, actualHours?: number): Promise<Ticket> => {
      const ticket = await completeTicketApi(id, actualHours);
      await refresh();
      return ticket;
    },
    [refresh]
  );

  const reopenTicket = useCallback(
    async (id: string): Promise<Ticket> => {
      const ticket = await reopenTicketApi(id);
      await refresh();
      return ticket;
    },
    [refresh]
  );

  return {
    tickets,
    loading,
    error,
    refresh,
    createTicket,
    updateTicket,
    updateTicketStatus,
    completeTicket,
    reopenTicket,
  };
}
