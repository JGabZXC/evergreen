import { useState } from "react";
import {
  Plus,
  Edit2,
  AlertCircle,
  Users,
  GraduationCap,
  Calendar,
} from "lucide-react";
import {
  useSections,
  useCreateSection,
  useUpdateSection,
} from "../hooks/useSections";
import SectionModal from "./SectionModal";
import type { Section, CreateSectionPayload } from "../types";
import { AnimatePresence, motion } from "framer-motion";

export default function SectionList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const ITEMS_PER_PAGE = 10;

  const { sections, totalPages, loading, error, refetch } = useSections(
    currentPage,
    ITEMS_PER_PAGE
  );

  const { loading: createLoading, create } = useCreateSection();
  const { loading: updateLoading, update } = useUpdateSection();

  const handleAddClick = () => {
    setSelectedSection(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (section: Section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateSectionPayload) => {
    let success = false;
    if (selectedSection) {
      success = await update(selectedSection._id, data);
    } else {
      success = await create(data);
    }

    if (success) {
      refetch();
    }
    return success;
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

      <div className="flex justify-end">
        <button onClick={handleAddClick} className="btn btn-primary gap-2">
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
                          Adviser ID: {section.adviserId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="space-y-2 text-sm">
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
                        {section.currentCapacity} / {section.capacity}
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
        onSubmit={handleModalSubmit}
        initialData={selectedSection}
        isLoading={createLoading || updateLoading}
      />
    </div>
  );
}
