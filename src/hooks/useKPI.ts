import { useState, useEffect, useCallback } from "react";
import type { MonthlyKPI } from "@/types";
import {
  generateMonthlyKPI,
  getKPIHistory,
  getCurrentMonthKPI,
} from "@/lib/tauri";

interface UseKPIOptions {
  developerId?: string;
  autoRefresh?: boolean;
}

interface UseKPIReturn {
  // Current month KPI (real-time preview)
  currentKPI: MonthlyKPI | null;
  // Historical KPI records
  history: MonthlyKPI[];
  // Loading states
  loading: boolean;
  historyLoading: boolean;
  // Error state
  error: string | null;
  // Actions
  refreshCurrent: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  generateKPI: (month: number, year: number) => Promise<MonthlyKPI>;
}

export function useKPI(options: UseKPIOptions = {}): UseKPIReturn {
  const { developerId, autoRefresh = true } = options;

  const [currentKPI, setCurrentKPI] = useState<MonthlyKPI | null>(null);
  const [history, setHistory] = useState<MonthlyKPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current month KPI (real-time preview)
  const refreshCurrent = useCallback(async () => {
    if (!developerId) {
      setCurrentKPI(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const kpi = await getCurrentMonthKPI(developerId);
      setCurrentKPI(kpi);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setCurrentKPI(null);
    } finally {
      setLoading(false);
    }
  }, [developerId]);

  // Fetch KPI history
  const refreshHistory = useCallback(async () => {
    if (!developerId) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const data = await getKPIHistory(developerId);
      setHistory(data);
    } catch (err) {
      // Don't set error for history - it's secondary
      console.error("Failed to fetch KPI history:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [developerId]);

  // Generate KPI for a specific month (stores in DB)
  const generateKPI = useCallback(
    async (month: number, year: number): Promise<MonthlyKPI> => {
      if (!developerId) {
        throw new Error("Developer ID is required");
      }

      const kpi = await generateMonthlyKPI(developerId, month, year);
      
      // Refresh history after generating
      await refreshHistory();
      
      return kpi;
    },
    [developerId, refreshHistory]
  );

  // Auto-fetch on mount and when developerId changes
  useEffect(() => {
    if (autoRefresh && developerId) {
      refreshCurrent();
      refreshHistory();
    }
  }, [developerId, autoRefresh, refreshCurrent, refreshHistory]);

  return {
    currentKPI,
    history,
    loading,
    historyLoading,
    error,
    refreshCurrent,
    refreshHistory,
    generateKPI,
  };
}
