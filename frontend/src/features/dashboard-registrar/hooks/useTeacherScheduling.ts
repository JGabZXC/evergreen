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
