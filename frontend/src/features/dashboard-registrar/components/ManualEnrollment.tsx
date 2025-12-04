import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Search,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  ArrowRightCircle,
  RefreshCw,
} from "lucide-react";

// --- Mock Interfaces based on your Backend Models ---
type EnrollmentType = "new" | "existing";

interface StudentSearchResult {
  studentId: string;
  name: string;
  currentProgram?: string; // specific to existing
  lastEnrollment?: {
    gradeLevel: string;
    semester: number;
    status: "Enrolled" | "Dropped" | "Completed" | "Failed";
    failedSubjects: string[]; // List of subject IDs failed
  };
}

// --- Mock Data for Dropdowns ---
const COURSES = [
  "BS Computer Science",
  "BS Information Technology",
  "BS Accountancy",
  "BS Nursing",
  "STEM",
  "ABM",
];

const SEMESTERS = [
  { value: 1, label: "1st Semester" },
  { value: 2, label: "2nd Semester" },
  { value: 3, label: "Summer" },
];

export default function ManualEnrollment() {
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>("new");
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [student, setStudent] = useState<StudentSearchResult | null>(null);

  // Form States
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [schoolYear, setSchoolYear] = useState("2024-2025");
  const [section, setSection] = useState("");

  // Logic State for Existing Students
  const [eligibility, setEligibility] = useState<{
    canEnroll: boolean;
    reason: string;
    recommendedLevel?: string;
    recommendedSemester?: number;
  } | null>(null);

  // --- Handlers ---

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;

    setIsSearching(true);
    setStudent(null);
    setEligibility(null);

    // SIMULATE API CALL TO BACKEND
    // In real app: await api.get(`/students/${searchId}`)
    setTimeout(() => {
      // Mocking results based on input for demonstration
      if (enrollmentType === "new") {
        // Scenario: Student Registered but no Enrollment Record yet
        setStudent({
          studentId: searchId,
          name: "Juan Dela Cruz (New)",
        });
        setSelectedSemester(1); // Default to 1 for new
      } else {
        // Scenario: Existing Student Logic
        // Simulate a student who passed everything
        if (searchId.endsWith("1")) {
          setStudent({
            studentId: searchId,
            name: "Maria Clara (Regular)",
            currentProgram: "BS Computer Science",
            lastEnrollment: {
              gradeLevel: "1st Year",
              semester: 1,
              status: "Completed",
              failedSubjects: [],
            },
          });
          // Logic: Move to Sem 2
          setEligibility({
            canEnroll: true,
            reason: "Student passed all subjects. Eligible for next semester.",
            recommendedLevel: "1st Year",
            recommendedSemester: 2,
          });
          setSelectedSemester(2);
        }
        // Simulate a student with failures
        else {
          setStudent({
            studentId: searchId,
            name: "Jose Rizal (Irregular)",
            currentProgram: "BS Computer Science",
            lastEnrollment: {
              gradeLevel: "1st Year",
              semester: 2,
              status: "Failed",
              failedSubjects: ["MATH-101", "PROG-102"],
            },
          });
          // Logic: Cannot move to 2nd Year fully
          setEligibility({
            canEnroll: false, // Or true but with restrictions
            reason:
              "Student failed 2 subjects (MATH-101, PROG-102). Cannot advance to 2nd Year fully.",
            recommendedLevel: "1st Year", // Retain
            recommendedSemester: 2, // Repeat Sem? Or Summer?
          });
          setSelectedSemester(3); // Suggest Summer
        }
      }
      setIsSearching(false);
    }, 1000);
  };

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    // CALL API TO CREATE ENROLLMENT RECORD
    alert(
      `Successfully Enrolled ${student?.name} for Sem ${selectedSemester}!`
    );
    // Reset
    setStudent(null);
    setSearchId("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Type Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manual Enrollment</h1>
          <p className="text-base-content/70">
            Create enrollment records for students.
          </p>
        </div>

        <div className="join bg-base-200 p-1 rounded-lg">
          <button
            className={`join-item btn btn-sm px-6 ${
              enrollmentType === "new" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => {
              setEnrollmentType("new");
              setStudent(null);
            }}
          >
            New Enrollee
          </button>
          <button
            className={`join-item btn btn-sm px-6 ${
              enrollmentType === "existing" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => {
              setEnrollmentType("existing");
              setStudent(null);
            }}
          >
            Existing Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Search */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Search size={20} />
                Find Student
              </h3>
              <form onSubmit={handleSearch}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Student ID</span>
                  </label>
                  <div className="join w-full">
                    <input
                      type="text"
                      placeholder="e.g. 2024-0001"
                      className="input input-bordered join-item w-full"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary join-item"
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <ArrowRightCircle size={20} />
                      )}
                    </button>
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      {enrollmentType === "new"
                        ? "Search for registered applicants."
                        : "Search for current students."}
                    </span>
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* Guidelines Panel */}
          <div className="card bg-base-100/50 border-2 border-dashed border-base-300">
            <div className="card-body p-5 text-sm">
              <h4 className="font-bold text-base-content/70">
                Enrollment Rules
              </h4>
              <ul className="list-disc list-inside space-y-1 text-base-content/60 mt-2">
                {enrollmentType === "new" ? (
                  <>
                    <li>Student must be registered in the system first.</li>
                    <li>Semester defaults to 1st Semester.</li>
                    <li>Select Program carefully.</li>
                  </>
                ) : (
                  <>
                    <li>System checks previous grades automatically.</li>
                    <li>Failed subjects block "Moving Up".</li>
                    <li>Irregular students must be advised manually.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Col: Enrollment Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!student ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-base-content/30 border-2 border-dashed border-base-300 rounded-2xl bg-base-100"
              >
                <UserCheck size={48} className="mb-4" />
                <p>Search for a student ID to begin enrollment.</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-xl"
              >
                {/* Student Profile Header */}
                <div className="bg-primary/10 p-6 border-b border-base-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">
                        {student.name}
                      </h2>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="badge badge-outline font-mono">
                          {student.studentId}
                        </span>
                        {student.currentProgram && (
                          <span className="flex items-center gap-1 opacity-70">
                            <BookOpen size={14} /> {student.currentProgram}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Status Badge for Existing */}
                    {enrollmentType === "existing" && eligibility && (
                      <div
                        className={`badge badge-lg gap-2 p-4 ${
                          eligibility.canEnroll
                            ? "badge-success text-white"
                            : "badge-error text-white"
                        }`}
                      >
                        {eligibility.canEnroll ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <AlertCircle size={16} />
                        )}
                        {eligibility.canEnroll ? "Eligible" : "Issues Found"}
                      </div>
                    )}
                  </div>

                  {/* Existing Student Feedback Alert */}
                  {enrollmentType === "existing" && eligibility && (
                    <div
                      className={`alert mt-4 shadow-sm ${
                        eligibility.canEnroll
                          ? "alert-success/20 text-success-content"
                          : "alert-error/20 text-error-content"
                      }`}
                    >
                      {eligibility.canEnroll ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <div className="text-sm">
                        <span className="font-bold block">
                          System Evaluation:
                        </span>
                        {eligibility.reason}
                        {eligibility.canEnroll && (
                          <div className="mt-1 font-mono text-xs opacity-80">
                            Recommended: {eligibility.recommendedLevel} - Sem{" "}
                            {eligibility.recommendedSemester}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleEnroll} className="card-body space-y-4">
                  {/* --- NEW ENROLLMENT FIELDS --- */}
                  {enrollmentType === "new" && (
                    <div className="form-control">
                      <label className="label font-bold">
                        Select Program / Course
                      </label>
                      <select
                        className="select select-bordered w-full"
                        required
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                      >
                        <option value="" disabled>
                          Select a course...
                        </option>
                        {COURSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* --- COMMON FIELDS --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Semester Selection */}
                    <div className="form-control">
                      <label className="label font-bold">Semester</label>
                      <select
                        className="select select-bordered w-full"
                        value={selectedSemester}
                        onChange={(e) =>
                          setSelectedSemester(Number(e.target.value))
                        }
                        // If existing and eligible, maybe lock this or warn?
                      >
                        {SEMESTERS.map((sem) => (
                          <option key={sem.value} value={sem.value}>
                            {sem.label}
                          </option>
                        ))}
                      </select>
                      <label className="label">
                        <span className="label-text-alt text-warning flex items-center gap-1">
                          {enrollmentType === "new" &&
                            selectedSemester !== 1 && (
                              <>
                                {" "}
                                <AlertCircle size={12} /> Confirming
                                non-standard entry?{" "}
                              </>
                            )}
                        </span>
                      </label>
                    </div>

                    {/* School Year */}
                    <div className="form-control">
                      <label className="label font-bold">School Year</label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                          size={18}
                        />
                        <input
                          type="text"
                          className="input input-bordered w-full pl-10"
                          value={schoolYear}
                          onChange={(e) => setSchoolYear(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section Assignment */}
                  <div className="form-control">
                    <label className="label font-bold">Assign Section</label>
                    <input
                      type="text"
                      placeholder="e.g. BSCS-1A"
                      className="input input-bordered w-full"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      required
                    />
                  </div>

                  <div className="divider"></div>

                  <div className="card-actions justify-end">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setStudent(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary gap-2"
                      // Disable if existing student has strict block (optional based on rules)
                      // disabled={enrollmentType === 'existing' && !eligibility?.canEnroll}
                    >
                      <Save size={18} />
                      Confirm Enrollment
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
