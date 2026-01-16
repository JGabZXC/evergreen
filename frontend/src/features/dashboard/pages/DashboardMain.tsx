import { Navigate, useRoutes, type RouteObject } from "react-router"; // Updated import from react-router-dom
import { useAuth } from "../../auth/hooks/useAuth";
import { StaffRole, StudentRole } from "../../auth/types/auth.types";
import DashboardRegistrar from "../../dashboard-registrar/pages/DashboardRegistrar";
import DashboardAppointer from "../../dashboard-appointer/pages/DashboardAppointer";
import {teacherDashboardRoutes} from "../../dashboard-teacher/routes.tsx";
import {studentDashboardRoutes} from "../../dashboard-student/routes.tsx";

export default function DashboardMain() {
  const { user } = useAuth();

  const teacherRoutes: RouteObject[] = teacherDashboardRoutes;
  const studentRoutes: RouteObject[] = studentDashboardRoutes;
  const registrarRoutes: RouteObject[] = [{ index: true, element: <DashboardRegistrar /> }];
  const appointerRoutes: RouteObject[] = [{ index: true, element: <DashboardAppointer /> }];

  let roleRoutes: RouteObject[] = [];

  if (user) {
    switch (user.role) {
      case StudentRole.Student:
        roleRoutes = studentRoutes;
        break;
      case StaffRole.Teacher:
        roleRoutes = teacherRoutes;
        break;
      case StaffRole.Registrar:
        roleRoutes = registrarRoutes;
        break;
      case StaffRole.Approver:
        roleRoutes = appointerRoutes;
        break;
      default:
        break;
    }
  }

  const element = useRoutes(roleRoutes);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === StaffRole.Admin) {
    return <Navigate to="/admin" replace />;
  }

  if (!element && user) {
     return <Navigate to="/login" replace />;
  }

  return element;
}
