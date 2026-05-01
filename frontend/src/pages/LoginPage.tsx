import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth, useLogin } from "../features/auth";
import { LoaderCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, loading, errors, setErrors } = useLogin();

  function handleChange(field: "email" | "password", value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    await login(formData.email, formData.password);
  }

  const { user } = useAuth();

  useEffect(() => {
    console.log("User state changed:", user);
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200 dark:border-white/10">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">Login</h2>
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
        </div>
      </div>
    </div>
  );
}
