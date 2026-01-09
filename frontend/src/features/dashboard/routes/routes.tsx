import DashboardMain from "../pages/DashboardMain";
import { ProfileForm } from "../../dashboard-student/pages/ProfileForm";

export const dashboardRoutes = [
  {
    index: true,
    element: <DashboardMain />,
  },
  {
    path: "student/profile/create",
    element: <ProfileForm />,
  },
  {
    path: "student/profile/edit",
    element: <ProfileForm />,
  },
  {
    path: "*",
    element: <DashboardMain />,
  },
];
