import React, { useState, useContext} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/authprovider"; // Adjust path as needed

const UserNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State to hold user email
  // const [email, setEmail] = useState("");

  // useEffect(() => {
  //   // Retrieve email from localStorage
  //   const storedEmail = localStorage.getItem("email");
  //   if (storedEmail) setEmail(storedEmail);
  // }, []);

  const getNavLinkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  const handleAvatarClick = () => setDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand">
          <img
            src="https://seekvectorlogo.com/wp-content/uploads/2018/04/flixbus-vector-logo.png"
            alt="Bus Reservation Logo"
            width="120"
            height="60"
            className="d-inline-block align-text-top"
          />
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className={getNavLinkClass}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/search" className={getNavLinkClass}>
                Search Trips
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/bookings" className={getNavLinkClass}>
                My Bookings
              </NavLink>
            </li>
          </ul>

          {/* User Avatar Dropdown */}
          {/* User More Dropdown without avatar */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 mr-5">
            <li className="nav-item dropdown">
              <span
                role="button"
                className="nav-link dropdown-toggle"
                id="userMoreDropdown"
                onClick={handleAvatarClick}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                More
              </span>
              {dropdownOpen && (
                <ul
                  className="dropdown-menu dropdown-menu-end show"
                  aria-labelledby="userMoreDropdown"
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

export default UserNavbar;
