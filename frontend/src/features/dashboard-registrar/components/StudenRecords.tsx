import { useState } from "react";
import type { Student } from "../types";
import { Search, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const INITIAL_STUDENTS: Student[] = [
  {
    id: "2023-0001",
    name: "Juan Dela Cruz",
    program: "BS Computer Science",
    yearLevel: "1st Year",
    status: "Enrolled",
    dateEnrolled: "2023-08-15",
  },
  {
    id: "2023-0045",
    name: "Maria Clara",
    program: "BS Nursing",
    yearLevel: "2nd Year",
    status: "Enrolled",
    dateEnrolled: "2023-08-16",
  },
  {
    id: "2023-0102",
    name: "Jose Rizal",
    program: "AB Political Science",
    yearLevel: "3rd Year",
    status: "Pending",
    dateEnrolled: "2023-08-18",
  },
];

export default function StudentRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredStudents = INITIAL_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.includes(searchTerm)
  );

  return (
    <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden dark:border-white/50">
      <div className="p-6 border-b border-base-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold">Enrolled Students Database</h2>
        <div className="join w-full md:w-auto">
          <input
            className="input input-bordered join-item w-full md:w-64"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn join-item btn-square">
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-base-200 dark:bg-white/10">
            <tr>
              <th>ID Number</th>
              <th>Student Name</th>
              <th>Program</th>
              <th>Year</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredStudents.map((student) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="odd:bg-base-100 even:bg-base-200 dark:even:bg-white/10"
                >
                  <td className="font-mono opacity-70">{student.id}</td>
                  <td className="font-bold">{student.name}</td>
                  <td>{student.program}</td>
                  <td>{student.yearLevel}</td>
                  <td>
                    <span
                      className={`badge ${
                        student.status === "Enrolled"
                          ? "badge-success text-white"
                          : "badge-warning text-white"
                      } gap-2`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-xs text-info">
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center text-base-content/50">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No students found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
