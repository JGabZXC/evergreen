import { useState } from "react";
import { motion } from "framer-motion";
import { Award, X, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-toastify";
import type { CurriculumItem } from "../../../shared/types";
import type { StudentAggregate } from "../types";

export interface CreditItem {
  subjectId: string;
  finalGrade: number;
}

interface CreditSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentAggregate;
  allSubjects: CurriculumItem[];
  previousSchool: string;
  onSave: (selectedCredits: CreditItem[]) => void;
}

export default function CreditSubjectsModal({
  isOpen,
  onClose,
  student,
  allSubjects,
  previousSchool,
  onSave,
}: CreditSubjectsModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>({});

  const groupedSubjects = allSubjects.map((item) => {
    const semesterLabel = `Sem ${item.semester}`;
    const title = `${item.gradeLevel} - ${semesterLabel}`;
    return {
      title,
      subjects: item.subject,
    };
  });

  const toggleCreditSubject = (subjectId: string) => {
    if (selectedIds.includes(subjectId)) {
      setSelectedIds(selectedIds.filter((id) => id !== subjectId));
      const newGrades = { ...grades };
      delete newGrades[subjectId];
      setGrades(newGrades);
    } else {
      setSelectedIds([...selectedIds, subjectId]);
      setGrades({ ...grades, [subjectId]: "1.0" });
    }
  };

  const handleGradeChange = (subjectId: string, value: string) => {
    setGrades((prev) => ({ ...prev, [subjectId]: value }));
  };

  const handleSave = () => {
    if (selectedIds.length === 0) {
      toast.error("No subjects selected.");
      return;
    }

    const payload: CreditItem[] = [];
    for (const id of selectedIds) {
      const gradeVal = parseFloat(grades[id]);
      if (isNaN(gradeVal) || gradeVal < 1.0 || gradeVal > 5.0) {
        toast.error(`Invalid grade entered. Please use 1.0 to 5.0.`);
        return;
      }
      payload.push({ subjectId: id, finalGrade: gradeVal });
    }

    onSave(payload);
    setSelectedIds([]); // Reset after save
    setGrades({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-base-100 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
      >
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h3 className="font-bold text-lg flex gap-2 items-center">
            <Award className="text-warning" /> Credit Subjects
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-base-100">
          {/* Validation Warning inside Modal */}
          {!previousSchool && (
            <div className="alert alert-error text-xs mb-4 shadow-sm">
              <AlertCircle size={16} />
              <span>
                Please enter the Previous School name in the main form before
                saving.
              </span>
            </div>
          )}

          <p className="text-sm opacity-70 mb-4">
            Select subjects from the curriculum that{" "}
            <span className="font-bold">
              {student?.profile
                ? `${student.profile.firstName} ${student.profile.lastName}`
                : `${student?.studentId}`}
            </span>{" "}
            has already passed.
          </p>

          {groupedSubjects.length === 0 ? (
            <div className="text-center p-8 text-base-content/50">
              <p>No subjects found for this student's course curriculum.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedSubjects.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h4 className="font-bold text-sm text-base-content/70 border-b border-base-200 pb-1 sticky top-0 bg-base-100 z-10">
                    {group.title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.subjects.map((sub) => (
                      <div
                        key={sub._id}
                        className={`p-3 rounded-lg border transition-all flex flex-col gap-2 group ${
                          selectedIds.includes(sub._id)
                            ? "border-warning bg-warning/5"
                            : "border-base-200 hover:border-warning/50 hover:bg-base-200/50"
                        }`}
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleCreditSubject(sub._id)}
                        >
                          <div className="overflow-hidden">
                            <div className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                              {sub.subjectId}
                            </div>
                            <div
                              className="text-xs opacity-70 truncate max-w-[200px]"
                              title={sub.description}
                            >
                              {sub.description || "No description"}
                            </div>
                          </div>
                          {selectedIds.includes(sub._id) && (
                            <CheckCircle2
                              size={18}
                              className="text-warning shrink-0"
                            />
                          )}
                        </div>

                        {selectedIds.includes(sub._id) && (
                          <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-top-1">
                            <label className="text-xs font-bold whitespace-nowrap opacity-70">
                              Final Grade:
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="1.0"
                              max="5.0"
                              placeholder="1.0"
                              className="input input-xs input-bordered w-20 bg-base-100"
                              value={grades[sub._id] || ""}
                              onChange={(e) =>
                                handleGradeChange(sub._id, e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-base-200 flex justify-between items-center bg-base-200/30">
          <span className="text-sm font-bold text-base-content/70">
            {selectedIds.length} subjects selected
          </span>
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm gap-2"
            disabled={!previousSchool || selectedIds.length === 0}
          >
            <Save size={16} /> Save Credits
          </button>
        </div>
      </motion.div>
    </div>
  );
}
