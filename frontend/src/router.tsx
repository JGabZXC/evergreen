import { createBrowserRouter } from "react-router";
import HomePage from "./features/homepage/HomePage";
import ProgramsPage from "./features/programs/ProgramsPage";
import NotFound404 from "./features/notfound404/NotFound404";
import LoginPage from "./features/login/LoginPage";
import MainLayout from "./shared/layouts/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "programs",
        element: <ProgramsPage />,
      },
      { path: "*", element: <NotFound404 /> },
    ],
  },
]);
