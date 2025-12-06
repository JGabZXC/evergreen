import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, RefreshCw, LayoutDashboard, Users } from "lucide-react";
import AddScheduleModal from "./AddScheduleModal";
import {
  getSchedules,
  createOrUpdateSchedule,
} from "../services/scheduleServices";
import type { ClassSchedule } from "../types";

export default function TeacherScheduling() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Helper: Get Current School Year ---
  // Returns "YYYY-YYYY" based on today's date.
  // Assumption: School Year starts in June (Month 5).
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11 (Jan is 0, June is 5)

    // If it's June or later, use current year as start (e.g., June 2025 -> 2025-2026)
    // If it's before June, use previous year as start (e.g., May 2025 -> 2024-2025)
    const startYear = month >= 5 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  };

  // --- Dynamic School Year Options ---
  // Starts from 2024 and generates options up to 5 years ahead of the current year.
  const schoolYearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 5; // Generate 5 years into the future
    const years = [];

    for (let year = startYear; year <= endYear; year++) {
      years.push(`${year}-${year + 1}`);
    }

    // Sort descending so the latest/future years are at the top
    return years.reverse();
  }, []);

  // --- Filter States ---
  // Default to the Calculated Current School Year
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [semester, setSemester] = useState(1);

  const fetchSchedules = async () => {
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
  };

  useEffect(() => {
    fetchSchedules();
  }, [schoolYear, semester]);

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

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 dark:border-white/10 gap-4">
        <div>
          <h2 className="text-lg font-bold">Class Allocator</h2>
          <p className="text-sm text-base-content/60">
            Manage section schedules for SY {schoolYear} - Sem {semester}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* School Year Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm w-full md:w-auto"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
            >
              {schoolYearOptions.map((year) => (
                <option key={year} value={year}>
                  SY {year}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm w-full md:w-auto"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              <option value={1}>1st Semester</option>
              <option value={2}>2nd Semester</option>
              <option value={3}>Summer</option>
            </select>
          </div>

          <div className="divider divider-horizontal mx-0 hidden md:flex"></div>

          <button
            className="btn btn-sm btn-ghost btn-square"
            onClick={fetchSchedules}
            disabled={loading}
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            className="btn btn-sm btn-primary gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Add Schedule
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {schedules.map((schedule) => (
            <motion.div
              layout
              key={schedule._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`card bg-base-100 shadow-sm border-l-4 transition-all ${
                schedule.teacherId !== "TBA"
                  ? "border-l-success"
                  : "border-l-warning"
              } dark:bg-white/5`}
            >
              <div className="card-body p-5">
                {/* Header: Subject & Code */}
                <div className="flex justify-between items-start mb-3">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-neutral text-xs font-mono">
                        {schedule.subjectId}
                      </span>
                      {schedule.teacherId === "TBA" && (
                        <span className="badge badge-warning badge-outline text-[10px] uppercase font-bold">
                          Unassigned
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-bold text-base line-clamp-1 text-primary"
                      title={schedule.subject?.name}
                    >
                      {schedule.subject?.name || "Unknown Subject"}
                    </h3>
                    <p className="text-xs text-base-content/60 font-medium">
                      {schedule.classroomId?.name || "Unknown Section"}
                    </p>
                  </div>
                </div>

                {/* Details: Teacher */}
                <div className="space-y-3 text-sm border-t border-base-200 pt-3 mt-1">
                  <div className="flex items-center gap-3 text-base-content/80">
                    <div className="avatar placeholder">
                      <div className="bg-neutral-focus text-neutral-content rounded-full w-6 h-6">
                        <Users size={12} />
                      </div>
                    </div>
                    <span
                      className={
                        schedule.teacherId === "TBA"
                          ? "italic opacity-60"
                          : "font-medium"
                      }
                    >
                      {schedule.teacher?.userId
                        ? `${schedule.teacher.userId.firstName} ${schedule.teacher.userId.lastName}`
                        : "To Be Announced"}
                    </span>
                  </div>

                  {/* Time Slots List */}
                  <div className="space-y-1">
                    {schedule.schedules.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-base-200/50 p-2 rounded-lg text-xs hover:bg-base-200 transition-colors"
                      >
                        <span className="font-bold min-w-[30px] text-center bg-base-300 rounded px-1">
                          {slot.day}
                        </span>
                        <div className="flex items-center gap-1 text-base-content/70">
                          <Clock size={12} />
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="flex items-center gap-1 ml-auto font-mono text-secondary font-bold">
                          <LayoutDashboard size={12} />
                          {slot.room}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && schedules.length === 0 && (
          <div className="col-span-full py-16 text-center text-base-content/50 border-2 border-dashed border-base-300 rounded-xl bg-base-100/50">
            <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="font-bold text-lg">No Schedules Found</h3>
            <p className="text-sm">
              There are no classes scheduled for SY {schoolYear} - Sem{" "}
              {semester}.
            </p>
          </div>
        )}
      </div>

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
      />
    </div>
  );
}
