import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, RefreshCw, LayoutDashboard, Users } from "lucide-react";
import AddScheduleModal from "./AddScheduleModal";
import { useTeacherScheduling } from "../hooks/useTeacherScheduling";
import { getSchoolYearOptions } from "../../../utils/schoolYear";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function TeacherScheduling() {
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
    handleSaveSchedule,
  } = useTeacherScheduling();

  console.log(schedules);
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
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
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
                  className={`card bg-base-100 shadow-sm border-l-4 transition-shadow group ${
                    isAssigned ? "border-l-success" : "border-l-warning"
                  } dark:bg-white/5`}
                >
                  <div className="card-body p-5">
                    {/* Header: Subject & Code */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="badge badge-neutral text-xs font-mono">
                            {typeof schedule.subject === "object"
                              ? schedule.subject.subjectId
                              : "N/A"}
                          </span>
                          {!isAssigned && (
                            <span className="badge badge-warning badge-outline text-[10px] uppercase font-bold">
                              Unassigned
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-bold text-base line-clamp-1 text-primary"
                          title={
                            typeof schedule.subject === "object"
                              ? schedule.subject.name
                              : schedule.subject
                          }
                        >
                          {typeof schedule.subject === "object"
                            ? schedule.subject.name
                            : "Unknown Subject"}
                        </h3>
                        <p className="text-xs text-base-content/60 font-medium">
                          {typeof schedule.classroomId === "object"
                            ? schedule.classroomId.name
                            : "Unknown Section"}
                        </p>
                      </div>
                    </div>

                    {/* Details: Teacher */}
                    <div className="space-y-3 text-sm border-t border-base-200 pt-3 mt-1">
                      <div className="flex items-center gap-3 text-base-content/80">
                        <div className="avatar placeholder">
                          <div
                            className={`rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors ${
                              isAssigned
                                ? "bg-secondary text-secondary-content"
                                : "bg-base-300 text-base-content/50"
                            }`}
                          >
                            {isAssigned ? initial : <Users size={14} />}
                          </div>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-base-content/50 uppercase font-bold tracking-wide">
                            Instructor
                          </span>
                          <span
                            className={`truncate ${
                              !isAssigned ? "italic opacity-60" : "font-medium"
                            }`}
                            title={teacherEmail}
                          >
                            {isAssigned ? teacherEmail : "To Be Announced"}
                          </span>
                        </div>
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
              );
            })}

            {/* Empty State - Now persistent during refresh to prevent flickering */}
            {schedules.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="col-span-full py-16 text-center text-base-content/50 border-2 border-dashed border-base-300 rounded-xl bg-base-100/50"
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
        onSave={handleSaveSchedule}
      />
    </div>
  );
}
