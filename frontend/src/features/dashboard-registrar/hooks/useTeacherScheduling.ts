import { useState, useEffect, useCallback } from "react";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
} from "../services/scheduleServices";
import type { SubjectSchedule } from "../types";
import { toast } from "react-toastify";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";

export const useTeacherScheduling = () => {
  const [schedules, setSchedules] = useState<SubjectSchedule[]>([]);
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

  const handleCreateSchedule = async (payload: any) => {
    try {
      await createSchedule(payload);
      toast.success("Schedule created successfully");
      setIsModalOpen(false);
      fetchSchedules();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to create schedule"
      );
    }
  };

  const handleUpdateSchedule = async (id: string, payload: any) => {
    try {
      await updateSchedule(id, payload);
      toast.success("Schedule updated successfully");
      fetchSchedules();
      return true;
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to update schedule"
      );
      return false;
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
    handleSaveSchedule: handleCreateSchedule, // Alias for backward compatibility if needed
    handleCreateSchedule,
    handleUpdateSchedule,
  };
};
