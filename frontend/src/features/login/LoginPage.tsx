import { useSearchParams } from "react-router";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "student";

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">
            Login as {type === "teacher" ? "Teacher" : "Student"}
          </h2>
          <form className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary w-full hover:bg-secondary"
              >
                Login
              </button>
            </div>
          </form>
          <div className="divider">OR</div>
          <div className="text-center">
            <p className="text-sm">
              Login as {type === "teacher" ? "Student" : "Teacher"}?{" "}
              <a
                href={`/login?type=${
                  type === "teacher" ? "student" : "teacher"
                }`}
                className="link link-primary"
              >
                Click here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
