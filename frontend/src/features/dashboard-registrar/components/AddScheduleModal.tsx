import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  Clock,
  Loader2,
  Filter,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScheduleOptions } from "../hooks/useScheduleOptions";
import type { CreateSchedulePayload, Subject } from "../types";
import { apiPrivate } from "../../../config/axiosPrivate";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface ScheduleSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
}

interface ScheduleSlotWithId extends ScheduleSlot {
  id: string;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSchedulePayload) => void;
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSave,
}: AddScheduleModalProps) {
  const { sections, teachers, courses, loadingOptions } =
    useScheduleOptions(isOpen);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [formData, setFormData] = useState({
    classroomId: "",
    subject: "",
    teacherId: "",
    schoolYear: "2025-2026",
    semester: 1,
  });

  // Subject Search & Infinite Scroll State
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectPage, setSubjectPage] = useState(1);
  const [hasMoreSubjects, setHasMoreSubjects] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [schedules, setSchedules] = useState<ScheduleSlotWithId[]>([
    {
      id: generateId(),
      day: "Mon",
      startTime: "",
      endTime: "",
    },
  ]);

  // Fetch Subjects (Paginated & Search)
  const fetchSubjects = useCallback(
    async (page: number, search: string, signal?: AbortSignal) => {
      setLoadingSubjects(true);
      try {
        const res = await apiPrivate.get("/api/subject", {
          params: { page, limit: 20, search, active: true },
          signal,
        });
        const newSubjects = res.data.subjects || [];
        setSubjectList((prev) =>
          page === 1 ? newSubjects : [...prev, ...newSubjects]
        );
        setHasMoreSubjects(newSubjects.length === 20);
      } catch (error: any) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error("Failed to fetch subjects", error);
        }
      } finally {
        if (!signal?.aborted) setLoadingSubjects(false);
      }
    },
    []
  );

  // Effect: Fetch subjects when search/page changes (if no course selected)
  useEffect(() => {
    if (selectedCourseId) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchSubjects(subjectPage, subjectSearch, controller.signal);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [subjectPage, subjectSearch, selectedCourseId, fetchSubjects]);

  // Effect: Handle Course Selection
  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find((c) => c._id === selectedCourseId);
      if (course && course.curriculum) {
        const subs: Subject[] = [];
        course.curriculum.forEach((term) => {
          term.subject?.forEach((sub) => {
            if (typeof sub !== "string") subs.push(sub as Subject);
          });
        });
        // Deduplicate subjects
        const uniqueSubs = Array.from(
          new Map(subs.map((s) => [s._id, s])).values()
        );
        setSubjectList(uniqueSubs);
        setHasMoreSubjects(false);
      }
    } else {
      // Reset to fetch mode
      setSubjectList([]);
      setSubjectPage(1);
      setHasMoreSubjects(true);
      setSubjectSearch("");
    }
  }, [selectedCourseId, courses]);

  // Handle Scroll for Infinite Loading
  const handleSubjectScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      hasMoreSubjects &&
      !loadingSubjects &&
      !selectedCourseId
    ) {
      setSubjectPage((prev) => prev + 1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                      {courses.map((c) => (
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

                {/* Custom Subject Dropdown */}
                <div className="form-control" ref={dropdownRef}>
                  <label className="label font-medium">
                    Subject
                    <span className="badge badge-xs badge-ghost ml-2">
                      {subjectList.length} available
                    </span>
                  </label>
                  <div className="dropdown w-full">
                    <div
                      tabIndex={0}
                      role="button"
                      className={`input input-bordered w-full flex items-center justify-between ${
                        !formData.subject ? "text-base-content/60" : ""
                      }`}
                      onClick={() =>
                        setIsSubjectDropdownOpen(!isSubjectDropdownOpen)
                      }
                    >
                      <span className="truncate">
                        {formData.subject
                          ? subjectList.find(
                              (s) => s._id === formData.subject
                            )?.name ||
                            subjectList.find(
                              (s) => s.subjectId === formData.subject
                            )?.name ||
                            "Selected Subject"
                          : "Select Subject..."}
                      </span>
                      <Search size={16} className="opacity-50" />
                    </div>
                    {isSubjectDropdownOpen && (
                      <div
                        tabIndex={0}
                        className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto flex-nowrap"
                        onScroll={handleSubjectScroll}
                      >
                        {!selectedCourseId && (
                          <div className="p-2 sticky top-0 bg-base-100 z-10">
                            <input
                              type="text"
                              className="input input-sm input-bordered w-full"
                              placeholder="Search subject..."
                              value={subjectSearch}
                              onChange={(e) => setSubjectSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                        )}
                        {subjectList.map((s) => (
                          <li
                            key={s._id}
                            onClick={() => {
                              setFormData({ ...formData, subject: s._id });
                              setIsSubjectDropdownOpen(false);
                            }}
                          >
                            <a>
                              <span className="font-bold">{s.subjectId}</span> -{" "}
                              {s.name}
                            </a>
                          </li>
                        ))}
                        {loadingSubjects && (
                          <li className="disabled">
                            <a>Loading...</a>
                          </li>
                        )}
                        {!loadingSubjects && subjectList.length === 0 && (
                          <li className="disabled">
                            <a>No subjects found</a>
                          </li>
                        )}
                      </div>
                    )}
                  </div>
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
