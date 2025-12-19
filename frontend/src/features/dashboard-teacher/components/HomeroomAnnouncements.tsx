import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Trash2, X, Edit2 } from "lucide-react";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useSections } from "../../../shared/hooks/useSections";
import { useAnnouncements } from "../../../shared/hooks/useAnnouncements";
import { toast } from "react-toastify";
import { getCurrentSchoolYear } from "../../../utils/schoolYear";
import { Semester } from "../../../shared/types/index.ts";

export default function HomeroomAnnouncements() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const currentYear = getCurrentSchoolYear();
  const currentSemester = Semester.First.toString();

  // 2. Fetch Announcements for this section
  const {
    announcements,
    loading: announcementsLoading,
    addAnnouncement,
    editAnnouncement,
    removeAnnouncement,
  } = useAnnouncements(section?._id, undefined, currentYear, currentSemester);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    isImportant: boolean;
  }>({
    title: "",
    content: "",
    isImportant: false,
  });

  const handleOpenModal = (announcement?: any) => {
    if (announcement) {
      setEditingId(announcement._id);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        isImportant: announcement.isImportant,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        isImportant: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section) return;

    let success = false;
    if (editingId) {
      success = await editAnnouncement(editingId, {
        ...formData,
      });
    } else {
      success = await addAnnouncement({
        ...formData,
        targetSectionId: section._id,
        academicYear: currentYear,
        semester: currentSemester,
      });
    }

    if (success) {
      toast.success(
        editingId
          ? "Announcement updated successfully"
          : "Announcement created successfully"
      );
      handleCloseModal();
    } else {
      toast.error("Failed to save announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      const success = await removeAnnouncement(id);
      if (success) {
        toast.success("Announcement deleted successfully");
      } else {
        toast.error("Failed to delete announcement");
      }
    }
  };

  if (sectionLoading || announcementsLoading) {
    return (
      <div className="card bg-base-100 shadow-xl min-h-[200px] flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (!section) {
    return null; // Don't show if not an adviser
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-secondary" />
            Homeroom Announcements
          </h3>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-sm btn-secondary btn-outline gap-2"
          >
            <Plus size={16} />
            New
          </button>
        </div>

        <div className="space-y-4 min-h-[400px] overflow-y-auto pr-2">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`p-4 rounded-lg border-l-4 ${
                  announcement.isImportant
                    ? "bg-error/10 border-error"
                    : "bg-base-200 border-secondary"
                } relative group`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-base-content">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-base-content/60">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(announcement)}
                      className="btn btn-ghost btn-xs text-info"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No announcements yet.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
                <h3 className="font-bold text-lg">
                  {editingId ? "Edit Announcement" : "New Announcement"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="e.g., Parent Meeting"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Content</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder="Write your announcement here..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                  ></textarea>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-error"
                      checked={formData.isImportant}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isImportant: e.target.checked,
                        })
                      }
                    />
                    <span className="label-text font-medium text-error">
                      Mark as Important/Urgent
                    </span>
                  </label>
                </div>

                <div className="modal-action mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-secondary">
                    {editingId ? "Update" : "Post"} Announcement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
