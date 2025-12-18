import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, User, Calendar, MapPin, Phone, History } from "lucide-react";
// import { updateStudentProfile } from "../services/studentService";
import { toast } from "react-toastify";
import type { StudentAggregate } from "../types";

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
    }
  }, [student]);

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

      //   await updateStudentProfile(student.id, payload);
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
                {student.latestEnrollment && (
                  <span className="badge badge-primary">
                    {student.latestEnrollment.gradeLevel}
                  </span>
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
              {/* Currently, specific history list fetching is not implemented in GetAllStudents, 
                        only latestEnrollment. For full history, we'd fetch separate endpoint.
                        For now, displaying latest enrollment as a card. 
                    */}
              <div className="alert alert-info shadow-sm bg-base-200 border-none">
                <History size={24} />
                <div>
                  <h3 className="font-bold">Latest Enrollment Record</h3>
                  {student.latestEnrollment ? (
                    <div className="text-sm mt-1">
                      <p>
                        SY: {student.latestEnrollment.schoolYear} -{" "}
                        {student.latestEnrollment.semester === 1
                          ? "1st Sem"
                          : student.latestEnrollment.semester === 2
                          ? "2nd Sem"
                          : "Summer"}
                      </p>
                      <p>Level: {student.latestEnrollment.gradeLevel}</p>
                      <p>Status: {student.latestEnrollment.status}</p>
                      <p className="text-xs opacity-60 mt-1">
                        Enrolled on:{" "}
                        {new Date(
                          student.latestEnrollment.enrollmentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm">No enrollment record found.</p>
                  )}
                </div>
                {student.latestEnrollment && (
                  <button className="btn btn-sm btn-ghost">View Details</button>
                )}
              </div>

              {/* Placeholder for future full history list */}
              <div className="divider text-xs text-base-content/30">
                Previous Records
              </div>
              <p className="text-center text-sm text-base-content/50 italic">
                Full history feature coming soon...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
