import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Plus } from "lucide-react";

// Sample JSON data
const sampleSubjects = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "Mathematics",
    subjectId: "MATH-101",
    description: "Basic arithmetic and algebra",
    targetGradeLevels: ["G-7", "G-8", "G-9"],
    semesterAvailable: [1, 2],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439012",
    name: "Science",
    subjectId: "SCI-101",
    description: "Introduction to physical and natural sciences",
    targetGradeLevels: ["G-7", "G-8"],
    semesterAvailable: [1, 2],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439013",
    name: "English",
    subjectId: "ENG-101",
    description: "Grammar, composition, and literature",
    targetGradeLevels: ["G-7", "G-8", "G-9", "G-10"],
    semesterAvailable: [1, 2],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439014",
    name: "Filipino",
    subjectId: "FIL-101",
    description: "Wika at Panitikan",
    targetGradeLevels: ["G-7", "G-8", "G-9"],
    semesterAvailable: [1, 2],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439015",
    name: "Physical Education",
    subjectId: "PE-101",
    description: "Health and fitness activities",
    targetGradeLevels: ["G-7", "G-8", "G-9", "G-10"],
    semesterAvailable: [1, 2],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439016",
    name: "Computer Science",
    subjectId: "CS-201",
    description: "Programming fundamentals and algorithms",
    targetGradeLevels: ["SHS-11", "SHS-12"],
    semesterAvailable: [1, 2],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439017",
    name: "History",
    subjectId: "HIST-101",
    description: "World history and civilization",
    targetGradeLevels: ["G-9", "G-10"],
    semesterAvailable: [1],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439018",
    name: "Arts",
    subjectId: "ART-101",
    description: "Visual and performing arts",
    targetGradeLevels: ["G-7", "G-8"],
    semesterAvailable: [1, 2],
    active: true,
    createdBy: "admin",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
];

const ITEMS_PER_PAGE = 5;

export default function SubjectList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects] = useState(sampleSubjects);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
    description: "",
    targetGradeLevels: [] as string[],
    semesterAvailable: [] as number[],
  });

  // Filter subjects
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSubjects = filteredSubjects.slice(startIndex, endIndex);

  // Handle modal
  useEffect(() => {
    if (!modalRef.current) return;
    isModalOpen ? modalRef.current.showModal() : modalRef.current.close();
  }, [isModalOpen]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      subjectId: "",
      description: "",
      targetGradeLevels: [],
      semesterAvailable: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    handleCloseModal();
  };

  const handleGradeLevelToggle = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      targetGradeLevels: prev.targetGradeLevels.includes(grade)
        ? prev.targetGradeLevels.filter((g) => g !== grade)
        : [...prev.targetGradeLevels, grade],
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full">
          <div className="input input-bordered flex items-center gap-2">
            <Search size={18} className="text-base-content/60" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="grow"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <button
          className="btn btn-primary gap-2 w-full sm:w-auto"
          onClick={handleOpenModal}
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {/* Subject List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="space-y-3"
        >
          {currentSubjects.map((subject) => (
            <motion.div
              key={subject._id}
              variants={itemVariants}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  {/* Fixed Icon Alignment */}
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-lg w-12 h-12 flex items-center justify-center">
                      <BookOpen size={24} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="card-title text-base">{subject.name}</h3>
                        <p className="text-sm text-base-content/60">
                          {subject.subjectId}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {subject.active ? (
                          <div className="badge badge-success badge-sm">
                            Active
                          </div>
                        ) : (
                          <div className="badge badge-error badge-sm">
                            Inactive
                          </div>
                        )}
                        <span className="text-xs text-base-content/50">
                          Sem {subject.semesterAvailable.join(", ")}
                        </span>
                      </div>
                    </div>
                    {subject.description && (
                      <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {subject.targetGradeLevels.slice(0, 4).map((grade) => (
                        <div
                          key={grade}
                          className="badge badge-outline badge-sm"
                        >
                          {grade}
                        </div>
                      ))}
                      {subject.targetGradeLevels.length > 4 && (
                        <div className="badge badge-ghost badge-sm">
                          +{subject.targetGradeLevels.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {currentSubjects.length === 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center py-12">
                <BookOpen size={48} className="text-base-content/30 mb-3" />
                <p className="text-base-content/60">No subjects found</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
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

      {/* Add Subject Modal */}
      <dialog ref={modalRef} className="modal" onCancel={handleCloseModal}>
        <div className="modal-box max-w-3xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleCloseModal}
              type="button"
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Add New Subject</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Subject Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Mathematics"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Subject ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g., MATH-101"
                className="input input-bordered w-full"
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Brief description of the subject"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Target Grade Levels</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border border-base-300 rounded-lg max-h-48 overflow-y-auto">
                {[
                  { value: "G-7", label: "Grade 7" },
                  { value: "G-8", label: "Grade 8" },
                  { value: "G-9", label: "Grade 9" },
                  { value: "G-10", label: "Grade 10" },
                  { value: "SHS-11", label: "Grade 11 (SHS)" },
                  { value: "SHS-12", label: "Grade 12 (SHS)" },
                  { value: "COL-1", label: "College 1" },
                  { value: "COL-2", label: "College 2" },
                  { value: "COL-3", label: "College 3" },
                  { value: "COL-4", label: "College 4" },
                ].map((grade) => (
                  <label
                    key={grade.value}
                    className="label cursor-pointer justify-start gap-2"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={formData.targetGradeLevels.includes(grade.value)}
                      onChange={() => handleGradeLevelToggle(grade.value)}
                    />
                    <span className="label-text">{grade.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Semester Available</span>
              </label>
              <div className="flex gap-4 flex-wrap">
                {[
                  { value: 1, label: "1st Semester" },
                  { value: 2, label: "2nd Semester" },
                  { value: 3, label: "3rd Semester" },
                ].map((semester) => (
                  <label
                    key={semester.value}
                    className="label cursor-pointer gap-2"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.semesterAvailable.includes(
                        semester.value
                      )}
                      onChange={(e) => {
                        const semesters = e.target.checked
                          ? [...formData.semesterAvailable, semester.value]
                          : formData.semesterAvailable.filter(
                              (s) => s !== semester.value
                            );
                        setFormData({
                          ...formData,
                          semesterAvailable: semesters,
                        });
                      }}
                    />
                    <span className="label-text">{semester.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Subject
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseModal}>close</button>
        </form>
      </dialog>
    </div>
  );
}
