import { createBrowserRouter } from "react-router";
import { dashboardRoutes } from "../features/dashboard/routes/routes";
import MainLayout from "../shared/layouts/MainLayout";
import HomePage from "../features/homepage/HomePage";
import { authRoutes } from "../features/auth/routes/authRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...authRoutes,
      ...dashboardRoutes,
    ],
  },
]);
