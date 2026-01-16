import { Link } from "react-router";
import logo from "../../assets/evergreen_logo.png";
import { useLocation } from "react-router";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useLogout } from "../../features/auth/hooks/useLogout";
import {useTheme} from "../hooks/useTheme.ts";

function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const { logout } = useLogout();
  const {toggleTheme, theme} = useTheme();


  const isInLoginPage = location.pathname === "/login";

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md shadow-lg sticky top-0 z-50 flex justify-between dark:bg-white/10">
      <div className="navbar-start">
        <Link to="/" className="flex gap-2 items-center normal-case text-xl">
          <img
            src={logo}
            alt="Evergreen Academy Logo"
            className="h-8 w-8"
          />
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
        {!isInLoginPage && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                  <Link to="/dashboard" className="btn btn-ghost">
                      Dashboard
                  </Link>
                  <button onClick={logout} className="btn btn-primary">
                      Logout
                  </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Portal
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
