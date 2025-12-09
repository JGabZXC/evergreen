import { Navigate, useNavigate } from "react-router";
import { useEffect } from "react";
import { DashboardStudent } from "../../dashboard-student/pages/DashboardStudent";
import { DashboardTeacher } from "../../dashboard-teacher/pages/DashboardTeacher";
import DashboardRegistrar from "../../dashboard-registrar/pages/DashboardRegistrar";
import DashboardAppointer from "../../dashboard-appointer/pages/DashboardAppointer";
import { useAuth } from "../../auth/hooks/useAuth";
import { StaffRole, StudentRole } from "../../auth/types/auth.types";

export default function DashboardMain() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (
      user.role !== StudentRole.Student &&
      user.role !== StaffRole.Teacher &&
      user.role !== StaffRole.Registrar &&
      user.role !== StaffRole.Approver &&
      user.role !== StaffRole.Admin
    ) {
      navigate("/", { replace: true });
    }
  }, [user.role, navigate]);

  if (user.role === StudentRole.Student) {
    return <DashboardStudent />;
  }

  if (user.role === StaffRole.Teacher) {
    return <DashboardTeacher />;
  }

  if (user.role === StaffRole.Registrar) {
    return <DashboardRegistrar />;
  }

  if (user.role === StaffRole.Approver) {
    return <DashboardAppointer />;
  }

  if (user.role === StaffRole.Admin) {
    return <div>Admin Dashboard</div>;
  }

  return null;
}
