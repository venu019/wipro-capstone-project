import React, { useState, useEffect } from "react";
import axios from "axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState({});
  const [buses, setBuses] = useState({});
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // DOWNLOAD TICKET FUNCTION
  // ---------------------------
  const downloadTicket = (booking, trip, bus, route) => {
    if (!booking || !trip || !bus || !route) {
      alert("Ticket not ready! Try again in 2 seconds.");
      return;
    }

    const ticketWindow = window.open("", "_blank", "width=800,height=600");

    const htmlContent = `
      <html>
        <head>
          <title>Ticket - ${booking.bookingId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .ticket-box {
              border: 2px solid #222;
              padding: 20px;
              border-radius: 10px;
            }
            h2 { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 12px; }
            .label { font-weight: bold; }
            .divider {
              height: 2px;
              background: #333;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="ticket-box">

            <h2>BUS E-TICKET</h2>

            <div class="section">
              <div><span class="label">Booking ID:</span> ${booking.bookingId}</div>
              <div><span class="label">Status:</span> ${booking.status}</div>
            </div>

            <div class="divider"></div>

            <div class="section">
              <div><span class="label">Bus:</span> ${bus.busNumber} (${bus.busType})</div>
              <div><span class="label">Route:</span> ${route.source} → ${route.destination}</div>
              <div><span class="label">Departure:</span> ${new Date(trip.departureTime).toLocaleString()}</div>
            </div>

            <div class="divider"></div>

            <div class="section">
              <div><span class="label">Seats:</span> ${booking.seats.map(s => s.seatNumber).join(", ")}</div>
              <div><span class="label">Passengers:</span> ${booking.passengers.map(p => p.name).join(", ")}</div>
            </div>

            <div class="divider"></div>

            <div class="section">
              <div><span class="label">Total Amount:</span> ₹${booking.totalAmount.toFixed(2)}</div>
              <div><span class="label">Booking Date:</span> ${new Date(booking.bookingDate).toLocaleString()}</div>
            </div>

          </div>

          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    ticketWindow.document.write(htmlContent);
    ticketWindow.document.close();
  };

  // -------------------------------------
  // LOAD BOOKINGS
  // -------------------------------------
  useEffect(() => {
    async function loadData() {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId) {
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        const bookingRes = await axios.get(
          `http://localhost:9004/api/v1/bookings/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const bookingList = bookingRes.data;
        setBookings(bookingList);

        const tripMap = {};
        const busMap = {};
        const routeMap = {};

        for (const b of bookingList) {
          try {
            const tripRes = await axios.get(
              `http://localhost:9003/api/v1/trips/${b.tripId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const trip = tripRes.data;
            tripMap[b.tripId] = trip;

            if (!busMap[trip.busId]) {
              const busRes = await axios.get(
                `http://localhost:9002/api/v1/buses/${trip.busId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              busMap[trip.busId] = busRes.data;
            }

            if (!routeMap[trip.routeId]) {
              const routeRes = await axios.get(
                `http://localhost:9002/api/v1/routes/${trip.routeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              routeMap[trip.routeId] = routeRes.data;
            }
          } catch {}
        }

        setTrips(tripMap);
        setBuses(busMap);
        setRoutes(routeMap);
      } catch (e) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // -------------------------------------
  // CANCEL BOOKING
  // -------------------------------------
  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;

    try {
      await axios.post(
        `http://localhost:9004/api/v1/bookings/cancel/${bookingId}`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );

      alert("Booking Cancelled Successfully");
    } catch {
      alert("Failed to cancel booking.");
    }
  };

  // -------------------------------------
  // UI RENDER
  // -------------------------------------
  if (loading)
    return (
      <div className="text-center mt-5 fw-bold fs-4 text-secondary">
        Loading your bookings...
      </div>
    );

  if (bookings.length === 0)
    return (
      <div className="text-center mt-5 fw-bold fs-5 text-muted">
        No bookings found.
      </div>
    );

  return (
    <div className="container my-4">
      <h2 className="fw-bold text-center mb-4">My Bookings</h2>

      <style>
        {`
          .booking-card {
            backdrop-filter: blur(12px);
            background: rgba(255,255,255,0.65);
            border-radius: 18px;
            transition: 0.3s ease;
            border: 1px solid rgba(255,255,255,0.4);
          }
          .booking-card:hover {
            transform: translateY(-6px);
            box-shadow: 0px 12px 45px rgba(0,0,0,0.15);
          }
          .bus-img {
            height: 160px;
            width: 100%;
            object-fit: cover;
            border-radius: 14px 14px 0 0;
          }
          .cancel-btn:hover {
            background: #b10606 !important;
          }
          .badge-status {
            padding: 6px 12px;
            border-radius: 50px;
            font-size: 0.85rem;
          }
          .badge-confirmed {
            background: #0ca92c;
            color: white;
          }
          .badge-cancelled {
            background: #777;
            color: white;
          }
        `}
      </style>

      <div className="row g-4">
        {bookings.map((booking) => {
          const trip = trips[booking.tripId];
          const bus = trip ? buses[trip.busId] : null;
          const route = trip ? routes[trip.routeId] : null;

          return (
            <div key={booking.bookingId} className="col-md-6">
              <div className="booking-card shadow-sm">
                <img
                  src="https://images.pexels.com/photos/219929/pexels-photo-219929.jpeg"
                  className="bus-img"
                  alt="Bus"
                />

                <div className="p-3">
                  <h5 className="fw-bold">
                    {bus ? `${bus.busNumber} (${bus.busType})` : "Trip Cancelled"}
                  </h5>

                  <p className="text-muted small mb-2">
                    {route
                      ? `${route.source} → ${route.destination}`
                      : "Loading route..."}
                  </p>

                  <p className="small">
                    <strong>Booking ID:</strong> {booking.bookingId}
                    <br />
                    <strong>Date:</strong>{" "}
                    {new Date(booking.bookingDate).toLocaleString()}
                    <br />
                    <strong>Departure:</strong>{" "}
                    {trip ? new Date(trip.departureTime).toLocaleString() : ""}
                    <br />
                    <strong>Seats:</strong>{" "}
                    {booking.seats.map((s) => s.seatNumber).join(", ")}
                    <br />
                    <strong>Passengers:</strong>{" "}
                    {booking.passengers.map((p) => p.name).join(", ")}
                    <br />
                    <strong>Total:</strong> ₹{booking.totalAmount.toFixed(2)}
                    <br />
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge-status ${
                        booking.status === "CONFIRMED"
                          ? "badge-confirmed"
                          : "badge-cancelled"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </p>

                  {/* BUTTONS SECTION */}
                  {booking.status === "CONFIRMED" ? (
                    <>
                      <button
                        className="btn btn-primary btn-sm mt-2 me-2"
                        onClick={() =>
                          downloadTicket(booking, trip, bus, route)
                        }
                      >
                        Download Ticket
                      </button>

                      <button
                        className="btn btn-danger btn-sm cancel-btn mt-2"
                        onClick={() => cancelBooking(booking.bookingId)}
                      >
                        Cancel Booking
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-secondary btn-sm mt-2" disabled>
                      Cancelled
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
