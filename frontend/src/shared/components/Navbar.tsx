import { Link } from "react-router";
import logo from "../../assets/evergreen_logo.png";
import { useLocation } from "react-router";

const Navbar = () => {
  const location = useLocation();

  const isInLoginPage = location.pathname === "/login";

  return (
    <nav className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <img
            src={logo}
            alt="Evergreen Academy Logo"
            className="h-8 w-8 mr-2"
          />
          Evergreen Academy
        </Link>
      </div>
      {!isInLoginPage && (
        <div className="navbar-end">
          <Link to="/login" className="btn btn-primary">
            Portal
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
