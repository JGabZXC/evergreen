import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Plus,
  RefreshCw,
  LayoutDashboard,
  Users,
  X,
  ChevronRight,
  MapPin,
  Edit,
} from "lucide-react";
import AddScheduleModal from "./AddScheduleModal";
import { useTeacherScheduling } from "../hooks/useTeacherScheduling";
import { getSchoolYearOptions } from "../../../utils/schoolYear";
import type { SubjectSchedule } from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function SubjectScheduling() {
  const {
    schedules,
    loading,
    isModalOpen,
    setIsModalOpen,
    schoolYear,
    setSchoolYear,
    semester,
    setSemester,
    fetchSchedules,
    handleCreateSchedule,
    handleUpdateSchedule,
  } = useTeacherScheduling();

  const [selectedSchedule, setSelectedSchedule] =
    useState<SubjectSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] =
    useState<SubjectSchedule | null>(null);

  const handleEditClick = (schedule: SubjectSchedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const onSaveSchedule = async (data: any) => {
    if (editingSchedule) {
      const success = await handleUpdateSchedule(editingSchedule._id, data);
      if (success) {
        setIsModalOpen(false);
        setEditingSchedule(null);
      }
    } else {
      await handleCreateSchedule(data);
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
          <div className="form-control">
            <select
              className="select select-bordered select-sm w-full md:w-auto"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
            >
              {getSchoolYearOptions().map((year) => (
                <option key={year} value={year}>
                  SY {year}
                </option>
              ))}
            </select>
          </div>

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
            onClick={() => fetchSchedules()}
            disabled={loading}
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            className="btn btn-sm btn-primary gap-2"
            onClick={handleAddClick}
          >
            <Plus size={16} /> Add Schedule
          </button>
        </div>
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={schoolYear + semester + schedules.length}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid gap-3"
          >
            {schedules.map((schedule) => {
              const isAssigned = schedule.teacherId !== "TBA";
              const teacherEmail = schedule.teacher?.userId?.email || "";
              const initial = teacherEmail
                ? teacherEmail.charAt(0).toUpperCase()
                : "?";

              return (
                <motion.div
                  layout
                  key={schedule._id}
                  variants={itemVariants}
                  onClick={() => setSelectedSchedule(schedule)}
                  className={`group relative bg-base-100 hover:bg-base-200/50 p-4 rounded-xl border border-base-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 overflow-hidden`}
                >
                  {/* Status Indicator Strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isAssigned ? "bg-success" : "bg-warning"
                    }`}
                  />

                  {/* Icon / Avatar */}
                  <div className="avatar placeholder">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isAssigned
                          ? "bg-secondary/10 text-secondary"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {isAssigned ? initial : <Users size={18} />}
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="badge badge-sm badge-neutral font-mono">
                        {typeof schedule.subject === "object"
                          ? schedule.subject.subjectId
                          : "N/A"}
                      </span>
                      {!isAssigned && (
                        <span className="text-[10px] font-bold text-warning uppercase tracking-wider">
                          Unassigned
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base truncate">
                      {typeof schedule.subject === "object"
                        ? schedule.subject.name
                        : "Unknown Subject"}
                    </h3>
                  </div>

                  {/* Teacher Info (Hidden on small screens) */}
                  <div className="hidden md:flex flex-col items-end text-right min-w-[150px]">
                    <span className="text-[10px] uppercase text-base-content/50 font-bold tracking-wider">
                      Instructor
                    </span>
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {isAssigned ? teacherEmail : "To Be Announced"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-primary z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(schedule);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <ChevronRight className="text-base-content/30 group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              );
            })}

            {/* Empty State */}
            {schedules.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="py-16 text-center text-base-content/50 border-2 border-dashed border-base-300 rounded-xl bg-base-100/50"
              >
                <LayoutDashboard
                  size={48}
                  className="mx-auto mb-4 opacity-20"
                />
                <h3 className="font-bold text-lg">No Schedules Found</h3>
                <p className="text-sm">
                  There are no classes scheduled for SY {schoolYear} - Sem{" "}
                  {semester}.
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveSchedule}
        initialData={editingSchedule}
      />

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSchedule && (
          <ScheduleDetailModal
            schedule={selectedSchedule}
            onClose={() => setSelectedSchedule(null)}
            onEdit={() => {
              setSelectedSchedule(null);
              handleEditClick(selectedSchedule);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScheduleDetailModal({
  schedule,
  onClose,
  onEdit,
}: {
  schedule: SubjectSchedule;
  onClose: () => void;
  onEdit: () => void;
}) {
  const isAssigned = schedule.teacherId !== "TBA";
  const teacherEmail = schedule.teacher?.userId?.email || "To Be Announced";
  const teacherId = schedule.teacherId;
  return createPortal(
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-base-200 flex justify-between items-start bg-base-200/30">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-primary font-mono">
                {typeof schedule.subject === "object"
                  ? schedule.subject.subjectId
                  : "N/A"}
              </span>
              <span className="badge badge-ghost">
                {schedule.schedules.length} Sessions
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">
              {typeof schedule.subject === "object"
                ? schedule.subject.name
                : "Unknown Subject"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-ghost gap-2" onClick={onEdit}>
              <Edit size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost hover:bg-base-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Teacher Section */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-3">
              Instructor Details
            </h3>
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  isAssigned
                    ? "bg-secondary text-secondary-content"
                    : "bg-base-300 text-base-content/50"
                }`}
              >
                {isAssigned ? (
                  teacherEmail.charAt(0).toUpperCase()
                ) : (
                  <Users size={20} />
                )}
              </div>
              <div>
                <p className="font-bold text-base">
                  {isAssigned ? teacherEmail : "Unassigned"}
                </p>
                <p className="text-xs text-base-content/60">
                  {teacherId !== "TBA" ? teacherId : "TBA"}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule List */}
          <div>
            <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-3">
              Class Schedule
            </h3>
            <div className="space-y-2">
              {schedule.schedules.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 border border-base-200 rounded-lg hover:bg-base-200/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold uppercase">
                      {slot.day.substring(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-bold mb-0.5">
                      <Clock size={14} className="text-base-content/50" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      <MapPin size={12} />
                      <span className="font-mono">
                        {typeof slot.room === "object"
                          ? slot.room.name
                          : slot.room}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-200 bg-base-200/30 flex justify-end">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
