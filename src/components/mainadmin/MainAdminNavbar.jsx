// src/components/mainadmin/MainAdminNavbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../auth/authprovider';

const MainAdminNavbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const travelsName = auth.travelsName || 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-4" to="/admin/analysis">
          <i className="fas fa-chart-line me-2"></i>
          FlixBus Admin
        </Link>

        {/* Toggler for small screens */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainAdminNavbar"
          aria-controls="mainAdminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu items */}
        <div className="collapse navbar-collapse" id="mainAdminNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <Link className="nav-link" to="/admin/user">
                <i className="fas fa-users me-1"></i> Users
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/admin/seller">
                <i className="fas fa-truck me-1"></i> Sellers
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/admin/analysis">
                <i className="fas fa-chart-bar me-1"></i> Analytics
              </Link>
            </li>
          </ul>

          {/* Right side - Profile and logout button */}
          <div className="d-flex align-items-center">
            <span className="navbar-text text-white me-3 pe-3 border-end border-white">
              <i className="fas fa-user-circle me-1"></i> Admin
            </span>
            <button 
              className="btn btn-outline-light" 
              onClick={handleLogout} 
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainAdminNavbar;
