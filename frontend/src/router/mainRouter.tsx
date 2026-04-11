import { createBrowserRouter } from "react-router";
import MainLayout from "../shared/layouts/MainLayout";
import {
  authRoutes,
  AxiosInterceptor,
  PersistLogin,
  ProtectedRoute,
  StaffRole,
  StudentRole,
} from "../features/auth";
import HomePage from "../pages/HomePage";
import ProgramsPage from "../pages/ProgramsPage";
import NotFound404 from "../pages/NotFound404";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PersistLogin />,
    children: [
      {
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
        path: "/dashboard",
        element: (
          <AxiosInterceptor>
            <ProtectedRoute
              allowedRoles={[
                StudentRole.Student,
                StaffRole.Registrar,
                StaffRole.Teacher,
              ]}
            />
          </AxiosInterceptor>
        ),
        children: [
          {
            index: true,
            element: <div>Dashboard Home</div>,
          },
        ],
      },
    ],
  },
]);
