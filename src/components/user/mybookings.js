import React, { useState, useEffect } from "react";
import axios from "axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState({});
  const [buses, setBuses] = useState({});
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found in localStorage");
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch bookings
        const bookingsRes = await axios.get(
          `http://localhost:9004/api/v1/bookings/user/${userId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const bookingsData = bookingsRes.data;
        setBookings(bookingsData);

        // Extract unique tripIds
        const uniqueTripIds = [...new Set(bookingsData.map((b) => b.tripId))];

        // Fetch trip details
        const tripDetails = {};
        for (const tripId of uniqueTripIds) {
          try {
            const tripRes = await axios.get(
              `http://localhost:9003/api/v1/trips/${tripId}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            const trip = tripRes.data;

            tripDetails[tripId] = trip;

            // Fetch bus details if not fetched yet
            if (!buses[trip.busId]) {
              const busRes = await axios.get(
                `http://localhost:9002/api/v1/buses/${trip.busId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
              );
              setBuses((prev) => ({ ...prev, [trip.busId]: busRes.data }));
            }

            // Fetch route details if not fetched yet
            if (!routes[trip.routeId]) {
              const routeRes = await axios.get(
                `http://localhost:9002/api/v1/routes/${trip.routeId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
              );
              setRoutes((prev) => ({ ...prev, [trip.routeId]: routeRes.data }));
            }
          } catch (error) {
            console.warn(`Failed to fetch info for trip ${tripId}`, error);
          }
        }
        setTrips(tripDetails);

      } catch (error) {
        console.error("Failed to load bookings", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.post(
        `http://localhost:9004/api/v1/bookings/cancel/${bookingId}`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: "Cancelled" } : b
        )
      );

      alert("Booking cancelled.");
    } catch (error) {
      console.error("Failed to cancel booking", error);
      alert("Failed to cancel booking, please try again.");
    }
  };

  if (loading) return <div className="container my-4">Loading bookings...</div>;

  if (bookings.length === 0)
    return (
      <div className="container my-4">
        <p>You have no bookings.</p>
      </div>
    );

  return (
    <div className="container my-4">
      <h2>My Bookings</h2>
      <div className="row g-3">
        {bookings.map(
          ({
            bookingId,
            passengers,
            seats,
            status,
            totalAmount,
            tripId,
            bookingDate,
          }) => {
            const trip = trips[tripId];
            const bus = trip && buses[trip.busId];
            const route = trip && routes[trip.routeId];

            return (
              <div key={bookingId} className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      {bus ? `${bus.busNumber} (${bus.busType})` : "trip Cancelled..."}
                    </h5>
                    <p className="card-text">
                      <strong>Booking ID:</strong> {bookingId}
                      <br />
                      <strong>Route:</strong>{" "}
                      {route
                        ? `${route.source || route.from} → ${
                            route.destination || route.to
                          }`
                        : "Loading route..."}
                      <br />
                      <strong>Departure Time:</strong>{" "}
                      {trip
                        ? new Date(trip.departureTime).toLocaleString()
                        : "Loading..."}
                      <br />
                      <strong>Booking Date:</strong>{" "}
                      {new Date(bookingDate).toLocaleString()}
                      <br />
                      <strong>Seats:</strong> {seats.map((s) => s.seatNumber).join(", ")}
                      <br />
                      <strong>Passengers:</strong> {passengers.map(p => p.name).join(", ")}

                      <br />
                      <strong>Total Price:</strong> ₹{totalAmount.toFixed(2)}
                      <br />
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge ${
                          status === "CONFIRMED" ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                    {status === "CONFIRMED" ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(bookingId)}
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Cancelled
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default MyBookings;
