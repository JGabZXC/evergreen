import { motion } from "framer-motion";
import { BadgeCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function AccountCreation() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "Teacher",
    department: "",
    email: "",
    dateAppointed: new Date().toISOString().split("T")[0], // Defaults to today
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Account created for ${formData.role}: ${formData.firstName} ${formData.lastName}`
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-xl rounded-lg"
      >
        <div className="bg-primary p-6 text-primary-content rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus size={24} /> Create New Account
          </h2>
          <p className="text-primary-content/80 text-sm mt-1">
            Appoint a new Teacher, Admin, or Staff member.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="form-control w-full relative">
              <label className="label">
                <span className="label-text font-medium">Date Appointed</span>
              </label>
              <button
                type="button"
                className="input input-bordered w-full text-left"
                onClick={() => setShowDatePicker((prev) => !prev)}
              >
                {formData.dateAppointed
                  ? new Date(formData.dateAppointed).toLocaleDateString()
                  : "Pick a date"}
              </button>
              {showDatePicker && (
                <div
                  className="absolute z-30 mt-2 bg-base-100 shadow-lg rounded-lg p-2"
                  style={{ minWidth: "250px" }}
                >
                  <DayPicker
                    className="react-day-picker"
                    mode="single"
                    selected={
                      formData.dateAppointed
                        ? new Date(formData.dateAppointed)
                        : undefined
                    }
                    onSelect={(date) => {
                      setFormData({
                        ...formData,
                        dateAppointed: date
                          ? date.toISOString().split("T")[0]
                          : "",
                      });
                      setShowDatePicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">First Name</span>
              </label>
              <input
                required
                type="text"
                className="input input-bordered w-full"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Last Name</span>
              </label>
              <input
                required
                type="text"
                className="input input-bordered w-full"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Department</span>
              </label>
              <input
                required
                type="text"
                placeholder={
                  formData.role === "Teacher"
                    ? "e.g. Mathematics"
                    : "e.g. Registrar Office"
                }
                className="input input-bordered w-full"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                required
                type="email"
                placeholder="email@school.edu"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <button type="button" className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <BadgeCheck size={18} /> Confirm Appointment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
