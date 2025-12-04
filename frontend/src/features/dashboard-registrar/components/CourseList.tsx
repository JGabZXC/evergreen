import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Filter,
  ChevronDown,
  ChevronUp,
  BookCopy,
  CalendarDays,
} from "lucide-react";

// --- Interfaces (Adapted as requested) ---

type GradeLevel =
  | "Grade 11"
  | "Grade 12"
  | "1st Year"
  | "2nd Year"
  | "3rd Year"
  | "4th Year";
type Semester = "1st Semester" | "2nd Semester" | "Summer";

export interface SubjectToBeTaken {
  semester: Semester;
  gradeLevel: GradeLevel;
  subject: string[]; // Changed to string[] as requested (representing populated ObjectIds)
}

export interface BaseCourse {
  name: string;
  code: string;
  gradeAvailable: "shs" | "college";
  subjectToBeTaken: SubjectToBeTaken[];
}

export interface Course extends BaseCourse {
  _id: string; // Changed to string
  createdAt: string; // Changed to string
  updatedAt: string; // Changed to string
}

// --- Mock Data ---

const MOCK_COURSES: Course[] = [
  {
    _id: "c1",
    name: "Bachelor of Science in Computer Science",
    code: "BSCS",
    gradeAvailable: "college",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subjectToBeTaken: [
      {
        gradeLevel: "1st Year",
        semester: "1st Semester",
        subject: [
          "Intro to Computing",
          "Computer Programming 1",
          "Mathematics in Modern World",
        ],
      },
      {
        gradeLevel: "1st Year",
        semester: "2nd Semester",
        subject: [
          "Computer Programming 2",
          "Discrete Structures",
          "Purposive Communication",
        ],
      },
    ],
  },
  {
    _id: "c2",
    name: "Science, Technology, Engineering, and Mathematics",
    code: "STEM",
    gradeAvailable: "shs",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subjectToBeTaken: [
      {
        gradeLevel: "Grade 11",
        semester: "1st Semester",
        subject: ["Pre-Calculus", "General Mathematics", "Earth Science"],
      },
    ],
  },
  {
    _id: "c3",
    name: "Bachelor of Science in Information Technology",
    code: "BSIT",
    gradeAvailable: "college",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subjectToBeTaken: [],
  },
];

const ITEMS_PER_PAGE = 5;

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL"); // 'ALL', 'shs', 'college'
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Filtering Logic ---
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      levelFilter === "ALL" || course.gradeAvailable === levelFilter;

    return matchesSearch && matchesLevel;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCourses = filteredCourses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filter */}
      <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto flex-1">
          {/* Search Bar */}
          <div className="input input-bordered flex items-center gap-2 flex-1 w-full md:w-auto">
            <Search size={18} className="text-base-content/60" />
            <input
              type="text"
              placeholder="Search courses..."
              className="grow min-w-[150px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Level Filter */}
          <div className="relative flex-1 md:flex-none">
            <select
              className="select select-bordered w-full pl-9"
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Levels</option>
              <option value="shs">Senior High</option>
              <option value="college">College</option>
            </select>
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none z-10"
            />
          </div>
        </div>

        <button className="btn btn-primary gap-2 w-full xl:w-auto">
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {/* Course List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage + levelFilter + searchTerm + courses.length}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="space-y-3"
        >
          {currentCourses.map((course) => (
            <motion.div
              layout // Essential for smooth expansion animation
              key={course._id}
              variants={itemVariants}
              className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow group ${
                expandedId === course._id ? "ring-1 ring-primary" : ""
              }`}
            >
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  {/* Icon Avatar */}
                  <div className="avatar placeholder">
                    <div
                      className={`rounded-lg w-12 h-12 flex items-center justify-center ${
                        course.gradeAvailable === "college"
                          ? "bg-primary text-primary-content"
                          : "bg-secondary text-secondary-content"
                      }`}
                    >
                      <GraduationCap size={24} />
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="card-title text-base">{course.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-xs opacity-70 bg-base-200 px-2 py-0.5 rounded">
                            {course.code}
                          </span>
                          <span
                            className={`badge badge-sm ${
                              course.gradeAvailable === "college"
                                ? "badge-outline badge-primary"
                                : "badge-outline badge-secondary"
                            }`}
                          >
                            {course.gradeAvailable === "shs"
                              ? "Senior High"
                              : "College"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-1">
                        <button
                          onClick={() => console.log("Edit", course._id)}
                          className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleExpand(course._id)}
                          className="btn btn-ghost btn-xs gap-1 text-base-content/60"
                        >
                          {expandedId === course._id ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Curriculum Section */}
                    <AnimatePresence>
                      {expandedId === course._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            marginTop: 16,
                          }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="divider my-0 mb-4"></div>

                          <div className="flex items-center gap-2 mb-3 text-sm font-semibold opacity-70">
                            <BookCopy size={16} />
                            <span>Curriculum Subjects</span>
                          </div>

                          {course.subjectToBeTaken.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {course.subjectToBeTaken.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-base-200/50 rounded-lg p-3 text-sm border border-base-200"
                                >
                                  <div className="flex justify-between items-center mb-2 border-b border-base-300 pb-1">
                                    <span className="font-bold text-primary text-xs uppercase">
                                      {item.gradeLevel}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs opacity-60">
                                      <CalendarDays size={12} />
                                      {item.semester}
                                    </span>
                                  </div>
                                  <ul className="list-disc list-inside space-y-1">
                                    {item.subject.map((sub, sIdx) => (
                                      <li
                                        key={sIdx}
                                        className="text-base-content/80 text-xs"
                                      >
                                        {sub}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-base-content/40 italic text-center py-2">
                              No subjects configured yet.
                            </p>
                          )}

                          <div className="mt-4 text-[10px] text-base-content/30 text-right">
                            ID: {course._id} • Updated:{" "}
                            {new Date(course.updatedAt).toLocaleDateString()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {currentCourses.length === 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center py-12">
                <GraduationCap
                  size={48}
                  className="text-base-content/30 mb-3"
                />
                <p className="text-base-content/60">No courses found</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination (Same generic logic as SubjectList) */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`join-item btn btn-sm ${
                  currentPage === page ? "btn-active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="join-item btn btn-sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
