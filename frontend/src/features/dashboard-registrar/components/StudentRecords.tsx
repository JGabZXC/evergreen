// frontend/src/features/dashboard-registrar/components/StudenRecords.tsx
import { useState, useEffect } from "react";
import type { Student } from "../types";
import {
  Search,
  Users,
  Loader2,
  RefreshCw,
  Eye,
  ListFilter,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getStudents } from "../services/studentService";
import StudentProfileModal from "./StudentProfileModal";

export default function StudentRecords() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"enrolled" | "all">("enrolled");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents(page, 10, viewMode, searchTerm);
      const mappedStudents: Student[] = data.students.map((s: any) => ({
        id: s.studentId,
        _id: s._id,
        name: s.profile
          ? `${s.profile.lastName}, ${s.profile.firstName}`
          : "No Profile",
        program: s.course?.code || "N/A",
        yearLevel: s.latestEnrollment?.gradeLevel || "-", // [NEW] Grade Level
        status: s.isActive ? "Active" : "Inactive",
        dateEnrolled: s.latestEnrollment
          ? new Date(s.latestEnrollment.enrollmentDate).toLocaleDateString()
          : "-",
        profile: s.profile,
        latestEnrollment: s.latestEnrollment,
      }));

      setStudents(mappedStudents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, viewMode]); // Refetch on page or mode change

  // Handle Search Debounce or Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="card bg-base-100 shadow-md border border-base-200 dark:border-white/50">
        <div className="p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users size={20} className="text-primary" />
              {viewMode === "enrolled"
                ? "Enrolled Students"
                : "All Student Records"}
            </h2>
            <span className="badge badge-ghost text-xs">
              {students.length} on page
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* View Mode Toggle */}
            <div className="join">
              <button
                className={`join-item btn btn-sm ${
                  viewMode === "enrolled"
                    ? "btn-active btn-primary"
                    : "btn-ghost"
                }`}
                onClick={() => {
                  setViewMode("enrolled");
                  setPage(1);
                }}
              >
                Enrolled
              </button>
              <button
                className={`join-item btn btn-sm ${
                  viewMode === "all" ? "btn-active btn-primary" : "btn-ghost"
                }`}
                onClick={() => {
                  setViewMode("all");
                  setPage(1);
                }}
              >
                All Students
              </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="join w-full sm:w-auto">
              <input
                className="input input-bordered input-sm join-item w-full sm:w-48"
                placeholder="Search Student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-sm btn-ghost border border-l-0 border-base-300 join-item"
              >
                <Search size={16} />
              </button>
            </form>

            <button
              className="btn btn-sm btn-ghost btn-square"
              onClick={fetchStudents}
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden dark:border-white/50">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200 dark:bg-white/10">
              <tr>
                <th>ID Number</th>
                <th>Student Name</th>
                <th>Program</th>
                <th>Grade Level</th> {/* New Column */}
                <th>Status</th>
                <th>Enrolled Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Loader2 className="animate-spin" size={32} />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 opacity-50">
                    No students found.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {students.map((student) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-base-200/50"
                    >
                      <td className="font-mono text-xs font-bold">
                        {student.id}
                      </td>
                      <td>
                        <div className="font-bold">{student.name}</div>
                        <div className="text-xs opacity-50">
                          {student.profile?.address?.city || "No City"}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {student.program}
                        </span>
                      </td>
                      <td className="font-medium text-primary">
                        {student.yearLevel !== "-" ? (
                          student.yearLevel
                        ) : (
                          <span className="opacity-30">N/A</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            student.status === "Enrolled"
                              ? "badge-success text-white"
                              : "badge-error text-white"
                          } gap-1`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="text-xs">{student.dateEnrolled}</td>
                      <td>
                        <button
                          onClick={() => openModal(student)}
                          className="btn btn-ghost btn-xs gap-1"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-center border-t border-base-200">
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                «
              </button>
              <button className="join-item btn btn-sm pointer-events-none">
                Page {page} of {totalPages}
              </button>
              <button
                className="join-item btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      <StudentProfileModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={fetchStudents}
      />
    </div>
  );
}
