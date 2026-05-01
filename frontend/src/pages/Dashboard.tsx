import { RegistrarDashboard, StudentDashboard } from "../features/dashboard";
import { Role } from "../features/auth";
import { useAuth } from "../features/auth";
import { Navigate, Link } from "react-router";

export default function Dashboard() {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user?.role) {
      case Role.STUDENT:
        return <StudentDashboard />;
      case Role.REGISTRAR:
        return <RegistrarDashboard />;
      case Role.ADMIN:
      case Role.TEACHER:
        // Admin/Teacher dashboards not implemented yet — show a placeholder
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="card w-full max-w-2xl bg-base-100 shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
              <p className="mb-4">A dashboard for your role ({user?.role}) is not available yet.</p>
              <div className="flex gap-2">
                <Link to="/" className="btn btn-outline">
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        );
      default:
        // If there's no user (not authenticated) redirect to login
        return <Navigate to={"/"} replace />;
    }
  };

  return <>{renderContent()}</>;
}