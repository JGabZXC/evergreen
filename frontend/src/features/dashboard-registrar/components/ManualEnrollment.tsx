import { motion } from "framer-motion";
import { Save, UserPlus } from "lucide-react";
import { useState } from "react";

export default function ManualEnrollment() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    program: "",
    id: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Enrolling ${formData.firstName} ${formData.lastName}`);
    setFormData({ firstName: "", lastName: "", program: "", id: "" });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-xl overflow-hidden"
      >
        <div className="bg-primary p-6 text-primary-content">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus size={24} /> Student Registration Form
          </h2>
          <p className="text-primary-content/80 text-sm mt-1">
            Enter student details for manual system entry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Student ID</span>
              </label>
              <input
                type="text"
                placeholder="2024-XXXX (Auto-generated if empty)"
                className="input input-bordered w-full"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Program / Track</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.program}
                onChange={(e) =>
                  setFormData({ ...formData, program: e.target.value })
                }
              >
                <option disabled value="">
                  Select Program
                </option>
                <option>BS Computer Science</option>
                <option>BS Nursing</option>
                <option>BS Accountancy</option>
                <option>STEM Strand</option>
                <option>ABM Strand</option>
              </select>
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

          <div className="card-actions justify-end mt-6">
            <button type="button" className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Register Student
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
