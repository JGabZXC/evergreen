import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Search,
  UserCheck,
  AlertCircle,
  Calendar,
  ArrowRightCircle,
  Award,
  School,
  GraduationCap,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  creditStudentSubjects,
  enrollStudent,
} from "../services/enrollmentService";
import { getStudent } from "../services/studentService";

import CreditSubjectsModal, { type CreditItem } from "./CreditSubjectsModal";
import {
  getCurrentSchoolYear,
  getSchoolYearOptions,
} from "../../../utils/schoolYear";
import {
  GradeLevel,
  Semester,
  type CurriculumItem,
} from "../../../shared/types/index.ts";
import type { StudentAggregate } from "../types";

// --- Types ---
type EnrollmentType = "new" | "transferee" | "existing";

export default function ManualEnrollment() {
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>("new");
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [student, setStudent] = useState<StudentAggregate | null>(null);

  const [allSubjects, setAllSubjects] = useState<CurriculumItem[]>([]);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const [previousSchool, setPreviousSchool] = useState("");

  const [selectedSemester, setSelectedSemester] = useState(Semester.First);
  const [gradeLevel, setGradeLevel] = useState(GradeLevel.Grade11);
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [section, setSection] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    setIsSearching(true);
    setStudent(null);

    try {
      const data = await getStudent(searchId);
      if (data) {
        setStudent(data);
        const curriculum = data.course?.curriculum || [];
        const studentSubjects = curriculum.flatMap((item) => item);
        setAllSubjects(studentSubjects);
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

  const handleSaveCredits = async (credits: CreditItem[]) => {
    if (credits.length === 0 || !student) return;

    if (!previousSchool.trim()) {
      toast.error("Please enter the Previous School name.");
      return;
    }

    try {
      const payload = credits.map((item) => ({
        studentId: student.studentId,
        subject: item.subjectId,
        previousSchool: previousSchool,
        finalGrade: item.finalGrade,
      }));

      await creditStudentSubjects(payload);
      toast.success(`${credits.length} subjects credited successfully!`);
      setIsCreditModalOpen(false);
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
        studentId: student.studentId,
        schoolYear,
        semester: selectedSemester,
        gradeLevel,
        classroom: section || undefined,
      };

      await enrollStudent(payload);
      toast.success(`Successfully Enrolled ${student.studentId}!`);

      setStudent(null);
      setSearchId("");
      setSection("");
      setPreviousSchool("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Enrollment failed.");
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
                        {student.profile
                          ? `${student.profile.lastName}, ${student.profile.firstName}`
                          : "No Profile"}
                      </h2>
                      <div className="flex gap-2 mt-2">
                        <span className="badge badge-neutral font-mono">
                          {student.studentId}
                        </span>
                        <span className="badge badge-primary badge-outline flex gap-1 items-center">
                          <GraduationCap size={12} />
                          {student.course?.code || "No Course"}
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
                        <School size={14} className="z-10" /> Transferee
                        Requirement
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
                        <option value={Semester.Third}>3rd Semester</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label font-bold">School Year</label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 z-10"
                          size={16}
                        />
                        <select
                          className="select select-bordered pl-10 w-full"
                          value={schoolYear}
                          onChange={(e) => setSchoolYear(e.target.value)}
                        >
                          {getSchoolYearOptions().map((sy) => (
                            <option key={sy} value={sy}>
                              {sy}
                            </option>
                          ))}
                        </select>
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
      {student && (
        <CreditSubjectsModal
          isOpen={isCreditModalOpen}
          onClose={() => setIsCreditModalOpen(false)}
          student={student}
          allSubjects={allSubjects}
          previousSchool={previousSchool}
          onSave={handleSaveCredits}
        />
      )}
    </div>
  );
}
