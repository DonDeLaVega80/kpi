import { useState, useEffect, useCallback } from "react";
import type { Developer, CreateDeveloperInput, UpdateDeveloperInput } from "@/types";
import {
  getAllDevelopers,
  createDeveloper as createDeveloperApi,
  updateDeveloper as updateDeveloperApi,
  deleteDeveloper as deleteDeveloperApi,
  getDeveloperById as getDeveloperByIdApi,
} from "@/lib/tauri";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      try {
        const developer = await createDeveloperApi(input);
        await refresh();
        toast({
          title: "Developer created",
          description: `${input.name} has been added successfully.`,
          variant: "success",
        });
        return developer;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create developer";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
  );

  const updateDeveloper = useCallback(
    async (input: UpdateDeveloperInput): Promise<Developer> => {
      try {
        const developer = await updateDeveloperApi(input);
        await refresh();
        toast({
          title: "Developer updated",
          description: "Developer information has been updated successfully.",
          variant: "success",
        });
        return developer;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to update developer";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
  );

  const deleteDeveloper = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteDeveloperApi(id);
        await refresh();
        toast({
          title: "Developer deactivated",
          description: "Developer has been deactivated successfully.",
          variant: "success",
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to deactivate developer";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
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
