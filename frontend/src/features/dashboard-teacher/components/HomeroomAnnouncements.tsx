import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Pencil, Trash2, X } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  type: "urgent" | "normal";
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Homeroom PTA Meeting",
    date: "Oct 30, 2025",
    content: "Meeting with parents regarding the upcoming school fair.",
    type: "urgent",
  },
  {
    id: 2,
    title: "Class Fund Collection",
    date: "Nov 05, 2025",
    content: "Deadline for class fund contribution is next week.",
    type: "normal",
  },
];

export default function HomeroomAnnouncements() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: "urgent" | "normal";
  }>({
    title: "",
    content: "",
    type: "normal",
  });

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        type: "normal",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const date = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, ...formData, date } // Update date on edit? Or keep original? Let's update for now.
            : item
        )
      );
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        ...formData,
        date,
      };
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <div className="flex justify-between  items-center mb-6">
            <h3 className="card-title text-2xl flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-accent" />
              Homeroom Updates (Grade 10-A)
            </h3>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary btn-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>

          <div className="min-h-[400px] overflow-y-auto">
            <div className="flex flex-col gap-4">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No announcements yet.
                </div>
              ) : (
                announcements.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-base-200 rounded-lg border-l-4 border-base-300 relative group"
                    style={{
                      borderLeftColor:
                        item.type === "urgent"
                          ? "var(--color-error)"
                          : "var(--color-secondary)",
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          {item.type === "urgent" && (
                            <span className="badge badge-error badge-sm text-white">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.date}
                        </p>
                        <p className="text-base-content/80">{item.content}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="btn btn-ghost btn-xs btn-square text-info"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-ghost btn-xs btn-square text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <dialog className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-box"
            >
              <button
                onClick={handleCloseModal}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-lg mb-4">
                {editingId ? "Edit Announcement" : "New Announcement"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input input-bordered w-full"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Parent Teacher Meeting"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "urgent" | "normal",
                      })
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Content</span>
                  </label>
                  <textarea
                    required
                    className="textarea textarea-bordered h-24"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter announcement details..."
                  ></textarea>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "Save Changes" : "Post Announcement"}
                  </button>
                </div>
              </form>
            </motion.div>
            <div className="modal-backdrop" onClick={handleCloseModal}></div>
          </dialog>
        )}
      </AnimatePresence>
    </>
  );
}
