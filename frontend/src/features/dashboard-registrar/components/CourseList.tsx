import { useEffect, useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import { useCourses } from "../hooks/useCourses";
import CourseModal from "./CourseModal";
import type { Course, CreateCoursePayload } from "../types";

export default function CourseList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "shs" | "college">(
    "ALL"
  ); // 'ALL', 'shs', 'college'
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const ITEMS_PER_PAGE = 10;

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const {
    courses,
    totalPages,
    loading,
    error,
    addCourse,
    editCourse,
    submitting,
  } = useCourses(currentPage, ITEMS_PER_PAGE, debouncedSearch, levelFilter);

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddClick = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateCoursePayload) => {
    if (selectedCourse) {
      return await editCourse(selectedCourse._id, data);
    } else {
      return await addCourse(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div role="alert" className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

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
                setLevelFilter(e.target.value as "ALL" | "shs" | "college");
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

        <button
          onClick={handleAddClick}
          className="btn btn-primary gap-2 w-full xl:w-auto"
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {/* Course List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <motion.div
            key={currentPage + levelFilter + searchTerm + courses.length}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-3"
          >
            {courses.map((course) => (
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
                          <h3 className="card-title text-base">
                            {course.name}
                          </h3>
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
                            onClick={() => handleEditClick(course)}
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

                            {course.curriculum.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {course.curriculum.map((item, idx) => (
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
                                          {sub.name}
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

            {courses.length === 0 && (
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
        )}
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

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedCourse}
        isLoading={submitting}
      />
    </div>
  );
}
