import { useState, useEffect } from "react";
import type { Student } from "../types";
import { Search, Users, Loader2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getStudents } from "../services/studentService";

export default function StudentRecords() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      const mappedStudents: Student[] = data.students.map((s: any) => ({
        id: s.studentId,
        name: s.profile
          ? `${s.profile.lastName}, ${s.profile.firstName}`
          : "No Profile",
        program: s.course?.code || "N/A",
        yearLevel: "-", // TODO: Implement year level logic
        status: s.isActive ? "Enrolled" : "Dropped",
        dateEnrolled: s.createdAt
          ? new Date(s.createdAt).toLocaleDateString()
          : "-",
      }));
      setStudents(mappedStudents);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
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
          <button
            className="btn join-item btn-square"
            onClick={fetchStudents}
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
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
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <Loader2 className="animate-spin" size={32} />
                    <span>Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 opacity-50">
                  No students found.
                </td>
              </tr>
            ) : (
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
            )}
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
