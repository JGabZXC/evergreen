import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  Save,
  Clock,
  Loader2,
  Search,
  AlertTriangle,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubjects } from "../hooks/useSubjects";
import { useTeachers } from "../hooks/useTeachers";
import { useRooms } from "../hooks/useRooms";
import { useCourses } from "../hooks/useCourses";
import type { CreateSchedulePayload } from "../types";
import {
  getCurrentSchoolYear,
  getSchoolYearOptions,
} from "../../../utils/schoolYear";
import type {
  Room,
  Subject,
  SubjectSchedule,
  TimeSlot,
  Teacher,
} from "../../../shared/types/index.ts";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface LocalTimeSlot extends Omit<TimeSlot, "_id"> {
  localId: string;
  room: string;
  teacherId: string;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSchedulePayload) => void;
  initialData?: SubjectSchedule | null;
}

// --- Generic Selection Modal Component ---
interface SelectionModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  emptyMessage?: string;
}

function SelectionModal<T extends { _id: string }>({
  isOpen,
  onClose,
  title,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  items,
  onSelect,
  renderItem,
  loading,
  hasMore,
  onLoadMore,
  emptyMessage = "No items found",
}: SelectionModalProps<T>) {
  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      onLoadMore();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-base-100 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 border-b border-base-200 bg-base-100">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              size={18}
            />
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2" onScroll={handleScroll}>
          {items.length === 0 && !loading ? (
            <div className="text-center py-10 opacity-50">{emptyMessage}</div>
          ) : (
            <ul className="menu w-full p-0">
              {items.map((item) => (
                <li key={item._id} className="mb-1">
                  <a
                    onClick={() => onSelect(item)}
                    className="flex flex-col items-start gap-1 py-3"
                  >
                    {renderItem(item)}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddScheduleModalProps) {
  // --- State for Modals ---
  const [activeModal, setActiveModal] = useState<
    "subject" | "teacher" | "room" | null
  >(null);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  // --- Subject State ---
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectPage, setSubjectPage] = useState(1);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [hasMoreSubjects, setHasMoreSubjects] = useState(true);

  // --- Room State ---
  const [roomSearch, setRoomSearch] = useState("");
  const [roomPage, setRoomPage] = useState(1);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [hasMoreRooms, setHasMoreRooms] = useState(true);

  // --- Teacher State ---
  const [teacherSearch, setTeacherSearch] = useState("");
  // Note: useTeachers fetches all (limit 100), so we filter locally for now
  // unless we update the hook/service to support search.
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);

  // --- Course State ---
  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // --- Hooks ---
  const { subjects, loading: loadingSubjects } = useSubjects(
    subjectPage,
    20,
    subjectSearch
  );

  const { rooms: roomData, loading: loadingRooms } = useRooms(
    roomPage,
    20,
    roomSearch
  );

  const { teachers, loading: loadingTeachers } = useTeachers(1, 100, true);

  // Fetch courses with search
  const { courses, loading: loadingCourses } = useCourses(1, 50, courseSearch);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    schoolYear: getCurrentSchoolYear(),
    semester: 1,
  });

  const [schedules, setSchedules] = useState<LocalTimeSlot[]>([
    {
      localId: generateId(),
      day: "Mon",
      startTime: "",
      endTime: "",
      room: "",
      teacherId: "TBA",
    },
  ]);

  // --- Effects ---

  // Populate form when initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        subject:
          typeof initialData.subject === "object"
            ? initialData.subject._id
            : initialData.subject,
        schoolYear: initialData.schoolYear,
        semester: Number(initialData.semester),
      });

      if (initialData.schedules && initialData.schedules.length > 0) {
        setSchedules(
          initialData.schedules.map((s) => ({
            localId: generateId(),
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            room: typeof s.room === "object" ? s.room._id : s.room,
            teacherId: s.teacherId || "TBA",
          }))
        );
      }
    } else if (isOpen && !initialData) {
      // Reset form
      setFormData({
        subject: "",
        schoolYear: getCurrentSchoolYear(),
        semester: 1,
      });
      setSchedules([
        {
          localId: generateId(),
          day: "Mon",
          startTime: "",
          endTime: "",
          room: "",
          teacherId: "TBA",
        },
      ]);
      setSelectedCourseId("");
      setSubjectList([]);
    }
  }, [isOpen, initialData]);

  // Subject List Management
  useEffect(() => {
    if (subjects && !selectedCourseId) {
      if (subjectPage === 1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubjectList(subjects);
      } else {
        setSubjectList((prev) => {
          const newSubs = subjects.filter(
            (s) => !prev.some((p) => p._id === s._id)
          );
          return [...prev, ...newSubs];
        });
      }
      setHasMoreSubjects(subjects.length === 20);
    }
  }, [subjects, subjectPage, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubjectPage(1);
      setSubjectList([]);
    }
  }, [subjectSearch, selectedCourseId]);

  // Room List Management
  useEffect(() => {
    if (roomData) {
      if (roomPage === 1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRoomList(roomData);
      } else {
        setRoomList((prev) => {
          const newRooms = roomData.filter(
            (r) => !prev.some((p) => p._id === r._id)
          );
          return [...prev, ...newRooms];
        });
      }
      setHasMoreRooms(roomData.length === 20);
    }
  }, [roomData, roomPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoomPage(1);
    setRoomList([]);
  }, [roomSearch]);

  // Teacher List Management (Local Filtering)
  useEffect(() => {
    if (teachers) {
      const filtered = teachers.filter((t) => {
        const searchLower = teacherSearch.toLowerCase();
        const name =
          `${t.profile?.firstName} ${t.profile?.lastName}`.toLowerCase();
        const email = typeof t.userId === "object" ? t.userId.email.toLowerCase() : "";
        return name.includes(searchLower) || email.includes(searchLower);
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredTeachers(filtered);
    }
  }, [teachers, teacherSearch]);

  // Course Selection Logic (Populate Subjects)
  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find((c) => c._id === selectedCourseId);
      if (course && course.curriculum) {
        const subs: Subject[] = [];
        course.curriculum.forEach((term) => {
          term.subject?.forEach((sub) => {
            if (typeof (sub as unknown) !== "string") subs.push(sub as Subject);
          });
        });
        // Deduplicate subjects
        const uniqueSubs = Array.from(
          new Map(subs.map((s) => [s._id, s])).values()
        );
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubjectList(uniqueSubs);
        setHasMoreSubjects(false);
      }
    }
  }, [selectedCourseId, courses]);

  // Click Outside for Course Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCourseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleSlotChange = (
    id: string,
    field: keyof LocalTimeSlot,
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((slot) =>
        slot.localId === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const addSlot = () => {
    setSchedules([
      ...schedules,
      {
        localId: generateId(),
        day: "Mon",
        startTime: "",
        endTime: "",
        room: "",
        teacherId: "TBA",
      },
    ]);
  };

  const removeSlot = (id: string) => {
    if (schedules.length > 1) {
      setSchedules((prev) => prev.filter((slot) => slot.localId !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSchedules = schedules.map(({ localId: _localId, ...rest }) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
      day: rest.day,
      startTime: rest.startTime,
      endTime: rest.endTime,
      room: rest.room,
      teacherId: rest.teacherId || "TBA",
    }));

    const payload: CreateSchedulePayload = {
      ...formData,
      schedules: cleanedSchedules,
    };
    onSave(payload);
  };

  const getSemesterWarning = () => {
    if (!formData.subject || !formData.semester) return null;
    const selectedSub = subjectList.find(
      (s) => s._id === formData.subject || s.subjectId === formData.subject
    );
    if (
      selectedSub &&
      selectedSub.semesterAvailable &&
      selectedSub.semesterAvailable.length > 0
    ) {
      if (!selectedSub.semesterAvailable.includes(formData.semester)) {
        return (
          <div className="mt-2 p-3 bg-warning/10 border border-warning/20 text-warning rounded-lg flex gap-3 text-sm animate-in fade-in slide-in-from-top-1">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Off-Semester Schedule</p>
              <p className="opacity-90">
                This subject is usually offered in{" "}
                <strong>
                  {selectedSub.semesterAvailable
                    .map((s) =>
                      s === 3 ? "Summer" : `${s}${s === 1 ? "st" : "nd"} Sem`
                    )
                    .join(" or ")}
                </strong>
                .
              </p>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-base-100 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-200/50">
          <div>
            <h2 className="text-xl font-bold">
              {initialData ? "Edit Class Schedule" : "Add Class Schedule"}
            </h2>
            <p className="text-xs text-base-content/60">
              {initialData
                ? "Update schedule details."
                : "Assign a subject and time to a section."}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form
            id="schedule-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* 1. Core Assignment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Filter with Search */}
              <div
                className="form-control md:col-span-2"
                ref={courseDropdownRef}
              >
                <label className="label font-medium flex justify-between">
                  <span>Filter Subjects by Course (Optional)</span>
                  {selectedCourseId && (
                    <span
                      className="text-xs text-primary cursor-pointer hover:underline"
                      onClick={() => {
                        setSelectedCourseId("");
                        setCourseSearch("");
                      }}
                    >
                      Clear Filter
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div
                    className="input input-bordered w-full flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setIsCourseDropdownOpen(!isCourseDropdownOpen)
                    }
                  >
                    <span className={!selectedCourseId ? "opacity-50" : ""}>
                      {selectedCourseId
                        ? courses.find((c) => c._id === selectedCourseId)
                            ?.code || "Unknown Course"
                        : "Select Course to Filter..."}
                    </span>
                    <ChevronDown size={16} className="opacity-50" />
                  </div>

                  {isCourseDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-base-100 border border-base-200 rounded-lg shadow-xl z-20 max-h-60 flex flex-col">
                      <div className="p-2 border-b border-base-200 sticky top-0 bg-base-100 rounded-t-lg">
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full"
                          placeholder="Search course..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto flex-1 p-1">
                        <div
                          className="p-2 hover:bg-base-200 rounded cursor-pointer text-sm"
                          onClick={() => {
                            setSelectedCourseId("");
                            setIsCourseDropdownOpen(false);
                          }}
                        >
                          All Courses (Show All Subjects)
                        </div>
                        {courses.map((c) => (
                          <div
                            key={c._id}
                            className={`p-2 hover:bg-base-200 rounded cursor-pointer text-sm flex justify-between items-center ${
                              selectedCourseId === c._id
                                ? "bg-primary/10 text-primary"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedCourseId(c._id);
                              setIsCourseDropdownOpen(false);
                            }}
                          >
                            <span>
                              <strong>{c.code}</strong> - {c.name}
                            </span>
                            {selectedCourseId === c._id && <Check size={14} />}
                          </div>
                        ))}
                        {loadingCourses && (
                          <div className="p-2 text-center text-xs opacity-50">
                            Loading...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Selection */}
              <div className="form-control">
                <label className="label font-medium">
                  Subject
                  <span className="badge badge-xs badge-ghost ml-2">
                    {subjectList.length} available
                  </span>
                </label>
                <div
                  className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${
                    !formData.subject ? "text-base-content/60" : ""
                  }`}
                  onClick={() => setActiveModal("subject")}
                >
                  <span className="truncate">
                    {formData.subject
                      ? subjectList.find((s) => s._id === formData.subject)
                          ?.name ||
                        subjectList.find(
                          (s) => s.subjectId === formData.subject
                        )?.name ||
                        "Selected Subject"
                      : "Select Subject..."}
                  </span>
                  <Search size={16} className="opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label font-medium">School Year</label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.schoolYear}
                    onChange={(e) =>
                      setFormData({ ...formData, schoolYear: e.target.value })
                    }
                  >
                    {getSchoolYearOptions().map((year) => (
                      <option key={year} value={year}>
                        SY {year}
                      </option>
                    ))}
                  </select>
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
              {getSemesterWarning() && (
                <div className="md:col-span-2">{getSemesterWarning()}</div>
              )}
            </div>

            <div className="divider">Time Slots</div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {schedules.map((slot) => (
                  <motion.div
                    key={slot.localId}
                    initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      overflow: "visible",
                    }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="relative justify-between p-4 bg-base-100 border border-base-300 rounded-xl shadow-sm hover:shadow-md transition-all mb-3 group">
                      <button
                        type="button"
                        className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => removeSlot(slot.localId)}
                        disabled={schedules.length === 1}
                        title="Remove Slot"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Day Group */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
                            Day
                          </label>
                          <select
                            className="select select-bordered select-sm w-full font-medium"
                            value={slot.day}
                            onChange={(e) =>
                              handleSlotChange(
                                slot.localId,
                                "day",
                                e.target.value
                              )
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

                        {/* Start Time */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={10} /> Start
                          </label>
                          <input
                            type="time"
                            required
                            className="input input-bordered input-sm w-full font-medium"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleSlotChange(
                                slot.localId,
                                "startTime",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* End Time */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={10} /> End
                          </label>
                          <input
                            type="time"
                            required
                            className="input input-bordered input-sm w-full font-medium"
                            value={slot.endTime}
                            onChange={(e) =>
                              handleSlotChange(
                                slot.localId,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* Teacher Group */}
                        <div className="md:col-span-3 space-y-1.5">
                          <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
                            Instructor
                          </label>
                          <div
                            className="input input-bordered input-sm flex items-center justify-between cursor-pointer px-3"
                            onClick={() => {
                              setActiveSlotId(slot.localId);
                              setActiveModal("teacher");
                            }}
                          >
                            <span className="truncate text-sm">
                              {slot.teacherId && slot.teacherId !== "TBA"
                                ? (() => {
                                    const t = teachers.find(
                                      (t) => t.employeeId === slot.teacherId
                                    );
                                    return t
                                      ? (typeof t.userId === "object") ? t.userId.email : t.userId
                                      : slot.teacherId;
                                  })()
                                : "To Be Announced"}
                            </span>
                            <Search size={12} className="opacity-50" />
                          </div>
                        </div>

                        {/* Room Group */}
                        <div className="md:col-span-3 space-y-1.5">
                          <label className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
                            Room
                          </label>
                          <div
                            className="input input-bordered input-sm w-full flex items-center justify-between cursor-pointer px-3"
                            onClick={() => {
                              setActiveSlotId(slot.localId);
                              setActiveModal("room");
                            }}
                          >
                            <span className="truncate text-sm">
                              {slot.room
                                ? roomList.find((r) => r._id === slot.room)
                                    ?.name || "Selected"
                                : "Select Room"}
                            </span>
                            <Search size={12} className="opacity-50" />
                          </div>
                        </div>
                      </div>
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
        </div>

        <div className="p-5 border-t border-base-200 bg-base-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            form="schedule-form"
            className="btn btn-primary gap-2"
            disabled={
              loadingCourses ||
              loadingRooms ||
              loadingSubjects ||
              loadingTeachers
            }
          >
            <Save size={18} />
            Save Schedule
          </button>
        </div>
      </motion.div>

      {/* --- Modals --- */}

      {/* Subject Modal */}
      <SelectionModal
        isOpen={activeModal === "subject"}
        onClose={() => setActiveModal(null)}
        title="Select Subject"
        searchPlaceholder="Search subject code or name..."
        searchValue={subjectSearch}
        onSearchChange={setSubjectSearch}
        items={subjectList}
        loading={loadingSubjects}
        hasMore={hasMoreSubjects}
        onLoadMore={() => setSubjectPage((p) => p + 1)}
        onSelect={(subject) => {
          setFormData({ ...formData, subject: subject._id });
          setActiveModal(null);
        }}
        renderItem={(subject) => (
          <>
            <span className="font-bold text-sm">{subject.subjectId}</span>
            <span className="text-xs opacity-70">{subject.name}</span>
          </>
        )}
      />

      {/* Teacher Modal */}
      <SelectionModal
        isOpen={activeModal === "teacher"}
        onClose={() => setActiveModal(null)}
        title="Select Instructor"
        searchPlaceholder="Search instructor name or email..."
        searchValue={teacherSearch}
        onSearchChange={setTeacherSearch}
        items={filteredTeachers}
        loading={loadingTeachers}
        hasMore={false} // Local filtering for now
        onLoadMore={() => {}}
        onSelect={(teacher) => {
          if (activeSlotId) {
            handleSlotChange(activeSlotId, "teacherId", teacher.employeeId);
          }
          setActiveModal(null);
        }}
        renderItem={(teacher) => (
          <>
            <span className="font-bold text-sm">
              {teacher.profile?.firstName && teacher.profile?.lastName
                ? `${teacher.profile.firstName} ${teacher.profile.lastName}`
                : "No Profile Name"}
            </span>
            <span className="text-xs opacity-70">
              {typeof teacher.userId === "object" ? teacher.userId.email : ""} - {teacher.employeeId}
            </span>
          </>
        )}
      />

      {/* Room Modal */}
      <SelectionModal
        isOpen={activeModal === "room"}
        onClose={() => setActiveModal(null)}
        title="Select Room"
        searchPlaceholder="Search room name..."
        searchValue={roomSearch}
        onSearchChange={setRoomSearch}
        items={roomList}
        loading={loadingRooms}
        hasMore={hasMoreRooms}
        onLoadMore={() => setRoomPage((p) => p + 1)}
        onSelect={(room) => {
          if (activeSlotId) {
            handleSlotChange(activeSlotId, "room", room._id);
          }
          setActiveModal(null);
        }}
        renderItem={(room) => (
          <>
            <span className="font-bold text-sm">{room.name}</span>
            <span className="text-xs opacity-70">{room.type}</span>
          </>
        )}
      />
    </div>
  );
}
