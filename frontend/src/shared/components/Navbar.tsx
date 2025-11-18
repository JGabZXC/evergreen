import React from "react";
import logo from "../../assets/evergreen_logo.png";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <button className="btn btn-ghost normal-case text-xl">
          <img
            src={logo}
            alt="Evergreen Academy Logo"
            className="h-8 w-8 mr-2"
          />
          Evergreen Academy
        </button>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>Dashboard</a>
          </li>
          <li>
            <a>Students</a>
          </li>
          <li>
            <a>Teachers</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <a className="btn btn-primary">Login</a>
      </div>
    </nav>
  );
};

export default Navbar;
