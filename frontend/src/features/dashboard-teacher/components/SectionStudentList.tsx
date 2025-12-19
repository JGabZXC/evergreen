import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useSections } from "../../../shared/hooks/useSections";
import { useSectionStudents } from "../../../shared/hooks/useSectionStudents";

export default function SectionStudentList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Section where adviserId is current user
  const { sections, loading: sectionLoading } = useSections(
    1,
    1,
    "",
    "",
    "",
    "",
    user?.employeeId
  );

  const section = sections.length > 0 ? sections[0] : null;

  // 2. Fetch Students for this section
  const { students, loading: studentsLoading } = useSectionStudents(
    section?._id
  );

  const loading = sectionLoading || studentsLoading;

  const filteredStudents = students.filter(
    (student) =>
      `${student.profile.firstName} ${student.profile.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl h-full flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!section) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card bg-base-100 shadow-xl h-full"
      >
        <div className="card-body items-center justify-center text-center">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="card-title text-lg">No Advisory Class</h3>
          <p className="text-gray-500">
            You are not currently assigned as an adviser to any section.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <div className="mb-6">
          <div className="flex justify-between items-center ">
            <h3 className="card-title text-lg">
              <Users className="w-5 h-5 text-primary" />
              {section.gradeLevel} - {section.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 grow-0!">
              {students.length} Students Enrolled
            </p>
          </div>
        </div>

        <div className="min-h-[400px] overflow-y-auto pr-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student..."
              className="input input-bordered input-sm w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="p-4 rounded-lg border-l-4 border-primary bg-base-200 relative group"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-10">
                        <span className="text-sm font-bold">
                          {student.profile.firstName[0]}
                          {student.profile.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-base-content">
                        {student.profile.lastName}, {student.profile.firstName}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {student.studentId}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No students found.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
