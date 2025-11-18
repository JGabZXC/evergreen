import { createBrowserRouter } from "react-router";
import HomePage from "./features/homepage/HomePage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
]);
