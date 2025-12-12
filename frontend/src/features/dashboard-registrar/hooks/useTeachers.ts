import { useState, useEffect, useCallback } from "react";
import { getAllTeachers } from "../services/teacherService";
import type { Teacher } from "../types";

export const useTeachers = (isActive = true) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        // Fetching a larger limit to get all active teachers for dropdowns
        const data = await getAllTeachers(1, 100, isActive, signal);
        setTeachers(data.teachers || []);
      } catch (err: any) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(
            err.response?.data?.error?.message || "Failed to fetch teachers"
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [isActive]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTeachers(controller.signal);
    return () => controller.abort();
  }, [fetchTeachers]);

  return { teachers, loading, error, refetch: () => fetchTeachers() };
};
