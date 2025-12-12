import { useState, useEffect, useCallback } from "react";
import {
  getSchedules,
  createOrUpdateSchedule,
} from "../services/scheduleServices";
import type { ClassSchedule } from "../types";
import { toast } from "react-toastify";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";

export const useTeacherScheduling = () => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [semester, setSemester] = useState(1);

  const fetchSchedules = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const data = await getSchedules(
          {
            schoolYear,
            semester,
            limit: 50,
          },
          signal
        );
        setSchedules(data.schedules);
      } catch (error: any) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error("Failed to fetch schedules:", error);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [schoolYear, semester]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSchedules(controller.signal);
    return () => controller.abort();
  }, [fetchSchedules]);

  const handleSaveSchedule = async (payload: any) => {
    try {
      await createOrUpdateSchedule(payload);
      toast.success("Schedule saved successfully");
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
    fetchSchedules,
    handleSaveSchedule,
  };
};
