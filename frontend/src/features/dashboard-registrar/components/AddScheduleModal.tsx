import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import { useSubjects } from "../hooks/useSubjects";
import { useTeachers } from "../hooks/useTeachers";
import { useRooms } from "../hooks/useRooms";
import { useCourses } from "../hooks/useCourses";
import type {
  CreateSchedulePayload,
  Subject,
  Room,
  TimeSlot,
  SubjectSchedule,
} from "../types";
import {
  getCurrentSchoolYear,
  getSchoolYearOptions,
} from "../../../utils/schoolYear";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface LocalTimeSlot extends Omit<TimeSlot, "_id"> {
  localId: string;
  room: string; // Backend expects string
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSchedulePayload) => void;
  initialData?: SubjectSchedule | null;
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddScheduleModalProps) {
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectPage, setSubjectPage] = useState(1);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [hasMoreSubjects, setHasMoreSubjects] = useState(true);

  const [roomSearch, setRoomSearch] = useState("");
  const [roomPage, setRoomPage] = useState(1);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [hasMoreRooms, setHasMoreRooms] = useState(true);

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
  const { courses, loading: loadingCourses } = useCourses(1, 100);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    teacherId: "",
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
    },
  ]);

  // Populate form when initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        subject:
          typeof initialData.subject === "object"
            ? initialData.subject._id
            : initialData.subject,
        teacherId:
          typeof initialData.teacher === "object"
            ? initialData.teacher.employeeId
            : initialData.teacherId || "",
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
          }))
        );
      }
    } else if (isOpen && !initialData) {
      // Reset form
      setFormData({
        subject: "",
        teacherId: "",
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
        },
      ]);
    }
  }, [isOpen, initialData]);

  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const subjectTriggerRef = useRef<HTMLDivElement>(null);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subjects && !selectedCourseId) {
      if (subjectPage === 1) {
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
      setSubjectPage(1);
      setSubjectList([]);
    }
  }, [subjectSearch, selectedCourseId]);

  useEffect(() => {
    if (roomData) {
      if (roomPage === 1) {
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
    setRoomPage(1);
    setRoomList([]);
  }, [roomSearch]);

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
    }
  }, [selectedCourseId, courses]);

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

  const handleRoomScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      hasMoreRooms &&
      !loadingRooms
    ) {
      setRoomPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideTrigger =
        subjectTriggerRef.current &&
        !subjectTriggerRef.current.contains(target);
      const isOutsideContent =
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(target);

      if (isOutsideTrigger && isOutsideContent) {
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSubjectDropdown = () => {
    if (!isSubjectDropdownOpen && subjectTriggerRef.current) {
      const rect = subjectTriggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsSubjectDropdownOpen(!isSubjectDropdownOpen);
  };

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
    const cleanedSchedules = schedules.map(({ localId, ...rest }) => rest);
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
          {loadingCourses ||
          loadingRooms ||
          loadingSubjects ||
          loadingTeachers ? (
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCourseId(val);
                        if (!val) {
                          setSubjectList([]);
                          setSubjectPage(1);
                          setHasMoreSubjects(true);
                          setSubjectSearch("");
                        }
                      }}
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
                    Subject
                    <span className="badge badge-xs badge-ghost ml-2">
                      {subjectList.length} available
                    </span>
                  </label>
                  <div className="w-full">
                    <div
                      ref={subjectTriggerRef}
                      tabIndex={0}
                      role="button"
                      className={`input input-bordered w-full flex items-center justify-between cursor-pointer ${
                        !formData.subject ? "text-base-content/60" : ""
                      }`}
                      onClick={toggleSubjectDropdown}
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
                    {isSubjectDropdownOpen &&
                      createPortal(
                        <div
                          ref={subjectDropdownRef}
                          className="menu p-2 shadow bg-base-100 rounded-box fixed z-9999 max-h-60 overflow-y-auto flex-nowrap border border-base-200"
                          style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                          }}
                          onScroll={handleSubjectScroll}
                        >
                          {!selectedCourseId && (
                            <div className="p-2 sticky top-0 bg-base-100 z-10">
                              <input
                                type="text"
                                className="input input-sm input-bordered w-full"
                                placeholder="Search subject..."
                                value={subjectSearch}
                                onChange={(e) =>
                                  setSubjectSearch(e.target.value)
                                }
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
                                <span className="font-bold">{s.subjectId}</span>{" "}
                                - {s.name}
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
                        </div>,
                        document.body
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
                      <div className="flex flex-col md:flex-row gap-3 p-3 bg-base-100 border border-base-300 rounded-lg shadow-sm mb-3">
                        <div className="w-full md:w-24">
                          <select
                            className="select select-bordered select-sm w-full"
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

                        <div className="flex items-center gap-2 flex-1">
                          <Clock size={16} className="text-base-content/50" />
                          <input
                            type="time"
                            required
                            className="input input-bordered input-sm w-full"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleSlotChange(
                                slot.localId,
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
                                slot.localId,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* Room Dropdown in Slot */}
                        <div className="w-full md:w-48 relative group">
                          <div className="dropdown w-full">
                            <div
                              tabIndex={0}
                              role="button"
                              className="input input-bordered input-sm w-full flex items-center justify-between"
                            >
                              <span className="truncate">
                                {slot.room
                                  ? roomList.find((r) => r._id === slot.room)
                                      ?.name || "Selected Room"
                                  : "Select Room"}
                              </span>
                              <Search size={14} className="opacity-50" />
                            </div>
                            <div
                              tabIndex={0}
                              className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-40 overflow-y-auto flex-nowrap"
                              onScroll={handleRoomScroll}
                            >
                              <div className="p-2 sticky top-0 bg-base-100 z-10">
                                <input
                                  type="text"
                                  className="input input-xs input-bordered w-full"
                                  placeholder="Search room..."
                                  value={roomSearch}
                                  onChange={(e) =>
                                    setRoomSearch(e.target.value)
                                  }
                                />
                              </div>
                              {roomList.map((r) => (
                                <li
                                  key={r._id}
                                  onClick={() => {
                                    handleSlotChange(
                                      slot.localId,
                                      "room",
                                      r._id
                                    );
                                    // Close dropdown hack (blur)
                                    if (
                                      document.activeElement instanceof
                                      HTMLElement
                                    ) {
                                      document.activeElement.blur();
                                    }
                                  }}
                                >
                                  <a>
                                    {r.name} ({r.type})
                                  </a>
                                </li>
                              ))}
                              {loadingRooms && (
                                <li className="disabled">
                                  <a>Loading...</a>
                                </li>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => removeSlot(slot.localId)}
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
    </div>
  );
}
