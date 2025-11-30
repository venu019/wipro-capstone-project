import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/authprovider";

const AdminNavbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/admin" end className={getNavLinkClass}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/buses" className={getNavLinkClass}>
                Manage Buses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/routes" className={getNavLinkClass}>
                Manage Routes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/trips" className={getNavLinkClass}>
                Manage Trips
              </NavLink>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <span
                role="button"
                className="nav-link dropdown-toggle"
                id="adminUserDropdown"
                onClick={toggleDropdown}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${auth.role}`}
                  alt={auth.role}
                  width="40"
                  height="40"
                  className="rounded-circle me-2"
                />
                <span>{auth.sellername}</span>
              </span>
              {dropdownOpen && (
                <ul
                  className="dropdown-menu dropdown-menu-end show"
                  aria-labelledby="adminUserDropdown"
                  style={{ position: "absolute" }}
                >
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
