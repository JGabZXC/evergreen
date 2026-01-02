import { useState } from "react";
import { useSchoolYears } from "../../../shared/hooks/useSchoolYears";
import { schoolYearService } from "../../../shared/services/schoolYearService";
import {
  type SchoolYear,
  SchoolYearStatus,
  Semester,
  type DepartmentPeriods,
} from "../../../shared/types";
import { toast } from "react-toastify";
import {
  Calendar,
  Plus,
  Edit,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const initialTerms: DepartmentPeriods = {
  college: [
    { semester: Semester.First, startDate: "", endDate: "" },
    { semester: Semester.Second, startDate: "", endDate: "" },
    { semester: Semester.Third, startDate: "", endDate: "" },
  ],
  k12: [
    { semester: Semester.First, startDate: "", endDate: "" },
    { semester: Semester.Second, startDate: "", endDate: "" },
  ],
};

export default function SchoolYearManagement() {
  const { schoolYears, loading, refetch } = useSchoolYears();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<SchoolYearStatus>(
    SchoolYearStatus.Upcoming
  );
  const [terms, setTerms] = useState<DepartmentPeriods>(initialTerms);

  const resetForm = () => {
    setYear("");
    setStartDate("");
    setEndDate("");
    setStatus(SchoolYearStatus.Upcoming);
    setTerms(initialTerms);
    setEditingId(null);
  };

  const handleEdit = (sy: SchoolYear) => {
    setEditingId(sy._id);
    setYear(sy.year);
    setStartDate(sy.startDate.split("T")[0]);
    setEndDate(sy.endDate.split("T")[0]);
    setStatus(sy.status);

    // Ensure terms structure matches expected format even if backend data is partial
    setTerms({
      college: sy.terms.college.map((t) => ({
        ...t,
        startDate: t.startDate.split("T")[0],
        endDate: t.endDate.split("T")[0],
      })),
      k12: sy.terms.k12.map((t) => ({
        ...t,
        startDate: t.startDate.split("T")[0],
        endDate: t.endDate.split("T")[0],
      })),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        year,
        startDate,
        endDate,
        status,
        terms,
      };

      if (editingId) {
        await schoolYearService.update(editingId, payload);
        toast.success("School Year updated successfully");
      } else {
        await schoolYearService.create(payload);
        toast.success("School Year created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save School Year"
      );
    }
  };

  const updateTermDate = (
    dept: "college" | "k12",
    index: number,
    field: "startDate" | "endDate",
    value: string
  ) => {
    setTerms((prev) => {
      const newTerms = { ...prev };
      newTerms[dept][index] = { ...newTerms[dept][index], [field]: value };
      return newTerms;
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">School Year Management</h1>
          <p className="text-base-content/70">
            Create and manage academic calendars.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="btn btn-primary gap-2"
        >
          <Plus size={18} /> New School Year
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {schoolYears.map((sy) => (
            <motion.div key={sy._id} variants={itemVariants}>
              <SchoolYearCard sy={sy} onEdit={() => handleEdit(sy)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-base-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-base-200 flex justify-between items-center sticky top-0 bg-base-100 z-10">
                <h2 className="text-xl font-bold">
                  {editingId ? "Edit School Year" : "Create School Year"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">
                        School Year (e.g. 2023-2024)
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                      placeholder="YYYY-YYYY"
                    />
                  </div>
                  <div className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Status</span>
                    </div>
                    <select
                      className="select select-bordered w-full"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as SchoolYearStatus)
                      }
                    >
                      <option value={SchoolYearStatus.Upcoming}>
                        Upcoming
                      </option>
                      <option value={SchoolYearStatus.Active}>Active</option>
                      <option value={SchoolYearStatus.Closed}>Closed</option>
                    </select>
                  </div>
                  <div className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Start Date</span>
                    </div>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">End Date</span>
                    </div>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="divider">Term Schedules</div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* College Terms */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                      <span className="badge badge-primary">College</span>{" "}
                      Tri-Sem
                    </h3>
                    {terms.college.map((term, index) => (
                      <div
                        key={index}
                        className="bg-base-200 p-4 rounded-lg space-y-2"
                      >
                        <div className="font-semibold">
                          {index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}{" "}
                          Semester
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="form-control w-full">
                            <div className="label">
                              <span className="label-text text-xs">Start</span>
                            </div>
                            <input
                              type="date"
                              className="input input-sm input-bordered w-full"
                              value={term.startDate}
                              onChange={(e) =>
                                updateTermDate(
                                  "college",
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="form-control w-full">
                            <div className="label">
                              <span className="label-text text-xs">End</span>
                            </div>
                            <input
                              type="date"
                              className="input input-sm input-bordered w-full"
                              value={term.endDate}
                              onChange={(e) =>
                                updateTermDate(
                                  "college",
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* K12 Terms */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-secondary">
                      <span className="badge badge-secondary">K-12</span> 2
                      Semesters
                    </h3>
                    {terms.k12.map((term, index) => (
                      <div
                        key={index}
                        className="bg-base-200 p-4 rounded-lg space-y-2"
                      >
                        <div className="font-semibold">
                          {index === 0 ? "1st" : "2nd"} Semester
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="form-control w-full">
                            <div className="label">
                              <span className="label-text text-xs">Start</span>
                            </div>
                            <input
                              type="date"
                              className="input input-sm input-bordered w-full"
                              value={term.startDate}
                              onChange={(e) =>
                                updateTermDate(
                                  "k12",
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="form-control w-full">
                            <div className="label">
                              <span className="label-text text-xs">End</span>
                            </div>
                            <input
                              type="date"
                              className="input input-sm input-bordered w-full"
                              value={term.endDate}
                              onChange={(e) =>
                                updateTermDate(
                                  "k12",
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-action sticky bottom-0 bg-base-100 p-4 border-t border-base-200">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-8">
                    Save School Year
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SchoolYearCard({
  sy,
  onEdit,
}: {
  sy: SchoolYear;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: SchoolYearStatus) => {
    switch (status) {
      case SchoolYearStatus.Active:
        return "badge-success text-white";
      case SchoolYearStatus.Upcoming:
        return "badge-info text-white";
      case SchoolYearStatus.Closed:
        return "badge-error text-white";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{sy.year}</h3>
              <div className="text-sm opacity-70 flex items-center gap-2">
                {new Date(sy.startDate).toLocaleDateString()} -{" "}
                {new Date(sy.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${getStatusColor(sy.status)}`}>
              {sy.status}
            </span>
            <button
              onClick={onEdit}
              className="btn btn-sm btn-ghost btn-square"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-sm btn-ghost btn-square"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="divider my-2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-bold mb-2 text-primary">College Terms</h4>
                  <ul className="space-y-1">
                    {sy.terms.college.map((t, i) => (
                      <li key={i} className="flex justify-between">
                        <span>
                          {i === 0 ? "1st" : i === 1 ? "2nd" : "3rd"} Sem:
                        </span>
                        <span className="opacity-70">
                          {new Date(t.startDate).toLocaleDateString()} -{" "}
                          {new Date(t.endDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-secondary">K-12 Terms</h4>
                  <ul className="space-y-1">
                    {sy.terms.k12.map((t, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{i === 0 ? "1st" : "2nd"} Sem:</span>
                        <span className="opacity-70">
                          {new Date(t.startDate).toLocaleDateString()} -{" "}
                          {new Date(t.endDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
