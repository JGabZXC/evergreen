import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Calendar,
  GraduationCap,
} from "lucide-react";

import { useAuth, useLogout } from "../../features/auth";

export default function TeacherLayout() {
  const { user } = useAuth();
  const { logout } = useLogout();

  return (
    <div className="drawer lg:drawer-open">
      <input id="teacher-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen bg-base-200/50">
        {/* Navbar for Mobile */}
        <div className="w-full navbar bg-base-100 lg:hidden shadow-sm z-10">
          <div className="flex-none">
            <label
              htmlFor="teacher-drawer"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 font-bold text-lg">
            Teacher Portal
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-20">
        <label htmlFor="teacher-drawer" className="drawer-overlay"></label>
        <div className="menu p-4 w-72 min-h-full bg-base-100 text-base-content border-r border-base-200 flex flex-col">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-2 mb-8 mt-2">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10">
                <span className="text-xl font-bold">T</span>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg">Teacher Portal</h1>
              <p className="text-xs opacity-60">School Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-1 flex-1">
            <li>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "active font-semibold" : "font-medium"
                }
              >
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/my-sections"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "active font-semibold" : "font-medium"
                }
              >
                <GraduationCap size={20} />
                My Sections
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/my-classes"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "active font-semibold" : "font-medium"
                }
              >
                <Calendar size={20} />
                My Classes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/my-students"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "active font-semibold" : "font-medium"
                }
              >
                <Users size={20} />
                My Students
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/my-account"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "active font-semibold" : "font-medium"
                }
              >
                <User size={20} />
                My Account
              </NavLink>
            </li>
          </ul>

          {/* User Info & Logout */}
          <div className="border-t border-base-200 pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div>
                <p className="font-bold text-sm truncate w-40">{user?.email}</p>
                <span className="badge badge-sm badge-secondary badge-outline capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline btn-error btn-sm w-full gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
