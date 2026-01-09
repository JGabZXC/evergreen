import { Navigate, useRoutes, type RouteObject } from "react-router"; // Updated import from react-router-dom
import { useAuth } from "../../auth/hooks/useAuth";
import { StaffRole, StudentRole } from "../../auth/types/auth.types";
import { DashboardTeacher } from "../../dashboard-teacher/pages/DashboardTeacher";
import DashboardRegistrar from "../../dashboard-registrar/pages/DashboardRegistrar";
import { DashboardStudent } from "../../dashboard-student/pages/DashboardStudent";
import DashboardAppointer from "../../dashboard-appointer/pages/DashboardAppointer";
import TeacherLayout from "../../../shared/layouts/TeacherLayout";

export default function DashboardMain() {
  const { user } = useAuth();

  const teacherRoutes: RouteObject[] = [
    {
      element: <TeacherLayout />,
      children: [{ index: true, element: <DashboardTeacher /> }],
    },
  ];
  const studentRoutes: RouteObject[] = [{ index: true, element: <DashboardStudent /> }];
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
