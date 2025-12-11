import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Semester } from "../types";
import {
  useSubjects,
  useCreateSubjects,
  useUpdateSubjects,
} from "../hooks/useSubjects";
import { toast } from "react-toastify";

// Available grades for filter and form
const SEMESTER_OPTION = [
  { value: Semester.First, label: "1" },
  { value: Semester.Second, label: "2" },
  { value: Semester.Third, label: "3" },
];

export default function SubjectList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { subjects, totalPages, loading, refetch } = useSubjects(
    currentPage,
    ITEMS_PER_PAGE,
    debouncedSearch,
    semesterFilter,
    statusFilter
  );
  const { loading: createLoading, create } = useCreateSubjects();
  const { loading: updateLoading, update } = useUpdateSubjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
    description: "",
    semesterAvailable: [] as Semester[],
    active: true,
  });

  // Handle modal
  useEffect(() => {
    if (!modalRef.current) return;
    isModalOpen ? modalRef.current.showModal() : modalRef.current.close();
  }, [isModalOpen]);

  const handleOpenModal = (subjectToEdit: any = null) => {
    if (subjectToEdit) {
      // Edit Mode
      setIsEditing(true);
      setEditingId(subjectToEdit._id);
      setFormData({
        name: subjectToEdit.name,
        subjectId: subjectToEdit.subjectId,
        description: subjectToEdit.description,
        semesterAvailable: subjectToEdit.semesterAvailable,
        active: subjectToEdit.active,
      });
    } else {
      // Add Mode
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        name: "",
        subjectId: "",
        description: "",
        semesterAvailable: [],
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        name: "",
        subjectId: "",
        description: "",
        semesterAvailable: [],
        active: true,
      });
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
        toast.success("Subject created successfully");
      }

      handleCloseModal();
      refetch();
    } catch (error: any) {
      console.error("Failed to save subject:", error);
      toast.error(error.response?.data?.message || "Failed to save subject");
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Header with Search, Filter, and Add Button */}
      <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto flex-1">
          {/* Search Bar */}
          <div className="input input-bordered flex items-center gap-2 flex-1 w-full md:w-auto">
            <Search size={18} className="text-base-content/60" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="grow min-w-[150px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {/* Grade Filter Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <select
                className="select select-bordered w-full pl-9"
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Semesters</option>
                {SEMESTER_OPTION.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Added z-10 here to keep icon above the select focus state */}
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none z-10"
              />
            </div>

            {/* NEW Status Filter Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <select
                className="select select-bordered w-full pl-9"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <CheckCircle2
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none z-10"
              />
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary gap-2 w-full xl:w-auto"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {/* Subject List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <motion.div
            key={
              currentPage +
              semesterFilter +
              statusFilter +
              debouncedSearch +
              subjects.length
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-3"
          >
            {subjects.map((subject) => (
              <motion.div
                layout
                key={subject._id}
                variants={itemVariants}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="card-body p-4">
                  <div className="flex items-start gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-lg w-12 h-12 flex items-center justify-center">
                        <BookOpen size={24} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="card-title text-base">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-base-content/60">
                            {subject.subjectId}
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
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

                          <button
                            onClick={() => handleOpenModal(subject)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </div>
                      {subject.description && (
                        <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {subjects.length === 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body items-center text-center py-12">
                  <BookOpen size={48} className="text-base-content/30 mb-3" />
                  <p className="text-base-content/60">No subjects found</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
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

          <h3 className="font-bold text-lg mb-4">
            {isEditing ? "Edit Subject" : "Add New Subject"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Form fields ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Semester Available</span>
                </label>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: 1, label: "1st Sem" },
                    { value: 2, label: "2nd Sem" },
                    { value: 3, label: "3rd Sem" },
                  ].map((semester) => (
                    <label
                      key={semester.value}
                      className="label cursor-pointer gap-2"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
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

              {isEditing && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="label-text">Active</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action justify-end mt-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                  disabled={createLoading || updateLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading || updateLoading}
                >
                  {(createLoading || updateLoading) && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                  {isEditing ? "Save Changes" : "Add Subject"}
                </button>
              </div>
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
