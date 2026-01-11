import { Outlet } from "react-router";
import TeacherNavbar from "../components/TeacherNavbar";

export default function TeacherLayout() {
  return (
      <>
          <TeacherNavbar />
          <main className="min-h-screen">
              <Outlet />
          </main>
      </>
  );
}