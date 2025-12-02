import { motion } from "framer-motion";
import { useState } from "react";
import type { ScheduleItem, Teacher } from "../types";
import { Clock, LayoutDashboard, Plus, Save, Users, X } from "lucide-react";

const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: "S001",
    subjectCode: "MATH101",
    subjectName: "Calculus I",
    teacherId: "T002",
    timeSlot: "08:00 AM - 09:30 AM",
    room: "RM-304",
  },
  {
    id: "S002",
    subjectCode: "ENG102",
    subjectName: "Purposive Comm",
    teacherId: "T003",
    timeSlot: "10:00 AM - 11:30 AM",
    room: "RM-201",
  },
  {
    id: "S003",
    subjectCode: "SCI201",
    subjectName: "Physics I",
    teacherId: null,
    timeSlot: "",
    room: "",
  }, // Unassigned
  {
    id: "S004",
    subjectCode: "PROG101",
    subjectName: "Intro to Computing",
    teacherId: null,
    timeSlot: "",
    room: "",
  }, // Unassigned
  {
    id: "S005",
    subjectCode: "PROG102",
    subjectName: "Intro to Computing II",
    teacherId: null,
    timeSlot: "",
    room: "",
  }, // Unassigned
  {
    id: "S006",
    subjectCode: "PROG101",
    subjectName: "Intro to Computing",
    teacherId: null,
    timeSlot: "",
    room: "",
  }, // Unassigned
  {
    id: "S007",
    subjectCode: "PROG101",
    subjectName: "Intro to Computing",
    teacherId: null,
    timeSlot: "",
    room: "",
  }, // Unassigned
];

const MOCK_TEACHERS: Teacher[] = [
  { id: "T001", name: "Dr. Adela Santos", department: "Science" },
  { id: "T002", name: "Mr. Benigno Cruz", department: "Mathematics" },
  { id: "T003", name: "Ms. Carla Dizon", department: "English" },
  { id: "T004", name: "Engr. David Lim", department: "Engineering" },
];

export default function TeacherScheduling() {
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tempTeacher, setTempTeacher] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [tempRoom, setTempRoom] = useState("");

  const handleEditClick = (schedule: ScheduleItem) => {
    setEditingId(schedule.id);
    setTempTeacher(schedule.teacherId || "");
    setTempTime(schedule.timeSlot);
    setTempRoom(schedule.room);
  };

  const handleSave = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, teacherId: tempTeacher, timeSlot: tempTime, room: tempRoom }
          : s
      )
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 dark:border dark:border-white/10">
        <div>
          <h2 className="text-lg font-bold">Class Allocator</h2>
          <p className="text-sm text-base-content/60">
            Assign teachers and rooms to open sections. test
          </p>
        </div>
        <button className="btn btn-sm btn-outline gap-2">
          <Plus size={16} /> Add Section
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schedules.map((schedule) => (
          <motion.div
            key={schedule.id}
            layout
            className={`card bg-base-100 shadow-sm border-l-4 transition-all ${
              schedule.teacherId ? "border-l-success" : "border-l-error"
            } dark:bg-white/10`}
          >
            <div className="card-body p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-neutral text-xs font-mono">
                      {schedule.subjectCode}
                    </span>
                    {!schedule.teacherId && (
                      <span className="badge badge-error text-white text-xs">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{schedule.subjectName}</h3>
                </div>

                {editingId === schedule.id ? (
                  <div className="join">
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn btn-xs join-item btn-ghost text-error"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => handleSave(schedule.id)}
                      className="btn btn-xs join-item btn-primary"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditClick(schedule)}
                    className="btn btn-xs btn-ghost text-primary"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-3 mt-2">
                {/* Teacher Selector */}
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-base-content/40" />
                  {editingId === schedule.id ? (
                    <select
                      className="select select-bordered select-xs w-full max-w-xs"
                      value={tempTeacher}
                      onChange={(e) => setTempTeacher(e.target.value)}
                    >
                      <option value="">Select Teacher...</option>
                      {MOCK_TEACHERS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`text-sm ${
                        !schedule.teacherId
                          ? "text-error font-semibold italic"
                          : ""
                      }`}
                    >
                      {schedule.teacherId
                        ? MOCK_TEACHERS.find((t) => t.id === schedule.teacherId)
                            ?.name
                        : "No teacher assigned"}
                    </span>
                  )}
                </div>

                {/* Time Selector */}
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-base-content/40" />
                  {editingId === schedule.id ? (
                    <input
                      type="text"
                      className="input input-bordered input-xs w-full max-w-xs"
                      value={tempTime}
                      placeholder="e.g. 08:00 AM - 09:30 AM"
                      onChange={(e) => setTempTime(e.target.value)}
                    />
                  ) : (
                    <span className="text-sm">
                      {schedule.timeSlot || "Time TBD"}
                    </span>
                  )}
                </div>

                {/* Room Selector */}
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} className="text-base-content/40" />
                  {editingId === schedule.id ? (
                    <input
                      type="text"
                      className="input input-bordered input-xs w-full max-w-xs"
                      value={tempRoom}
                      placeholder="e.g. RM-304"
                      onChange={(e) => setTempRoom(e.target.value)}
                    />
                  ) : (
                    <span className="text-sm">
                      {schedule.room || "Room TBD"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
