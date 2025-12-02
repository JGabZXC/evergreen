import { createBrowserRouter } from "react-router";
import { dashboardRoutes } from "../features/dashboard/routes/routes";
import MainLayout from "../shared/layouts/MainLayout";
import HomePage from "../features/homepage/HomePage";
import { authRoutes } from "../features/auth/routes/authRoutes";
import ProgramsPage from "../features/programs/ProgramsPage";
import NotFound404 from "../features/notfound404/NotFound404";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...authRoutes,
      {
        path: "programs",
        element: <ProgramsPage />,
      },
      { path: "*", element: <NotFound404 /> },
    ],
  },
  {
    ...dashboardRoutes[0],
  },
]);
