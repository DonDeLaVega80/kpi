import { useState, useEffect, useCallback } from "react";
import type { Bug, CreateBugInput, UpdateBugInput } from "@/types";
import {
  getAllBugs,
  getBugsByTicket,
  getBugsByDeveloper,
  createBug as createBugApi,
  updateBug as updateBugApi,
  resolveBug as resolveBugApi,
} from "@/lib/tauri";

interface UseBugsOptions {
  ticketId?: string;
  developerId?: string;
}

interface UseBugsReturn {
  bugs: Bug[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createBug: (input: CreateBugInput) => Promise<Bug>;
  updateBug: (input: UpdateBugInput) => Promise<Bug>;
  resolveBug: (id: string, resolvedByDeveloperId?: string, fixTicketId?: string, fixHours?: number) => Promise<Bug>;
}

export function useBugs(options: UseBugsOptions = {}): UseBugsReturn {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ticketId, developerId } = options;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Bug[];
      if (ticketId) {
        data = await getBugsByTicket(ticketId);
      } else if (developerId) {
        data = await getBugsByDeveloper(developerId);
      } else {
        // No filter provided - get all bugs
        data = await getAllBugs();
      }
      setBugs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [ticketId, developerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createBug = useCallback(
    async (input: CreateBugInput): Promise<Bug> => {
      const bug = await createBugApi(input);
      await refresh();
      return bug;
    },
    [refresh]
  );

  const updateBug = useCallback(
    async (input: UpdateBugInput): Promise<Bug> => {
      const bug = await updateBugApi(input);
      await refresh();
      return bug;
    },
    [refresh]
  );

  const resolveBug = useCallback(
    async (id: string, resolvedByDeveloperId?: string, fixTicketId?: string, fixHours?: number): Promise<Bug> => {
      const bug = await resolveBugApi(id, resolvedByDeveloperId, fixTicketId, fixHours);
      await refresh();
      return bug;
    },
    [refresh]
  );

  return {
    bugs,
    loading,
    error,
    refresh,
    createBug,
    updateBug,
    resolveBug,
  };
}
