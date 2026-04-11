// noinspection SpellCheckingInspection

import { Link } from "react-router";
import logo from "../../assets/evergreen_logo.png";
import { useLogout } from "../../features/auth";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme.ts";
import { useState } from "react";

export default function TeacherNavbar() {
  const { logout } = useLogout();
  const { toggleTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  console.log(isOpen);

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md shadow-lg sticky top-0 z-50 flex justify-between dark:bg-white/10">
      <div className="navbar-start">
        <Link to="/" className="flex gap-2 items-center normal-case text-xl">
          <img src={logo} alt="Evergreen Academy Logo" className="h-8 w-8" />
          Evergreen Academy
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost btn-circle"
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
        >
          {theme === "caramellatte" ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-blue-400" />
          )}
        </button>

        <div
          className={`dropdown dropdown-end dropdown-bottom ${isOpen ? "dropdown-open" : "dropdown-close"}`}
        >
          <div
            tabIndex={0}
            role="button"
            className="btn m-1"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Menu className="w-6 h-6" />
          </div>
          <ul
            tabIndex={-1}
            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
          >
            <li>
              <Link to={"/dashboard"} onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to={"/"} onClick={() => setIsOpen(false)}>
                Grades
              </Link>
            </li>
            <li>
              <Link to={"/"} onClick={() => setIsOpen(false)}>
                Students
              </Link>
            </li>
            <li>
              <Link to={"/"} onClick={() => setIsOpen(false)}>
                Report
              </Link>
            </li>
            <li>
              <Link
                to={"/dashboard/my-sections"}
                onClick={() => setIsOpen(false)}
              >
                My Sections
              </Link>
            </li>
            <li>
              <Link
                to={"/dashboard/my-classes"}
                onClick={() => setIsOpen(false)}
              >
                My Classes
              </Link>
            </li>
            <li>
              <Link
                to={"/dashboard/my-account"}
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
            </li>
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
