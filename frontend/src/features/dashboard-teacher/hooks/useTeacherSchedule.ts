import { useState, useEffect, useCallback } from "react";
import { getTeacherSchedule } from "../services/scheduleService";
import type { SubjectSchedule } from "../../../shared/types/index.ts";


export const useTeacherSchedule = (schoolYearFilter: string = "All") => {
  const [schedules, setSchedules] = useState<SubjectSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const querySchoolYear =
        schoolYearFilter === "All" ? undefined : schoolYearFilter;
      const data = await getTeacherSchedule(querySchoolYear);
      setSchedules(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch schedule", err);
      setError("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  }, [schoolYearFilter]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { schedules, loading, error, refresh: fetchSchedule };
};
