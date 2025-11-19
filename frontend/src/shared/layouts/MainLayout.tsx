import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Outlet />
    </main>
  );
}
