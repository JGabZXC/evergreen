import { createBrowserRouter } from "react-router";
import MainLayout from "../shared/layouts/MainLayout";
import { RegistrarDashboard } from "../features/dashboard";
import UsersRegistrar from "../features/dashboard/components/registrar/UsersRegistrar";
import RoomsRegistrar from "../features/dashboard/components/registrar/RoomsRegistrar";
import SchoolYearRegistrar from "../features/dashboard/components/registrar/SchoolYearRegistrar";
import {
  authRoutes,
  AxiosInterceptor,
  PersistLogin,
  ProtectedRoute, Role,
} from "../features/auth";
import HomePage from "../pages/HomePage";
import ProgramsPage from "../pages/ProgramsPage";
import NotFound404 from "../pages/NotFound404";
import Dashboard from "../pages/Dashboard.tsx";

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
               Role.STUDENT, Role.ADMIN, Role.REGISTRAR
              ]}
            />
          </AxiosInterceptor>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "users",
            element: <RegistrarDashboard />,
            children: [
              { index: true, element: <UsersRegistrar /> },
            ],
          },
          {
            path: "rooms",
            element: <RegistrarDashboard />,
            children: [
              { index: true, element: <RoomsRegistrar /> },
            ],
          },
          {
            path: "school-years",
            element: <RegistrarDashboard />,
            children: [
              { index: true, element: <SchoolYearRegistrar /> },
            ],
          }
        ],
      },
    ],
  },
]);
