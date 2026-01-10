import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Save, User, Calendar, MapPin, Phone, Loader2 } from "lucide-react";
import { updateStudentProfile, getStudentEnrollmentHistory } from "../services/studentService";
import { toast } from "react-toastify";
import type { StudentAggregate, EnrollmentRecord } from "../types";

interface Props {
  student: StudentAggregate | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Refresh parent list
}

export default function StudentProfileModal({
  student,
  isOpen,
  onClose,
  onUpdate,
}: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "history">("profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    street: "",
    city: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // History State
  const [history, setHistory] = useState<EnrollmentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const observerTarget = useRef(null);

  useEffect(() => {
    if (student && student.profile) {
      setFormData({
        firstName: student.profile.firstName || "",
        lastName: student.profile.lastName || "",
        phoneNumber: student.profile.phoneNumber || "",
        dateOfBirth: student.profile.dateOfBirth
          ? new Date(student.profile.dateOfBirth).toISOString().split("T")[0]
          : "",
        street: student.profile.address?.street || "",
        city: student.profile.address?.city || "",
      });

      // Reset history on student switch
      setHistory([]);
      setHistoryPage(1);
      setHasMoreHistory(true);
    }
  }, [student]);

  const fetchHistory = useCallback(async () => {
    if (!student || !hasMoreHistory || historyLoading) return;

    setHistoryLoading(true);
    try {
      const data = await getStudentEnrollmentHistory(student._id, historyPage, 10);
      setHistory((prev) => (historyPage === 1 ? data.history : [...prev, ...data.history]));
      setHasMoreHistory(historyPage < data.totalPages);
      setHistoryPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [student, hasMoreHistory, historyLoading, historyPage]);

  // Initial fetch when tab changes to history
  useEffect(() => {
    if (activeTab === "history" && historyPage === 1 && student) {
      fetchHistory();
    }
  }, [activeTab, student]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreHistory) {
          fetchHistory();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchHistory, hasMoreHistory]);


  if (!isOpen || !student) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Construct payload matching Backend DTO
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        address: {
          street: formData.street,
          city: formData.city,
          // Add defaults for required backend fields if missing
          state: "N/A",
          zipCode: 0,
        },
      };

      await updateStudentProfile(student._id, payload);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-base-100 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-base-200 bg-base-200/30 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16 text-2xl">
                {student.profile?.firstName?.charAt(0) || "?"}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {student.profile
                  ? `${student.profile.lastName}, ${student.profile.firstName}`
                  : "No Profile"}
              </h2>
              <div className="flex gap-2 mt-1">
                <span className="badge badge-neutral font-mono">
                  {student.studentId}
                </span>
                <span className="badge badge-outline">
                  {student.course?.code || "N/A"}
                </span>
                {student.isActive ? (
                    <span className="badge badge-success badge-outline">Active</span>
                ) : (
                    <span className="badge badge-error badge-outline">Inactive</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed rounded-none bg-base-100 px-6 pt-2">
          <a
            className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </a>
          <a
            className={`tab ${activeTab === "history" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Enrollment History
          </a>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "profile" ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex gap-2 items-center">
                      <User size={14} /> First Name
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.firstName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex gap-2 items-center">
                      <User size={14} /> Last Name
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.lastName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex gap-2 items-center">
                      <Phone size={14} /> Phone
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.phoneNumber}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex gap-2 items-center">
                      <Calendar size={14} /> Date of Birth
                    </span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.dateOfBirth}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div className="form-control col-span-2">
                  <label className="label">
                    <span className="label-text flex gap-2 items-center">
                      <MapPin size={14} /> Address
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      placeholder="Street"
                      type="text"
                      className="input input-bordered w-1/2"
                      value={formData.street}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                    <input
                      placeholder="City"
                      type="text"
                      className="input input-bordered w-1/2"
                      value={formData.city}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                {!isEditing ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success text-white gap-2"
                      disabled={loading}
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
                {history.length === 0 && !historyLoading && (
                    <div className="text-center py-10 opacity-50">
                        No enrollment history found.
                    </div>
                )}

                {history.map((record, index) => (
                    <div key={record._id || index} className="card bg-base-200 shadow-sm border border-base-300">
                        <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-lg flex items-center gap-2">
                                        SY {record.schoolYear}
                                        <span className="badge badge-sm badge-outline">
                                            {record.semester === 1 ? "1st Sem" : record.semester === 2 ? "2nd Sem" : "Summer"}
                                        </span>
                                    </div>
                                    <div className="text-sm opacity-70 mt-1">
                                        Grade Level: {record.gradeLevel}
                                    </div>
                                </div>
                                <div className={`badge ${
                                    record.status === "Enrolled" ? "badge-success" : 
                                    record.status === "Dropped" ? "badge-error" : "badge-neutral"
                                }`}>
                                    {record.status}
                                </div>
                            </div>

                            <div className="mt-2 text-xs opacity-50 flex justify-between items-center bg-base-100/50 p-2 rounded">
                                <span>Section: {typeof record.section === 'object' ? record.section?.name : record.section || "N/A"}</span>
                                <span>{new Date(record.enrollmentDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}

              {/* Load More Trigger */}
              <div ref={observerTarget} className="flex justify-center py-4">
                {historyLoading && <Loader2 className="animate-spin text-primary" />}
                {!hasMoreHistory && history.length > 0 && (
                    <span className="text-xs opacity-50">No more records</span>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
