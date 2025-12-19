import { useState, useEffect, useCallback } from "react";
import { getTeacherSchedule } from "../services/scheduleService";
import type { SubjectSchedule } from "../../../shared/types/index.ts";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";

export const useTeacherSchedule = () => {
  const [schedules, setSchedules] = useState<SubjectSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTeacherSchedule(getCurrentSchoolYear());
      setSchedules(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch schedule", err);
      setError("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { schedules, loading, error, refresh: fetchSchedule };
};
