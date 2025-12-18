import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  AlertCircle,
  Users,
  GraduationCap,
  Calendar,
  Search,
  Building,
} from "lucide-react";
import { useSections } from "../hooks/useSections";
import SectionModal from "./SectionModal";
import { type Section } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { getSchoolYearOptions } from "../../../utils/schoolYear";
import { GradeLevel } from "../../../shared/types/";

export default function SectionList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [capacity, setCapacity] = useState("");

  const ITEMS_PER_PAGE = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [gradeLevel, schoolYear, capacity]);

  const { sections, totalPages, loading, error, refetch } = useSections(
    currentPage,
    ITEMS_PER_PAGE,
    debouncedSearch,
    gradeLevel,
    schoolYear,
    capacity
  );

  const handleAddClick = () => {
    setSelectedSection(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (section: Section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    refetch();
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
      {error && (
        <div role="alert" className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-200 p-4 rounded-lg">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Search */}
          <div className="form-control w-full">
            <div className="input-group w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search sections..."
                  className="input input-bordered w-full pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
                  size={18}
                />
              </div>
            </div>
          </div>

          {/* Grade Level Filter */}
          <select
            className="select select-bordered w-full"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          >
            <option value="">All Grade Levels</option>
            <option value={GradeLevel.Grade7}>Grade 7</option>
            <option value={GradeLevel.Grade8}>Grade 8</option>
            <option value={GradeLevel.Grade9}>Grade 9</option>
            <option value={GradeLevel.Grade10}>Grade 10</option>
            <option value={GradeLevel.Grade11}>Grade 11</option>
            <option value={GradeLevel.Grade12}>Grade 12</option>
          </select>

          {/* School Year Filter */}
          <select
            className="select select-bordered w-full"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
          >
            <option value="">All School Years</option>
            {getSchoolYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Capacity Filter */}
          <select
            className="select select-bordered w-full"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          >
            <option value="">Any Capacity</option>
            <option value="30">30 Students</option>
            <option value="40">40 Students</option>
            <option value="50">50 Students</option>
            <option value="60">60 Students</option>
          </select>
        </div>

        <button
          onClick={handleAddClick}
          className="btn btn-primary gap-2 whitespace-nowrap"
        >
          <Plus size={18} />
          Add Section
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <motion.div
            key={currentPage + sections.length}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {sections.map((section) => (
              <motion.div
                key={section._id}
                variants={itemVariants}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{section.name}</h3>
                        <p className="text-xs text-base-content/60">
                          Adviser ID:{" "}
                          {section.adviserId
                            ? typeof section.adviserId === "object"
                              ? section.adviserId.employeeId
                              : section.adviserId
                            : "TBA"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-base-content/70">
                      <Building size={16} />
                      <span>
                        {typeof section.designatedRoom === "object"
                          ? section.designatedRoom.name
                          : section.designatedRoom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/70">
                      <GraduationCap size={16} />
                      <span>{section.gradeLevel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/70">
                      <Calendar size={16} />
                      <span>SY: {section.schoolYear}</span>
                    </div>
                    <div className="flex items-center justify-between text-base-content/70">
                      <span className="flex items-center gap-2">
                        <Users size={16} />
                        Capacity
                      </span>
                      <span className="badge badge-ghost">
                        {section.currentCapacity} /{" "}
                        {typeof section.designatedRoom === "object"
                          ? section.designatedRoom.capacity
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => handleEditClick(section)}
                      className="btn btn-sm btn-ghost"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {sections.length === 0 && (
              <div className="col-span-full text-center py-10 text-base-content/50">
                No sections found.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

      <SectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={selectedSection}
      />
    </div>
  );
}
