import { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Save, Clock, Loader2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSectionsOption,
  getSubjectsOption,
  getTeachersOption,
} from "../services/scheduleServices";
import { apiPrivate } from "../../../config/axiosPrivate";

// --- 1. Safe ID Generator ---
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface ScheduleSlotWithId extends ScheduleSlot {
  id: string;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSave,
}: AddScheduleModalProps) {
  // --- Data State ---
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]); // New Course State
  const [loadingOptions, setLoadingOptions] = useState(false);

  // --- Filter State ---
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // --- Form State ---
  const [formData, setFormData] = useState({
    classroomId: "",
    subjectId: "",
    teacherId: "",
    schoolYear: "2025-2026",
    semester: 1,
  });

  const [schedules, setSchedules] = useState<ScheduleSlotWithId[]>([
    {
      id: generateId(),
      day: "Mon",
      startTime: "",
      endTime: "",
      room: "",
    },
  ]);

  // --- Fetch Options on Mount ---
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingOptions(true);
        try {
          const [secData, subData, teachData, courseRes] = await Promise.all([
            getSectionsOption(),
            getSubjectsOption(),
            getTeachersOption(),
            apiPrivate.get("/api/registrar/course"), // Fetch courses directly
          ]);

          setSections(secData);
          setSubjects(subData);
          setTeachers(teachData);
          setCourses(courseRes.data.courses || []);
        } catch (error) {
          console.error("Failed to load dropdown options", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // --- Filtering Logic ---
  const filteredSubjects = useMemo(() => {
    if (!selectedCourseId) return subjects;

    // Find the selected course object
    const course = courses.find((c: any) => c._id === selectedCourseId);
    if (!course) return subjects;

    // Extract all subject IDs from the course curriculum
    // The backend structure is: course.subjectToBeTaken[].subject[] (populated objects)
    const courseSubjectIds = new Set<string>();

    course.subjectToBeTaken?.forEach((term: any) => {
      term.subject?.forEach((sub: any) => {
        // Handle both populated objects (sub._id) or just IDs (sub)
        const id = typeof sub === "string" ? sub : sub._id;
        if (id) courseSubjectIds.add(id);
      });
    });

    // Filter the main subjects list
    return subjects.filter((s) => courseSubjectIds.has(s._id));
  }, [selectedCourseId, subjects, courses]);

  // Reset subject selection if it's no longer valid after filtering
  useEffect(() => {
    if (selectedCourseId && formData.subjectId) {
      const isValid = filteredSubjects.find(
        (s) => s.subjectId === formData.subjectId
      );
      if (!isValid) {
        setFormData((prev) => ({ ...prev, subjectId: "" }));
      }
    }
  }, [selectedCourseId, filteredSubjects]);

  // --- Handlers ---
  const handleSlotChange = (
    id: string,
    field: keyof ScheduleSlot,
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const addSlot = () => {
    setSchedules([
      ...schedules,
      {
        id: generateId(),
        day: "Mon",
        startTime: "",
        endTime: "",
        room: "",
      },
    ]);
  };

  const removeSlot = (id: string) => {
    if (schedules.length > 1) {
      setSchedules((prev) => prev.filter((slot) => slot.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSchedules = schedules.map(({ id, ...rest }) => rest);
    const payload = {
      ...formData,
      schedules: cleanedSchedules,
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-base-100 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-200/50">
          <div>
            <h2 className="text-xl font-bold">Add Class Schedule</h2>
            <p className="text-xs text-base-content/60">
              Assign a subject and time to a section.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loadingOptions ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="text-sm opacity-50">Loading options...</span>
            </div>
          ) : (
            <form
              id="schedule-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* 1. Core Assignment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Filter (Optional) */}
                <div className="form-control md:col-span-2">
                  <label className="label font-medium flex justify-between">
                    <span>Filter Subjects by Course (Optional)</span>
                    {selectedCourseId && (
                      <span
                        className="text-xs text-primary cursor-pointer hover:underline"
                        onClick={() => setSelectedCourseId("")}
                      >
                        Clear Filter
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Filter
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                      size={16}
                    />
                    <select
                      className="select select-bordered w-full pl-10"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                      <option value="">All Courses (Show All Subjects)</option>
                      {courses.map((c: any) => (
                        <option key={c._id} value={c._id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-medium">
                    Section (Classroom)
                  </label>
                  <select
                    required
                    className="select select-bordered w-full"
                    value={formData.classroomId}
                    onChange={(e) =>
                      setFormData({ ...formData, classroomId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Section...
                    </option>
                    {sections.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-medium">
                    Subject
                    <span className="badge badge-xs badge-ghost ml-2">
                      {filteredSubjects.length} available
                    </span>
                  </label>
                  <select
                    required
                    className="select select-bordered w-full"
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      {filteredSubjects.length === 0
                        ? "No subjects found in course"
                        : "Select Subject..."}
                    </option>
                    {filteredSubjects.map((s) => (
                      <option key={s._id} value={s.subjectId}>
                        {s.subjectId} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-medium">Assigned Teacher</label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.teacherId}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Teacher...
                    </option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t.employeeId}>
                        {t.userId?.email}
                      </option>
                    ))}
                    <option value="TBA">To Be Announced</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="form-control">
                    <label className="label font-medium">School Year</label>
                    <input
                      type="text"
                      required
                      className="input input-bordered w-full"
                      value={formData.schoolYear}
                      onChange={(e) =>
                        setFormData({ ...formData, schoolYear: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-medium">Semester</label>
                    <select
                      required
                      className="select select-bordered w-full"
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semester: Number(e.target.value),
                        })
                      }
                    >
                      <option value={1}>1st</option>
                      <option value={2}>2nd</option>
                      <option value={3}>Summer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divider">Time Slots</div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {schedules.map((slot) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        overflow: "visible",
                      }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="flex flex-col md:flex-row gap-3 p-3 bg-base-100 border border-base-300 rounded-lg shadow-sm mb-3">
                        <div className="w-full md:w-24">
                          <select
                            className="select select-bordered select-sm w-full"
                            value={slot.day}
                            onChange={(e) =>
                              handleSlotChange(slot.id, "day", e.target.value)
                            }
                          >
                            {[
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                              "Sun",
                            ].map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                          <Clock size={16} className="text-base-content/50" />
                          <input
                            type="time"
                            required
                            className="input input-bordered input-sm w-full"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleSlotChange(
                                slot.id,
                                "startTime",
                                e.target.value
                              )
                            }
                          />
                          <span className="text-xs font-bold">-</span>
                          <input
                            type="time"
                            required
                            className="input input-bordered input-sm w-full"
                            value={slot.endTime}
                            onChange={(e) =>
                              handleSlotChange(
                                slot.id,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="w-full md:w-32">
                          <input
                            type="text"
                            required
                            placeholder="Room"
                            className="input input-bordered input-sm w-full"
                            value={slot.room}
                            onChange={(e) =>
                              handleSlotChange(slot.id, "room", e.target.value)
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => removeSlot(slot.id)}
                          disabled={schedules.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={addSlot}
                  className="btn btn-sm btn-outline btn-block border-dashed border-base-content/30 text-base-content/60 hover:border-primary hover:text-primary mt-2"
                >
                  <Plus size={16} /> Add Another Time/Room
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-5 border-t border-base-200 bg-base-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            form="schedule-form"
            className="btn btn-primary gap-2"
            disabled={loadingOptions}
          >
            <Save size={18} />
            Save Schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
}
