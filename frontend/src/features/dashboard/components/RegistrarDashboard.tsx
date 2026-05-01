import SidebarRegistrar from "./registrar/SidebarRegistrar";
import { Outlet } from "react-router";
import logo from "../../../assets/evergreen_logo.png";

export function RegistrarDashboard() {
    return (
        <div className="drawer lg:drawer-open">
            <input id="registrar-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col min-h-screen bg-base-200/50">
                {/* Navbar for Mobile */}
                <div className="w-full navbar bg-base-100 lg:hidden shadow-sm z-10">
                    <div className="flex-none">
                        <label htmlFor="registrar-drawer" className="btn btn-square btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </label>
                    </div>
                    <div className="flex-1 px-2 mx-2 font-bold text-lg flex items-center gap-2">
                        <img src={logo} alt="Evergreen Academy" className="h-6 w-6" />
                        <span>Evergreen Academy</span>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden p-4">
                    <h2 className="text-2xl font-bold mb-4">Registrar Dashboard</h2>
                    <Outlet />
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side z-20">
                <label htmlFor="registrar-drawer" className="drawer-overlay"></label>
                <SidebarRegistrar />
            </div>
        </div>
    )
}