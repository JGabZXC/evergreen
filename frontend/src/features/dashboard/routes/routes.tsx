import DashboardMain from "../pages/DashboardMain";
import { ProfileForm } from "../../dashboard-student/pages/ProfileForm";

export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: <DashboardMain />,
  },
  {
    path: "/student/profile/create",
    element: <ProfileForm />,
  },
  {
    path: "/student/profile/edit",
    element: <ProfileForm />,
  },
];
