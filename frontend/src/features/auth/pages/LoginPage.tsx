import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState, useRef } from "react"; // [!code focus]
import { useAuth } from "../hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") || "student";
  const { formData, handleChange, submitLogin, loading, errors } = useLogin();

  const abortControllerRef = useRef<AbortController | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!searchParams.get("type")) {
      setSearchParams({ type: "student" }, { replace: true });
    }
  }, [searchParams.get("type"), setSearchParams]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200 dark:border-white/10">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">
            Login as {type === "teacher" ? "Teacher" : "Student"}
          </h2>
          <form className="space-y-6" onSubmit={submitLogin}>
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full"
                // required
                value={formData.email}
                onChange={(e) => {
                  handleChange("email", e.target.value);
                }}
              />
              {errors.email && (
                <span className="text-sm text-red-400">{errors.email}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                // required
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              {errors.password && (
                <span className="text-sm text-red-400">{errors.password}</span>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary w-full hover:bg-secondary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2 h-5 w-5" />{" "}
                    Loading...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
          <div className="divider">OR</div>
          <div className="text-center">
            <p className="text-sm">
              Login as {type === "teacher" ? "Student" : "Teacher"}?{" "}
              <Link
                to={`/login?type=${type === "teacher" ? "student" : "teacher"}`}
                className="link link-primary"
              >
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
