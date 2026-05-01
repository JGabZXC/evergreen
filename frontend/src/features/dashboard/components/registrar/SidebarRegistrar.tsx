import { useState } from "react";
import { Users, Home, CalendarDays, Menu } from "lucide-react";
import { NavLink } from "react-router";
import { useAuth, useLogout } from "../../../auth";
import logo from "../../../../assets/evergreen_logo.png";

export default function SidebarRegistrar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "R";

  const dashboardItems = [
    { name: 'Dashboard', icon: <Home size={24} />, to: "/dashboard" },
  ];

  const menuItems = [
    { name: 'Users', icon: <Users size={24} />, to: "/dashboard/users" },
    { name: 'Rooms', icon: <Home size={24} />, to: "/dashboard/rooms" },
    { name: 'School Years', icon: <CalendarDays size={24} />, to: "/dashboard/school-years" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const { logout } = useLogout();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfileMenu = () => setIsProfileOpen((s) => !s);

  return (
    <aside
        className={`${
            isOpen ? 'w-80' : 'w-32'
        } bg-base-100 h-full transition-all duration-300 ease-in-out border-r border-base-300 flex flex-col relative`}
    >

      {/* Header Section - Balanced padding */}
      <div className="p-4 flex items-center shrink-0 justify-between transition-all duration-300">
        {/* Logo Group */}
        <div className="flex items-center gap-4 shrink-0 overflow-hidden">
          {/* Logo Icon - Uses primary border color */}
          <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-base-100 shrink-0 shadow-sm">
            <img src={logo} alt="Evergreen Academy" className="h-6 w-6" />
          </div>

          {/* Logo Text - Semantic text coloring */}
          <div className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
              isOpen ? 'opacity-100 max-w-[200px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-4 pointer-events-none'
          }`}>
            <h1 className="text-lg font-bold text-primary leading-tight">Evergreen Academy</h1>
            <p className="text-[10px] font-medium text-base-content/70 uppercase tracking-wider">School Management</p>
          </div>
        </div>

        {/* Burger Menu - DaisyUI Ghost Button style */}
        <button
            onClick={toggleSidebar}
            className="btn btn-ghost btn-square text-primary transition-all duration-300 flex items-center justify-center shrink-0 z-10"
            aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-2 flex flex-col">
        {dashboardItems.map((item, index) => (
          <NavLink key={`dash-${index}`} to={item.to} end={item.to === "/dashboard"} className="group">
            {({ isActive }: { isActive: boolean }) => (
              <div
                className={`flex items-center h-12 pl-4 pr-5 cursor-pointer transition-all duration-200 relative ${
                  isActive ? 'text-base-content bg-base-200' : 'text-base-content hover:bg-base-300'
                }`}
                title={!isOpen ? item.name : ""}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary" />}
                <div className="w-10 flex items-center justify-center shrink-0">
                  <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    {item.icon}
                  </div>
                </div>
                <span className={`font-semibold text-base transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                  isOpen ? 'opacity-100 max-w-[200px] ml-4 translate-x-0' : 'opacity-0 max-w-0 ml-0 -translate-x-4 pointer-events-none'
                }`}>
                  {item.name}
                </span>
              </div>
            )}
          </NavLink>
        ))}

        {menuItems.map((item, index) => (
          <NavLink key={`menu-${index}`} to={item.to} end={item.to === "/dashboard"} className="group">
            {({ isActive }: { isActive: boolean }) => (
              <div
                className={`flex items-center h-14 pl-4 pr-5 cursor-pointer transition-all duration-200 relative ${
                  isActive ? 'text-base-content bg-base-200' : 'text-base-content hover:bg-base-300'
                }`}
                title={!isOpen ? item.name : ""}
              >
                {/* Active Indicator Bar */}
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary" />}

                {/* Icon Container */}
                <div className="w-10 flex items-center justify-center shrink-0">
                  <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    {item.icon}
                  </div>
                </div>

                {/* Label */}
                <span className={`font-semibold text-lg transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                  isOpen ? 'opacity-100 max-w-[200px] ml-4 translate-x-0' : 'opacity-0 max-w-0 ml-0 -translate-x-4 pointer-events-none'
                }`}>
                  {item.name}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Profile Section (dropdown for account & logout) */}
      <div className="mt-auto border-t border-base-300 bg-base-100">
        <div className="relative p-2">
          <div className={`dropdown ${isProfileOpen ? 'dropdown-open' : ''} dropdown-top w-full`}>
            <label
              tabIndex={0}
              className="flex items-center h-20 pl-4 pr-5 overflow-hidden transition-colors cursor-pointer group"
              onClick={toggleProfileMenu}
            >
              {/* Avatar - DaisyUI Avatar style */}
              <div className="avatar placeholder shrink-0 group-hover:scale-105 transition-transform">
                <div className="bg-neutral text-neutral-content rounded-full w-11 h-11 flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold leading-none">{initial}</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className={`transition-all duration-300 ease-in-out whitespace-nowrap ml-4 overflow-hidden ${
                  isOpen ? 'opacity-100 max-w-40 ml-4 translate-x-0' : 'opacity-0 max-w-0 ml-0 -translate-x-4 pointer-events-none'
              }`}>
                <p className="text-sm font-bold text-base-content truncate">
                  {user?.email ?? 'NONE'}
                </p>
                <div className="mt-0.5">
                    <span className="badge badge-outline badge-xs p-2 font-bold text-primary uppercase tracking-tighter">
                      {user?.role ?? 'NONE'}
                    </span>
                </div>
              </div>
            </label>

            {/* Dropdown content */}
            <ul tabIndex={0} className={`dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 ${isOpen ? 'left-2' : 'left-18'}`}>
              <li>
                <NavLink to="/dashboard/my-account" onClick={() => setIsProfileOpen(false)} className="justify-between">
                  My Account
                </NavLink>
              </li>
              <li>
                <button onClick={() => { setIsProfileOpen(false); logout(); }} className="w-full text-left">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}