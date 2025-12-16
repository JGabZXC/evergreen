import { Navigate } from "react-router"; // Updated import from react-router-dom
import { useAuth } from "../../auth/hooks/useAuth";
import { StaffRole, StudentRole } from "../../auth/types/auth.types";
import { DashboardTeacher } from "../../dashboard-teacher/pages/DashboardTeacher";
import DashboardRegistrar from "../../dashboard-registrar/pages/DashboardRegistrar";
import { DashboardStudent } from "../../dashboard-student/pages/DashboardStudent";
import DashboardAppointer from "../../dashboard-appointer/pages/DashboardAppointer";

export default function DashboardMain() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the specific dashboard based on role
  switch (user.role) {
    case StudentRole.Student:
      return <DashboardStudent />;
    case StaffRole.Teacher:
      return <DashboardTeacher />;
    case StaffRole.Registrar:
      return <DashboardRegistrar />;
    case StaffRole.Approver:
      return <DashboardAppointer />;
    case StaffRole.Admin:
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
