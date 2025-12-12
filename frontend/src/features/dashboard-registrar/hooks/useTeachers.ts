import { useState, useEffect, useCallback } from "react";
import { getAllTeachers } from "../services/teacherService";
import type { Teacher } from "../types";

export const useTeachers = (isActive = true) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      // Fetching a larger limit to get all active teachers for dropdowns
      const data = await getAllTeachers(1, 100, isActive, controller.signal);
      setTeachers(data.teachers || []);
    } catch (err: any) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(
          err.response?.data?.error?.message || "Failed to fetch teachers"
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [isActive]);

  useEffect(() => {
    const abortFn = fetchTeachers();
    return () => {
      abortFn.then((abort) => abort && abort());
    };
  }, [fetchTeachers]);

  return { teachers, loading, error, refetch: fetchTeachers };
};
