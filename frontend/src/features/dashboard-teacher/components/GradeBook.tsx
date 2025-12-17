import { useEffect, useState } from "react";
import { apiPrivate } from "../../../config/axiosPrivate";
import { toast } from "react-toastify";
import Loading from "../../../shared/components/Loading";
import { motion } from "framer-motion";
import { ArrowLeft, User } from "lucide-react";
import type { SubjectTaken } from "../types";

interface GradebookProps {
  scheduleId: string;
  subjectName: string;
  onBack: () => void;
}

const Gradebook = ({ scheduleId, subjectName, onBack }: GradebookProps) => {
  const [students, setStudents] = useState<SubjectTaken[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Local state for edits before saving
  const [editValues, setEditValues] = useState<{
    term: "prelim" | "midterm" | "final";
    grade: number;
  } | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await apiPrivate.get(
          `/api/subject-taken?scheduleId=${scheduleId}`
        );
        setStudents(data.subjectTakens);
      } catch (error) {
        console.error("Failed to load grade sheet", error);
        toast.error("Failed to load grade sheet");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [scheduleId]);

  const handleSaveGrade = async (subjectTakenId: string) => {
    if (!editValues) {
      setEditingId(null);
      return;
    }

    try {
      await apiPrivate.patch(`/teacher/${subjectTakenId}`, {
        subjectTakenId,
        term: editValues.term,
        grade: editValues.grade,
      });

      toast.success("Grade updated!");
      setEditingId(null);
      setEditValues(null);

      // Refresh list to see auto-calculated final grades
      const { data } = await apiPrivate.get(
        `/subject-taken?scheduleId=${scheduleId}`
      );
      setStudents(data.subjectTakens);
    } catch (error) {
      toast.error("Failed to update grade");
    }
  };

  if (loading) return <Loading />;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="card-title text-2xl">Gradebook</h2>
            <p className="text-sm text-gray-500">{subjectName}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Student</th>
                <th className="text-center">Prelim</th>
                <th className="text-center">Midterm</th>
                <th className="text-center">Final Term</th>
                <th className="text-center">Final Grade</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <motion.tr
                  key={student._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover"
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center bg-gray-200">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">Name Goes Here</div>
                        <div className="text-sm opacity-50">
                          {student.student?.studentId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {(["prelim", "midterm", "final"] as const).map((termKey) => (
                    <td key={termKey} className="text-center">
                      {editingId === `${student._id}-${termKey}` ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            autoFocus
                            className="input input-bordered input-sm w-20 text-center"
                            defaultValue={student[termKey] as number}
                            onChange={(e) =>
                              setEditValues({
                                term: termKey,
                                grade: parseFloat(e.target.value),
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleSaveGrade(student._id);
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditValues(null);
                              }
                            }}
                            onBlur={() => handleSaveGrade(student._id)}
                          />
                        </div>
                      ) : (
                        <div className="tooltip" data-tip="Click to edit">
                          <span
                            className="cursor-pointer hover:text-primary font-medium block py-2"
                            onClick={() => {
                              setEditingId(`${student._id}-${termKey}`);
                              setEditValues({
                                term: termKey,
                                grade: student[termKey] as number,
                              });
                            }}
                          >
                            {student[termKey] ?? "-"}
                          </span>
                        </div>
                      )}
                    </td>
                  ))}

                  <td className="text-center font-bold text-lg">
                    {student.finalGrade ?? "-"}
                  </td>
                  <td className="text-center">
                    {student.status && (
                      <div
                        className={`badge ${
                          student.status === "Passed"
                            ? "badge-success text-white"
                            : student.status === "Failed"
                            ? "badge-error text-white"
                            : "badge-ghost"
                        }`}
                      >
                        {student.status}
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Gradebook;
