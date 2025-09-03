import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminTripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Form state
  const [busId, setBusId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [fare, setFare] = useState("");

  const [editingTripId, setEditingTripId] = useState(null);

  // Load buses, routes, trips
  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    fetchTrips();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await axios.get("http://localhost:9002/api/v1/buses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBuses(response.data);
    } catch (error) {
      console.error("Failed to load buses", error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get("http://localhost:9002/api/v1/routes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRoutes(response.data);
    } catch (error) {
      console.error("Failed to load routes", error);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await axios.get("http://localhost:9003/api/v1/trips", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTrips(response.data);
    } catch (error) {
      console.error("Failed to load trips", error);
    }
  };

  // Calculate arrivalTime automatically on departureTime or routeId change
  useEffect(() => {
    if (departureTime && routeId) {
      const route = routes.find((r) => r.id.toString() === routeId);
      if (!route) {
        setArrivalTime("");
        return;
      }
      const [hour, minute] = departureTime.split(":").map(Number);
      const departureDate = new Date();
      departureDate.setHours(hour, minute, 0, 0);

      const routeDurationInMinutes = route.duration || 0;

      const arrivalDate = new Date(departureDate.getTime() + routeDurationInMinutes * 60000);

      const formattedArrival = arrivalDate.toTimeString().slice(0, 5);
      setArrivalTime(formattedArrival);
    } else {
      setArrivalTime("");
    }
  }, [departureTime, routeId, routes]);

  const resetForm = () => {
    setBusId("");
    setRouteId("");
    setDepartureTime("");
    setArrivalTime("");
    setFare("");
    setEditingTripId(null);
  };

  // Add or update trip
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!busId || !routeId || !departureTime || !arrivalTime || !fare) {
      alert("All fields are required");
      return;
    }

    const [depHour, depMinute] = departureTime.split(":").map(Number);
    const today = new Date();
    const departureDateTime = new Date(today);
    departureDateTime.setHours(depHour, depMinute, 0, 0);

    const [arrHour, arrMinute] = arrivalTime.split(":").map(Number);
    const arrivalDateTime = new Date(today);
    arrivalDateTime.setHours(arrHour, arrMinute, 0, 0);

    const tripPayload = {
      busId: parseInt(busId, 10),
      routeId: parseInt(routeId, 10),
      departureTime: departureDateTime.toISOString(),
      arrivalTime: arrivalDateTime.toISOString(),
      fare: parseFloat(fare),
      cancelled: false,
    };

    try {
      let response;

      if (editingTripId) {
        response = await axios.put(
          `http://localhost:9003/api/v1/trips/${editingTripId}`,
          tripPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setTrips(trips.map(t => (t.id === editingTripId ? response.data : t)));
      } else {
        response = await axios.post("http://localhost:9003/api/v1/trips", tripPayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setTrips([...trips, response.data]);
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save trip", error);
      alert("Failed to save trip");
    }
  };

  const handleEdit = (trip) => {
    setEditingTripId(trip.id);
    setBusId(trip.busId.toString());
    setRouteId(trip.routeId.toString());

    const depDate = new Date(trip.departureTime);
    setDepartureTime(depDate.toTimeString().slice(0, 5));

    const arrDate = new Date(trip.arrivalTime);
    setArrivalTime(arrDate.toTimeString().slice(0, 5));

    setFare(trip.fare.toString());
  };

  // Cancel trip (mark as cancelled)
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;

    try {
      const response = await axios.put(
        `http://localhost:9003/api/v1/trips/${id}`,
        { cancelled: true },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setTrips(trips.map(t => (t.id === id ? response.data : t)));
    } catch (error) {
      console.error("Failed to cancel trip", error);
      alert("Failed to cancel trip");
    }
  };

  const getBusDisplayName = (id) => {
    const bus = buses.find(b => b.id.toString() === id);
    return bus ? `${bus.busNumber} (${bus.operatorName})` : "Unknown Bus";
  };

  const getRouteDisplayName = (id) => {
    const route = routes.find(r => r.id.toString() === id);
    return route ? `${route.source} → ${route.destination}` : "Unknown Route";
  };

  return (
    <div className="container my-4" style={{ minHeight: '450px' }}>
      <h3>Trip Scheduling</h3>

      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-3">
            <select className="form-select" value={busId} onChange={e => setBusId(e.target.value)} required>
              <option value="">Select Bus</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>
                  {bus.busNumber} ({bus.operatorName})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select className="form-select" value={routeId} onChange={e => setRouteId(e.target.value)} required>
              <option value="">Select Route</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.source} → {route.destination}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="time"
              className="form-control"
              value={departureTime}
              onChange={e => setDepartureTime(e.target.value)}
              required
            />
          </div>

          <div className="col-md-2">
            <input type="time" className="form-control" value={arrivalTime} readOnly />
          </div>

          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Fare"
              value={fare}
              onChange={e => setFare(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="text-end mt-3">
          <button className="btn btn-primary" type="submit">
            {editingTripId ? "Update Trip" : "Add Trip"}
          </button>
          {editingTripId && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h5>Scheduled Trips</h5>
      {trips.length === 0 ? (
        <p>No trips scheduled yet.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Bus</th>
              <th>Route</th>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Fare / Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(({ id, busId, routeId, departureTime, arrivalTime, fare, cancelled }) => (
              <tr key={id} className={cancelled ? "table-danger" : ""}>
                <td>{getBusDisplayName(busId.toString())}</td>
                <td>{getRouteDisplayName(routeId.toString())}</td>
                <td>{new Date(departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{new Date(arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{cancelled ? <span className="text-danger fw-bold">Cancelled</span> : `₹${fare.toFixed(2)}`}</td>
                <td>
                  {!cancelled && (
                    <>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit({ id, busId, routeId, departureTime, arrivalTime, fare })}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleCancel(id)}>
                        Cancel
                      </button>
                    </>
                  )}
                  {cancelled && <em>No actions</em>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTripManagement;
