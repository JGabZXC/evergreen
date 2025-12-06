import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getSchedules,
  createOrUpdateSchedule,
} from "../services/scheduleServices";
import type { ClassSchedule } from "../types";

export const useTeacherScheduling = () => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Helper: Get Current School Year ---
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    // If it's June (5) or later, start year is current year. Otherwise, previous year.
    const startYear = month >= 5 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  };

  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [semester, setSemester] = useState(1);

  // --- Dynamic School Year Options ---
  const schoolYearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 5;
    const years = [];

    for (let year = startYear; year <= endYear; year++) {
      years.push(`${year}-${year + 1}`);
    }
    return years.reverse();
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchedules({
        schoolYear,
        semester,
        limit: 50,
      });
      setSchedules(data.schedules);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  }, [schoolYear, semester]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSaveSchedule = async (payload: any) => {
    try {
      await createOrUpdateSchedule(payload);
      alert("Schedule saved successfully!");
      setIsModalOpen(false);
      fetchSchedules();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Failed to save schedule");
    }
  };

  return {
    schedules,
    loading,
    isModalOpen,
    setIsModalOpen,
    schoolYear,
    setSchoolYear,
    semester,
    setSemester,
    schoolYearOptions,
    fetchSchedules,
    handleSaveSchedule,
  };
};
