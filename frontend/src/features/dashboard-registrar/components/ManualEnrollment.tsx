// frontend/src/features/dashboard-registrar/components/ManualEnrollment.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Search,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRightCircle,
  Award,
  X,
  School,
  GraduationCap,
} from "lucide-react";
import { toast } from "react-toastify";
// [FIX] Imports pointed to the correct service file defined previously
import {
  creditStudentSubjects,
  enrollStudent,
  getAllSubjects,
  GradeLevel,
  Semester,
  type Subject,
} from "../services/enrollmentService";
import { getStudents } from "../services/studentService";

// --- Types ---
type EnrollmentType = "new" | "transferee" | "existing";

export default function ManualEnrollment() {
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>("new");
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [student, setStudent] = useState<any | null>(null);

  // Data for Crediting
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState<string[]>([]);

  // [NEW] Previous School State
  const [previousSchool, setPreviousSchool] = useState("");

  // Form States
  const [selectedSemester, setSelectedSemester] = useState(Semester.First);
  const [gradeLevel, setGradeLevel] = useState(GradeLevel.Grade11);
  const [schoolYear, setSchoolYear] = useState("2024-2025");
  const [section, setSection] = useState("");

  // Load subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getAllSubjects();
        // [FIX] Access the .subjects array from the paginated response
        if (data && Array.isArray(data.subjects)) {
          setAllSubjects(data.subjects);
        }
      } catch (e) {
        console.error("Failed to load subjects", e);
      }
    };
    loadSubjects();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    setIsSearching(true);
    setStudent(null);

    try {
      // [FIX] Added missing getStudents import usage
      const data = await getStudents(1, 1, "all", searchId);
      if (data.students && data.students.length > 0) {
        setStudent(data.students[0]);
        toast.success("Student found!");
      } else {
        toast.error("Student ID not found. Register them first.");
      }
    } catch (error) {
      toast.error("Error searching for student.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveCredits = async () => {
    if (selectedCredits.length === 0 || !student) return;

    // [FIX] Validate Previous School
    if (!previousSchool.trim()) {
      toast.error("Please enter the Previous School name.");
      return;
    }

    try {
      const payload = selectedCredits.map((subId) => ({
        studentId: student.id || student.studentId, // Handle DTO naming variations
        subjectId: subId,
        previousSchool: previousSchool,
        finalGrade: 1.0, // Default passing grade
      }));

      await creditStudentSubjects(payload);
      toast.success(
        `${selectedCredits.length} subjects credited successfully!`
      );
      setIsCreditModalOpen(false);
      setSelectedCredits([]);
      // Optional: We keep previousSchool filled in case they want to add more credits from same school
    } catch (error) {
      console.error(error);
      toast.error("Failed to save credits.");
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      const payload = {
        studentId: student.id || student.studentId,
        schoolYear,
        semester: selectedSemester,
        gradeLevel,
        classroom: section || undefined, // Send strictly undefined if empty
      };

      await enrollStudent(payload);
      toast.success(`Successfully Enrolled ${student.name}!`);

      // Reset Form
      setStudent(null);
      setSearchId("");
      setSection("");
      setPreviousSchool("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Enrollment failed.");
    }
  };

  const toggleCreditSubject = (subjectId: string) => {
    if (selectedCredits.includes(subjectId)) {
      setSelectedCredits(selectedCredits.filter((id) => id !== subjectId));
    } else {
      setSelectedCredits([...selectedCredits, subjectId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Enrollment & Assessment</h1>
          <p className="text-base-content/70">
            Manage student enrollment and credit transfers.
          </p>
        </div>

        <div className="join bg-base-200 p-1 rounded-lg">
          <button
            className={`join-item btn btn-sm px-6 ${
              enrollmentType === "new" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setEnrollmentType("new")}
          >
            New
          </button>
          <button
            className={`join-item btn btn-sm px-6 ${
              enrollmentType === "transferee" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setEnrollmentType("transferee")}
          >
            Transferee
          </button>
          <button
            className={`join-item btn btn-sm px-6 ${
              enrollmentType === "existing" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setEnrollmentType("existing")}
          >
            Old Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card bg-base-100 shadow-md border border-base-200">
            <div className="card-body p-5">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Search size={20} /> Find Student
              </h3>
              <form onSubmit={handleSearch}>
                <div className="form-control">
                  <div className="join w-full">
                    <input
                      type="text"
                      placeholder="Student ID..."
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
                </div>
              </form>
            </div>
          </div>

          <div className="alert alert-info text-xs shadow-sm">
            <AlertCircle size={16} />
            <span>
              {enrollmentType === "transferee"
                ? "For transferees, credit their passed subjects BEFORE enrolling."
                : "Ensure the student is registered in the system before enrolling."}
            </span>
          </div>
        </div>

        {/* Action Panel */}
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
                <p>Search for a student to proceed.</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-xl border border-base-200"
              >
                {/* Student Header */}
                <div className="bg-base-200/50 p-6 border-b border-base-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        {student.name}
                      </h2>
                      <div className="flex gap-2 mt-2">
                        <span className="badge badge-neutral font-mono">
                          {student.id || student.studentId}
                        </span>
                        <span className="badge badge-primary badge-outline flex gap-1 items-center">
                          <GraduationCap size={12} />
                          {student.program ||
                            student.course?.code ||
                            "No Course"}
                        </span>
                      </div>
                    </div>

                    {/* Credit Button only shows for Transferee */}
                    {enrollmentType === "transferee" && (
                      <button
                        onClick={() => setIsCreditModalOpen(true)}
                        className="btn btn-warning btn-sm gap-2 shadow-sm"
                      >
                        <Award size={16} /> Credit Subjects
                      </button>
                    )}
                  </div>

                  {/* Transferee Input Section */}
                  {enrollmentType === "transferee" && (
                    <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-warning font-bold text-xs uppercase mb-2">
                        <School size={14} /> Transferee Requirement
                      </div>
                      <input
                        type="text"
                        placeholder="Enter Previous School Name (Required for crediting)"
                        className="input input-sm input-bordered w-full bg-white/50"
                        value={previousSchool}
                        onChange={(e) => setPreviousSchool(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <form onSubmit={handleEnroll} className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label font-bold">Grade Level</label>
                      <select
                        className="select select-bordered"
                        value={gradeLevel}
                        onChange={(e) =>
                          setGradeLevel(e.target.value as GradeLevel)
                        }
                      >
                        <option value={GradeLevel.Grade11}>Grade 11</option>
                        <option value={GradeLevel.Grade12}>Grade 12</option>
                        <option value={GradeLevel.College1}>1st Year</option>
                        <option value={GradeLevel.College2}>2nd Year</option>
                        <option value={GradeLevel.College3}>3rd Year</option>
                        <option value={GradeLevel.College4}>4th Year</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label font-bold">Semester</label>
                      <select
                        className="select select-bordered"
                        value={selectedSemester}
                        onChange={(e) =>
                          setSelectedSemester(Number(e.target.value))
                        }
                      >
                        <option value={Semester.First}>1st Semester</option>
                        <option value={Semester.Second}>2nd Semester</option>
                        <option value={Semester.Third}>Summer</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label font-bold">School Year</label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                          size={16}
                        />
                        <input
                          type="text"
                          className="input input-bordered pl-10 w-full"
                          value={schoolYear}
                          onChange={(e) => setSchoolYear(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label font-bold">
                        Section (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Auto-assign if empty"
                        className="input input-bordered"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4 pt-4 border-t border-base-100">
                    <button
                      type="submit"
                      className="btn btn-primary gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
                    >
                      <Save size={18} /> Process Enrollment
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Credit Transfer Modal */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-100 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          >
            <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
              <h3 className="font-bold text-lg flex gap-2 items-center">
                <Award className="text-warning" /> Credit Subjects
              </h3>
              <button
                onClick={() => setIsCreditModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-base-100">
              {/* Validation Warning inside Modal */}
              {!previousSchool && (
                <div className="alert alert-error text-xs mb-4 shadow-sm">
                  <AlertCircle size={16} />
                  <span>
                    Please enter the Previous School name in the main form
                    before saving.
                  </span>
                </div>
              )}

              <p className="text-sm opacity-70 mb-4">
                Select subjects from the curriculum that{" "}
                <span className="font-bold">{student?.name}</span> has already
                passed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allSubjects.map((sub) => (
                  <div
                    key={sub._id}
                    onClick={() => toggleCreditSubject(sub.subjectId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group ${
                      selectedCredits.includes(sub.subjectId)
                        ? "border-warning bg-warning/5"
                        : "border-base-200 hover:border-warning/50 hover:bg-base-200/50"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                        {sub.subjectId}
                      </div>
                      <div
                        className="text-xs opacity-70 truncate max-w-[200px]"
                        title={sub.description}
                      >
                        {sub.description || "No description"}
                      </div>
                    </div>
                    {selectedCredits.includes(sub.subjectId) && (
                      <CheckCircle2
                        size={18}
                        className="text-warning shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-base-200 flex justify-between items-center bg-base-200/30">
              <span className="text-sm font-bold text-base-content/70">
                {selectedCredits.length} subjects selected
              </span>
              <button
                onClick={handleSaveCredits}
                className="btn btn-primary btn-sm gap-2"
                disabled={!previousSchool} // Disable if previous school missing
              >
                <Save size={16} /> Save Credits
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
