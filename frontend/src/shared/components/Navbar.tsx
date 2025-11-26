import { Link } from "react-router";
import logo from "../../assets/evergreen_logo.png";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const isInLoginPage = location.pathname === "/login";

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "caramellatte" ? "forest" : "caramellatte");
  };

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md shadow-lg sticky top-0 z-50 flex justify-between dark:bg-white/10">
      <div className="navbar-start">
        <Link to="/" className="flex gap-2 items-center normal-case text-xl">
          <img
            src={logo}
            alt="Evergreen Academy Logo"
            className="h-8 w-8 mr-2"
          />
          Evergreen Academy
        </Link>
      </div>

      <div className="flex gap-2">
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
          <div>
            <Link to="/login" className="btn btn-primary">
              Portal
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
