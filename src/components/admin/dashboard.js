import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminBookingCards = () => {
  const [bookingsByTrip, setBookingsByTrip] = useState({});
  const [busByTrip, setBusByTrip] = useState({});
  const [routeByTrip, setRouteByTrip] = useState({});
  const [tripByTripId, setTripByTripId] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroupedBookings() {
      try {
        const res = await axios.get(
          "http://localhost:9004/api/v1/bookings/admin/bookings-by-trip",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setBookingsByTrip(res.data);

        const tripIds = Object.keys(res.data);
        const busMap = {};
        const routeMap = {};
        const tripMap = {};

        for (let tripId of tripIds) {
          try {
            const tripRes = await axios.get(
              `http://localhost:9003/api/v1/trips/${tripId}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            const trip = tripRes.data;
            tripMap[tripId] = trip;

            if (trip.busId && !busMap[trip.busId]) {
              const busRes = await axios.get(
                `http://localhost:9002/api/v1/buses/${trip.busId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
              );
              busMap[trip.busId] = busRes.data;
            }
            if (trip.routeId && !routeMap[trip.routeId]) {
              const routeRes = await axios.get(
                `http://localhost:9002/api/v1/routes/${trip.routeId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
              );
              routeMap[trip.routeId] = routeRes.data;
            }
            // Store bus and route per tripId
            setBusByTrip((prev) => ({ ...prev, [tripId]: busMap[trip.busId] }));
            setRouteByTrip((prev) => ({ ...prev, [tripId]: routeMap[trip.routeId] }));
            setTripByTripId((prev) => ({ ...prev, [tripId]: trip }));
          } catch (err) {
            console.warn(`Failed to fetch info for trip: ${tripId}`, err);
          }
        }
      } catch (error) {
        console.error("Failed to load bookings grouped by trip", error);
        setBookingsByTrip({});
      } finally {
        setLoading(false);
      }
    }
    fetchGroupedBookings();
  }, []);

  if (loading) {
    return <div className="container my-4 text-center">Loading bookings grouped by trip...</div>;
  }

  if (Object.keys(bookingsByTrip).length === 0) {
    return <div className="container my-4 text-center">No bookings found.</div>;
  }

  return (
    <div className="container my-4">
      <h2>Bookings Per Trip</h2>
      <div className="d-flex flex-column gap-4">
        {Object.entries(bookingsByTrip).map(([tripId, bookings]) => {
          const bus = busByTrip[tripId];
          const route = routeByTrip[tripId];
          const trip = tripByTripId[tripId];

          const tripStatus = trip?.cancelled ? "Cancelled" : new Date(trip?.departureTime).toLocaleString();

          return (
            <div key={tripId} className="card shadow-sm w-100">
              <div className="card-body">
                <h5 className="card-title">Trip ID: {tripId}</h5>
                {bus && (
                  <p className="mb-1">
                    <strong>Bus:</strong> {bus.busNumber} ({bus.busType})
                  </p>
                )}
                {route && (
                  <p className="mb-1">
                    <strong>Route:</strong> {route.source || route.from} &rarr; {route.destination || route.to}
                  </p>
                )}
                <p className="mb-3">
                  <strong>Trip Status:</strong> {tripStatus}
                </p>
                <p className="card-text mb-3">
                  <strong>Total Bookings:</strong> {bookings.length}
                </p>
                <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <table className="table table-bordered table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Booking ID</th>
                        <th>Status</th>
                        <th>Total Price</th>
                        <th>Seats</th>
                        <th>Booking Date</th>
                        <th>Passengers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.bookingId}>
                          <td>{booking.bookingId}</td>
                          <td>
                            <span
                              className={`badge ${
                                booking.status === "CONFIRMED" ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td>₹{booking.totalAmount.toFixed(2)}</td>
                          <td>{booking.seats.map((s) => s.seatNumber).join(", ")}</td>
                          <td>{new Date(booking.bookingDate).toLocaleString()}</td>
                          <td>
                            <ul className="list-unstyled mb-0">
                              {booking.passengers.map((p) => (
                                <li key={p.passengerId} className="mb-1">
                                  <div><strong>Name:</strong> {p.name}</div>
                                  <div><strong>Age:</strong> {p.age}</div>
                                  <div><strong>Gender:</strong> {p.gender}</div>
                                  <div><strong>Contact:</strong> {p.contact}</div>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function AdminDashboard() {
  const [busCount, setBusCount] = useState(0);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchTotals() {
      try {
        const busRes = await axios.get("http://localhost:9002/api/v1/buses", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBusCount(busRes.data.length);

        const bookingsRes = await axios.get("http://localhost:9004/api/v1/bookings/admin/bookings-by-trip", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const totalCount = Object.values(bookingsRes.data).reduce((acc, arr) => acc + arr.length, 0);
        setTotalBookingsCount(totalCount);
      } catch (err) {
        console.error("Failed to fetch totals", err);
        setBusCount(0);
        setTotalBookingsCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchTotals();
  }, [token]);

  if (loading) {
    return <div className="container my-4 text-center">Loading dashboard summary...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <div className="card text-white bg-primary h-100 shadow">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <h5 className="card-title">Total Buses</h5>
              <p className="card-text display-3 fw-bold">{busCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card text-white bg-success h-100 shadow">
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <h5 className="card-title">Total Bookings</h5>
              <p className="card-text display-3 fw-bold">{totalBookingsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <AdminBookingCards />
    </div>
  );
}

export default AdminDashboard;
