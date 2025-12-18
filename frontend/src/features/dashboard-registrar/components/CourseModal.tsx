import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Search } from "lucide-react";
import { useSubjects } from "../hooks/useSubjects";
import { type CreateCoursePayload } from "../types";
import { GradeLevel, Semester, type Course } from "../../../shared/types";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCoursePayload) => Promise<boolean>;
  initialData?: Course | null;
  isLoading: boolean;
}

// Helper type for the form state, matching the payload structure
type CurriculumFormItem = CreateCoursePayload["curriculum"][number];

export default function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CourseModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [gradeAvailable, setGradeAvailable] = useState<"shs" | "college">(
    "shs"
  );
  const [curriculum, setCurriculum] = useState<CurriculumFormItem[]>([]);

  // Subject Selection State
  const [subjectSearch, setSubjectSearch] = useState("");
  const [debouncedSubjectSearch, setDebouncedSubjectSearch] = useState("");

  // Use existing hook for subjects
  const { subjects } = useSubjects(1, 20, debouncedSubjectSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSubjectSearch(subjectSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [subjectSearch]);

  // Handle modal open/close via ref
  useEffect(() => {
    if (!modalRef.current) return;
    if (isOpen) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [isOpen]);

  // Populate form when initialData changes (Edit Mode)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setGradeAvailable(initialData.gradeAvailable);

      // Map populated curriculum to form structure (extract subject IDs)
      const mappedCurriculum = initialData.curriculum.map((item) => ({
        semester: item.semester,
        gradeLevel: item.gradeLevel,
        subject: item.subject.map((s) => s._id),
      }));
      setCurriculum(mappedCurriculum);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setName("");
    setCode("");
    setGradeAvailable("shs");
    setCurriculum([]);
    setSubjectSearch("");
  };

  const handleAddCurriculumItem = () => {
    setCurriculum([
      ...curriculum,
      {
        semester: Semester.First,
        gradeLevel:
          gradeAvailable === "shs" ? GradeLevel.Grade11 : GradeLevel.College1,
        subject: [],
      },
    ]);
  };

  const handleRemoveCurriculumItem = (index: number) => {
    const newCurriculum = [...curriculum];
    newCurriculum.splice(index, 1);
    setCurriculum(newCurriculum);
  };

  const updateCurriculumItem = (
    index: number,
    field: keyof CurriculumFormItem,
    value: any
  ) => {
    const newCurriculum = [...curriculum];
    // @ts-ignore - dynamic assignment
    newCurriculum[index] = { ...newCurriculum[index], [field]: value };
    setCurriculum(newCurriculum);
  };

  const toggleSubjectInCurriculum = (
    curriculumIndex: number,
    subjectId: string
  ) => {
    const newCurriculum = [...curriculum];
    const currentSubjects = newCurriculum[curriculumIndex].subject;

    if (currentSubjects.includes(subjectId)) {
      newCurriculum[curriculumIndex].subject = currentSubjects.filter(
        (id) => id !== subjectId
      );
    } else {
      newCurriculum[curriculumIndex].subject = [...currentSubjects, subjectId];
    }
    setCurriculum(newCurriculum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit({
      name,
      code,
      gradeAvailable,
      curriculum,
    });

    if (success) {
      resetForm();
      onClose();
    }
  };

  // Use DaisyUI modal class structure
  return (
    <dialog ref={modalRef} className="modal" onCancel={onClose}>
      <div className="modal-box w-11/12 max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-base-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg">
            {initialData ? "Edit Course" : "Add New Course"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="course-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Course Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Science in Computer Science"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Course Code</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. BSCS"
                  className="input input-bordered w-full"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={!!initialData} // Disable code editing if updating (usually PK or unique)
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Grade Level</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={gradeAvailable}
                  onChange={(e) => {
                    setGradeAvailable(e.target.value as "shs" | "college");
                    setCurriculum([]); // Reset curriculum on level change
                  }}
                >
                  <option value="shs">Senior High School</option>
                  <option value="college">College</option>
                </select>
              </div>
            </div>

            <div className="divider">Curriculum Setup</div>

            {/* Curriculum Builder */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm opacity-70">
                  Curriculum Items
                </h4>
                <button
                  type="button"
                  onClick={handleAddCurriculumItem}
                  className="btn btn-sm btn-outline btn-primary gap-2"
                >
                  <Plus size={16} /> Add Semester
                </button>
              </div>

              {curriculum.length === 0 && (
                <div className="text-center py-8 bg-base-200/50 rounded-lg border border-dashed border-base-300">
                  <p className="text-sm opacity-50">
                    No curriculum items added yet.
                  </p>
                </div>
              )}

              {curriculum.map((item, idx) => (
                <div
                  key={idx}
                  className="card bg-base-200 border border-base-300"
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <select
                          className="select select-bordered select-sm w-full"
                          value={item.gradeLevel}
                          onChange={(e) =>
                            updateCurriculumItem(
                              idx,
                              "gradeLevel",
                              e.target.value
                            )
                          }
                        >
                          {gradeAvailable === "shs" ? (
                            <>
                              <option value={GradeLevel.Grade11}>
                                Grade 11
                              </option>
                              <option value={GradeLevel.Grade12}>
                                Grade 12
                              </option>
                            </>
                          ) : (
                            <>
                              <option value={GradeLevel.College1}>
                                1st Year
                              </option>
                              <option value={GradeLevel.College2}>
                                2nd Year
                              </option>
                              <option value={GradeLevel.College3}>
                                3rd Year
                              </option>
                              <option value={GradeLevel.College4}>
                                4th Year
                              </option>
                            </>
                          )}
                        </select>

                        <select
                          className="select select-bordered select-sm w-full"
                          value={item.semester}
                          onChange={(e) =>
                            updateCurriculumItem(
                              idx,
                              "semester",
                              Number(e.target.value)
                            )
                          }
                        >
                          <option value={Semester.First}>1st Semester</option>
                          <option value={Semester.Second}>2nd Semester</option>
                          <option value={Semester.Third}>Summer</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCurriculumItem(idx)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Subject Selector for this Item */}
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text-alt">
                          Subjects ({item.subject.length} selected)
                        </span>
                      </label>

                      {/* Mini Search for Subjects */}
                      <div className="dropdown w-full">
                        <div className="input input-sm input-bordered flex items-center gap-2 mb-2">
                          <Search size={14} className="opacity-50" />
                          <input
                            type="text"
                            placeholder="Search subjects to add..."
                            className="grow bg-transparent text-xs"
                            value={subjectSearch}
                            onChange={(e) => setSubjectSearch(e.target.value)}
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto bg-base-100 rounded-md border border-base-300 p-2 space-y-1">
                          {subjects.map((sub) => (
                            <label
                              key={sub._id}
                              className="flex items-center gap-2 p-1 hover:bg-base-200 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="checkbox checkbox-xs checkbox-primary"
                                checked={item.subject.includes(sub._id)}
                                onChange={() =>
                                  toggleSubjectInCurriculum(idx, sub._id)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">
                                  {sub.name}
                                </div>
                                <div className="text-[10px] opacity-60 truncate">
                                  {sub.subjectId}
                                </div>
                              </div>
                            </label>
                          ))}
                          {subjects.length === 0 && (
                            <div className="text-xs text-center opacity-50 py-2">
                              No subjects found
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-base-200 px-6 py-4 flex justify-end gap-2 sticky bottom-0 z-10">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            form="course-form"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : null}
            {initialData ? "Update Course" : "Create Course"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
