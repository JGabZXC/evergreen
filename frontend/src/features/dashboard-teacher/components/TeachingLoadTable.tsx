import { useState } from "react";
import Loading from "../../../shared/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, ArrowRight, Eye, Filter } from "lucide-react";
import { type SubjectSchedule, Semester } from "../../../shared/types/index.ts";

interface TeachingLoadTableProps {
  schedules: SubjectSchedule[];
  loading: boolean;
  selectedSemester: Semester;
  onSemesterChange: (semester: Semester) => void;
  onSelectClass: (
    scheduleId: string,
    subjectName: string,
    semester: Semester
  ) => void;
}

const TeachingLoadTable = ({
  schedules,
  loading,
  selectedSemester,
  onSemesterChange,
  onSelectClass,
}: TeachingLoadTableProps) => {
  const [viewSchedule, setViewSchedule] = useState<SubjectSchedule | null>(
    null
  );

  const filteredClasses = schedules.filter(
    (s) => s.semester === selectedSemester
  );

  if (loading) return <Loading />;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title text-2xl flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              My Teaching Load
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="select select-bordered select-sm"
                value={selectedSemester}
                onChange={(e) => onSemesterChange(Number(e.target.value))}
              >
                <option value={Semester.First}>1st Semester</option>
                <option value={Semester.Second}>2nd Semester</option>
                <option value={Semester.Third}>Summer</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto min-h-[400px] max-h-[400px] overflow-y-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200 sticky top-0 z-10">
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No classes assigned yet for this semester.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((cls, index) => (
                    <motion.tr
                      key={cls._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover"
                    >
                      <td className="font-bold text-primary">
                        {typeof cls.subject === "object"
                          ? cls.subject.subjectId
                          : cls.subject}
                      </td>
                      <td>
                        {typeof cls.subject === "object"
                          ? cls.subject.description
                          : ""}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewSchedule(cls)}
                            className="btn btn-sm btn-ghost gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              onSelectClass(
                                typeof cls.subject === "object"
                                  ? cls.subject._id
                                  : "",
                                typeof cls.subject === "object"
                                  ? cls.subject.description ?? ""
                                  : "",
                                cls.semester
                              )
                            }
                            className="btn btn-sm btn-primary gap-2"
                          >
                            Grade Book
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {viewSchedule && (
          <dialog className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-box"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Schedule Details
              </h3>
              <div className="py-2">
                <p className="text-sm text-gray-500 mb-4">
                  {typeof viewSchedule.subject === "object"
                    ? viewSchedule.subject.subjectId
                    : viewSchedule.subject}{" "}
                  -{" "}
                  {typeof viewSchedule.subject === "object"
                    ? viewSchedule.subject.description ?? ""
                    : ""}
                </p>
                <div className="space-y-3">
                  {viewSchedule.schedules.map((sch, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="badge badge-primary badge-outline">
                          {sch.day}
                        </div>
                        <span className="font-medium">
                          {sch.startTime} - {sch.endTime}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {typeof sch.room === "object"
                          ? sch.room.name
                          : "Room TBA"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => setViewSchedule(null)}>
                  Close
                </button>
              </div>
            </motion.div>
            <div
              className="modal-backdrop"
              onClick={() => setViewSchedule(null)}
            ></div>
          </dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeachingLoadTable;
