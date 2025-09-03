import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ADMIN_BUSES_KEY = "admin_buses";
const BOOKINGS_KEY = "customer_bookings"; // adjust per your storage key

function AdminDashboard() {
  // Example: Replace with real authentication & role check
  const isAdmin = true; // Get from auth context or JWT decode in production

  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const storedBuses = localStorage.getItem(ADMIN_BUSES_KEY);
    setBuses(storedBuses ? JSON.parse(storedBuses) : []);

    const storedBookings = localStorage.getItem(BOOKINGS_KEY);
    setBookings(storedBookings ? JSON.parse(storedBookings) : []);
  }, []);

  const totalBookingsCount = bookings.length;

  const busBookingsCount = buses.map(bus => {
    const count = bookings.filter(b => b.busNumber === bus.busNumber).length;
    return { busNumber: bus.busNumber, count };
  });

  if (!isAdmin) {
    return (
      <div className="container mt-5">
        <h3>Access Denied</h3>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>

      <div className="row g-4 mt-3">
        <div className="col-md-4">
          <div className="card text-white bg-primary h-100">
            <div className="card-body">
              <h5 className="card-title">Total Buses</h5>
              <p className="card-text display-4">{buses.length}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-success h-100">
            <div className="card-body">
              <h5 className="card-title">Total Bookings</h5>
              <p className="card-text display-4">{totalBookingsCount}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-light h-100">
            <div className="card-body">
              <h5 className="card-title">Bookings Per Bus</h5>
              {busBookingsCount.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {busBookingsCount.map(({ busNumber, count }) => (
                    <li
                      key={busNumber}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {busNumber}
                      <span className="badge bg-secondary rounded-pill">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin navigation links */}
      <div className="list-group mt-5">
        <Link to="/admin/buses" className="list-group-item list-group-item-action">
          Manage Buses
        </Link>
        <Link to="/admin/routes" className="list-group-item list-group-item-action">
          Manage Routes
        </Link>
        <Link to="/admin/trips" className="list-group-item list-group-item-action">
          Trip Scheduling
        </Link>
        {/* Add more admin modules here */}
      </div>
    </div>
  );
}

export default AdminDashboard;
