import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { apiPrivate } from "../../../config/axiosPrivate";
import type { CourseOption } from "../types";

export default function CreateStudent() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    course: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await apiPrivate.get("/api/registrar/course");
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        role: "Student",
      };

      await apiPrivate.post("/api/auth/register", payload);
      setSuccess("Student account created successfully!");
      setFormData({ email: "", password: "", course: "" });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create student account"
      );
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
          {success && (
            <div className="alert alert-success mb-6 shadow-sm">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {error && (
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
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
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Must be at least 6 characters long
                </span>
              </label>
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
                  required
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
