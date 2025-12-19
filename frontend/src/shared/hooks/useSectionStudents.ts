import { useState, useEffect, useCallback } from "react";
import { getSectionStudents } from "../services/sectionService";

export interface Student {
  _id: string;
  studentId: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export const useSectionStudents = (sectionId?: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(
    async (signal?: AbortSignal) => {
      if (!sectionId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getSectionStudents(sectionId);
        setStudents(data);
      } catch (err: any) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(
            err.response?.data?.error?.message || "Failed to fetch students"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [sectionId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchStudents(controller.signal);
    return () => controller.abort();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  };
};
