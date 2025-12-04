import { useState, useEffect, useCallback } from "react";
import type { Developer, CreateDeveloperInput, UpdateDeveloperInput } from "@/types";
import {
  getAllDevelopers,
  createDeveloper as createDeveloperApi,
  updateDeveloper as updateDeveloperApi,
  deleteDeveloper as deleteDeveloperApi,
  getDeveloperById as getDeveloperByIdApi,
} from "@/lib/tauri";

interface UseDevelopersReturn {
  developers: Developer[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDeveloper: (input: CreateDeveloperInput) => Promise<Developer>;
  updateDeveloper: (input: UpdateDeveloperInput) => Promise<Developer>;
  deleteDeveloper: (id: string) => Promise<void>;
  getDeveloperById: (id: string) => Promise<Developer>;
}

export function useDevelopers(): UseDevelopersReturn {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDevelopers();
      setDevelopers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createDeveloper = useCallback(
    async (input: CreateDeveloperInput): Promise<Developer> => {
      const developer = await createDeveloperApi(input);
      await refresh();
      return developer;
    },
    [refresh]
  );

  const updateDeveloper = useCallback(
    async (input: UpdateDeveloperInput): Promise<Developer> => {
      const developer = await updateDeveloperApi(input);
      await refresh();
      return developer;
    },
    [refresh]
  );

  const deleteDeveloper = useCallback(
    async (id: string): Promise<void> => {
      await deleteDeveloperApi(id);
      await refresh();
    },
    [refresh]
  );

  const getDeveloperById = useCallback(
    async (id: string): Promise<Developer> => {
      return getDeveloperByIdApi(id);
    },
    []
  );

  return {
    developers,
    loading,
    error,
    refresh,
    createDeveloper,
    updateDeveloper,
    deleteDeveloper,
    getDeveloperById,
  };
}
