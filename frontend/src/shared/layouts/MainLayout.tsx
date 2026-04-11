import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import { AxiosInterceptor } from "../../features/auth";

export default function MainLayout() {
  return (
    <AxiosInterceptor>
      <main className="min-h-screen">
        <Navbar />
        <Outlet />
      </main>
    </AxiosInterceptor>
  );
}
