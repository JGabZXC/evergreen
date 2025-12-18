import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiPrivate } from "../../../config/axiosPrivate";
import { parseError } from "../../../utils/parseErrors";
import { toast } from "react-toastify";
import { useCourses } from "../hooks/useCourses";

export default function CreateStudent() {
  const { courses, loading: loadingCourses } = useCourses(1, 100);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null | Record<string, string>>(
    null
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    course: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        role: "student",
      };

      await apiPrivate.post("/api/auth/register", payload);
      toast.success("Student account created successfully!");
      setFormData({ email: "", password: "", course: "" });
    } catch (err: any) {
      const parsedErrors = parseError(err);
      if (parsedErrors.global) {
        setError(parsedErrors.global);
      } else {
        setError(parsedErrors);
      }

      console.error("Error creating student account:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden border border-base-200">
        <div className="p-6 border-b border-base-200 bg-base-200/30 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Create Student Account</h2>
            <p className="text-sm text-base-content/60">
              Register a new student account with email, password, and course.
            </p>
          </div>
        </div>

        <div className="p-8">
          {typeof error === "string" && (
            <div className="alert alert-error mb-6 shadow-sm">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="form-control w-full">
              <label className="label font-medium">
                <span className="label-text flex items-center gap-2">
                  <Mail size={16} /> Email Address
                </span>
              </label>
              <input
                type="email"
                placeholder="student@school.edu"
                className="input input-bordered w-full focus:input-primary transition-all"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setError((prev) =>
                    prev && typeof prev === "object"
                      ? { ...prev, email: "" }
                      : prev
                  );
                }}
                // required
              />
              {error && typeof error !== "string" && error.email && (
                <span className="text-sm text-red-400 mt-1">{error.email}</span>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label font-medium">
                <span className="label-text flex items-center gap-2">
                  <Lock size={16} /> Password
                </span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full focus:input-primary transition-all"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError((prev) =>
                    prev && typeof prev === "object"
                      ? { ...prev, password: "" }
                      : prev
                  );
                }}
                // required
                minLength={6}
              />

              {error && typeof error !== "string" && error.password ? (
                <span className="text-sm text-red-400 mt-1">
                  {error.password}
                </span>
              ) : (
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Must be at least 6 characters long
                  </span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label font-medium">
                <span className="label-text flex items-center gap-2">
                  <BookOpen size={16} /> Course / Program
                </span>
              </label>
              <div className="relative">
                <select
                  className="select select-bordered w-full focus:select-primary transition-all appearance-none"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  // required
                  disabled={loadingCourses}
                >
                  <option value="" disabled>
                    {loadingCourses
                      ? "Loading courses..."
                      : "Select a course..."}
                  </option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                {loadingCourses && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-primary" size={16} />
                  </div>
                )}
                {error && typeof error !== "string" && error.course && (
                  <span className="text-sm text-red-400 mt-1">
                    {error.course}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full md:w-auto md:min-w-[200px]"
                disabled={submitting || loadingCourses}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Create Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
