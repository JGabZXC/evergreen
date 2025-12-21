import { useCallback, useEffect, useState } from "react";
import { getMySchedule } from "../services/studentService";
import type { StudentScheduleResponse } from "../types";
import { toast } from "react-toastify";

export const useStudentSchedule = (schoolYear?: string, semester?: number) => {
  const [data, setData] = useState<StudentScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    // Only fetch if we have schoolYear and semester, or if we want to fetch current (which might be default in backend if params missing)
    // But backend controller checks for params. If missing, it might return empty or default.
    // Let's assume we want to fetch always, and backend handles defaults if needed, or we pass current.
    // Actually, the backend controller code:
    // if (schoolYear && typeof schoolYear === "string") filter.schoolYear = schoolYear;
    // if (semester && !isNaN(Number(semester))) filter.semester = Number(semester);
    // So if not provided, it fetches all? Or maybe current?
    // The use case in DashboardStudent was fetching for `studentData.latestEnrollment`.

    setLoading(true);
    setError(null);
    try {
      const result = await getMySchedule(schoolYear, semester);
      setData(result);
    } catch (err: any) {
      console.error("Failed to fetch schedule:", err);
      const msg =
        err.response?.data?.error?.message || "Failed to fetch schedule";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [schoolYear, semester]);

  useEffect(() => {
    if (schoolYear && semester) {
      fetchSchedule();
    } else {
      // If we don't have SY/Sem, maybe we shouldn't fetch or fetch default?
      // For now let's allow fetching without params if that's intended, but usually we need them.
      // In DashboardStudent, we wait for student profile to get latest enrollment.
      setLoading(false);
    }
  }, [fetchSchedule, schoolYear, semester]);

  return { scheduleData: data, loading, error, refetch: fetchSchedule };
};
