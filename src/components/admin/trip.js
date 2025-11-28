
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "./navbar";
/* INLINE ENTERPRISE CSS (No changes) */
const css = `
:root {
  --bg:#f6f7fb; --card:#ffffff; --border:#e4e7ec; --text:#0f172a;
  --muted:#64748b; --accent:#0b69ff; --success:#0faf71; --danger:#dc2626;
}
.page { background: var(--bg); min-height: 100vh; padding: 28px; font-family: Inter, system-ui, sans-serif; color: var(--text); }
.title { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.subtitle { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
.card { background: var(--card); padding: 22px; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 10px 32px rgba(12,20,40,0.04); margin-bottom: 26px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.input, .select { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background: white; font-size: 14px; }
.input:focus, .select:focus { outline: none; border-color: var(--accent); }
.btn { padding: 10px 16px; border-radius: 10px; border: none; background: var(--accent); color: white; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn:hover { background:#0857d5; }
.btn-secondary { background: #e5e7eb; color: #111; }
.btn-warning { background: #f6c744; color: #111; }
.btn-danger { background: var(--danger); color: white; }
.btn-sm { padding: 6px 10px; border-radius: 8px; font-size: 13px; }
.table-wrapper { overflow: auto; border-radius: 10px; }
.table { width: 100%; border-collapse: collapse; min-width: 900px; }
.table thead th { background: #f9fafb; padding: 12px; font-size: 12px; color: var(--muted); font-weight: 700; text-transform: uppercase; border-bottom: 1px solid var(--border); }
.table tbody td { padding: 14px; border-bottom: 1px solid #edf0f4; font-size: 14px; }
.table tbody tr:hover { background: #f7f9fc; }
.row-cancelled { background: #ffe7e7 !important; text-decoration: line-through; color: var(--muted); }
`;

/** Helpers for date/time handling */
const toLocalYYYYMMDD = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const toLocalHHMM = (isoString) =>
  new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const buildISOFromDateAndTime = (dateStr, timeStr) =>
  new Date(`${dateStr}T${timeStr}:00`).toISOString();
const formatTimeToHHMM = (date) => date.toTimeString().slice(0, 5);

const SellerTripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [busId, setBusId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [tripDate, setTripDate] = useState("");       // NEW: Date input
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [fare, setFare] = useState("");
  const [editingTripId, setEditingTripId] = useState(null);

  // --- SELLER CONTEXT ---
  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("sellerId");
  const travelsName = localStorage.getItem("travelsName");

  const fetchData = useCallback(async () => {
    if (!sellerId) {
      console.error("Seller not logged in.");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [busesRes, routesRes, tripsRes] = await Promise.all([
        axios.get(`http://localhost:9002/api/v1/seller/${sellerId}/buses`, { headers }),
        axios.get(`http://localhost:9002/api/v1/seller/${sellerId}/routes`, { headers }),
        axios.get(`http://localhost:9003/api/v1/trips/seller/${sellerId}`, { headers }),
      ]);
      setBuses(busesRes.data);
      setRoutes(routesRes.data);
      setTrips(tripsRes.data);
    } catch (err) {
      console.error("Failed to fetch seller data:", err);
      alert("Could not load your data. Please refresh the page.");
    }
  }, [token, sellerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /** Auto-calculate arrival time from date + departure + route.duration (minutes) */
  useEffect(() => {
    if (tripDate && departureTime && routeId) {
      const route = routes.find((r) => r.id.toString() === routeId);
      if (!route) { setArrivalTime(""); return; }

      const dep = new Date(`${tripDate}T${departureTime}:00`);
      const arr = new Date(dep.getTime() + (route.duration || 0) * 60000);
      setArrivalTime(formatTimeToHHMM(arr));
    } else {
      setArrivalTime("");
    }
  }, [tripDate, departureTime, routeId, routes]);

  const resetForm = () => {
    setBusId(""); setRouteId(""); setTripDate(""); setDepartureTime("");
    setArrivalTime(""); setFare(""); setEditingTripId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!busId || !routeId || !tripDate || !departureTime || !fare) {
      return alert("Please fill all fields.");
    }

    const departureISO = buildISOFromDateAndTime(tripDate, departureTime);
    const arrivalISO = buildISOFromDateAndTime(tripDate, arrivalTime || departureTime);

    const payload = {
      busId: +busId,
      routeId: +routeId,
      sellerId: +sellerId,
      departureTime: departureISO,
      arrivalTime: arrivalISO,
      fare: +fare,
      cancelled: false,
    };

    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingTripId) {
        const res = await axios.put(`http://localhost:9003/api/v1/trips/${editingTripId}`, payload, { headers });
        setTrips(trips.map((t) => (t.id === editingTripId ? res.data : t)));
      } else {
        const res = await axios.post("http://localhost:9003/api/v1/trips", payload, { headers });
        setTrips([...trips, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save trip:", err);
      alert(`Error: ${err.response?.data?.message || 'Could not save trip.'}`);
    }
  };

  const handleEdit = (t) => {
    setEditingTripId(t.id);
    setBusId(String(t.busId));
    setRouteId(String(t.routeId));
    setTripDate(toLocalYYYYMMDD(t.departureTime));                  // NEW: set date from departure
    setDepartureTime(new Date(t.departureTime).toTimeString().slice(0, 5));
    setArrivalTime(new Date(t.arrivalTime).toTimeString().slice(0, 5));
    setFare(String(t.fare));
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this trip? This action cannot be undone.")) return;
    try {
      const tripToCancel = trips.find(t => t.id === id);
      const payload = { ...tripToCancel, cancelled: true };
      const res = await axios.put(`http://localhost:9003/api/v1/trips/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(trips.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error("Failed to cancel trip:", err);
      alert("Could not cancel the trip.");
    }
  };

  const busLabel = (id) => buses.find((x) => x.id === Number(id))?.busNumber || "Unknown Bus";
  const routeLabel = (id) => {
    const r = routes.find((x) => x.id === Number(id));
    return r ? `${r.source} → ${r.destination}` : "Unknown Route";
  };

  return (
    <div className="page">
      <style>{css}</style>
      <AdminNavbar />
      <div className="title">My Trip Schedules</div>
      <div className="subtitle">Manage trips for <strong>{travelsName || "your agency"}</strong>.</div>

      {/* FORM CARD */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <select className="select" value={busId} onChange={(e) => setBusId(e.target.value)} required>
              <option value="">Select a Bus</option>
              {buses.map((b) => (<option key={b.id} value={b.id}>{b.busNumber} ({b.busType})</option>))}
            </select>

            <select className="select" value={routeId} onChange={(e) => setRouteId(e.target.value)} required>
              <option value="">Select a Route</option>
              {routes.map((r) => (<option key={r.id} value={r.id}>{r.source} → {r.destination}</option>))}
            </select>

            {/* NEW: Trip Date */}
            <input type="date" className="input" value={tripDate} onChange={(e) => setTripDate(e.target.value)} required />

            <input type="time" className="input" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
            <input type="time" className="input" value={arrivalTime} readOnly placeholder="Arrival (auto)" />
            <input type="number" className="input" placeholder="Fare (e.g., 500)" value={fare} min="0" step="10" onChange={(e) => setFare(e.target.value)} required />
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
            <button className="btn" type="submit" disabled={!sellerId}>{editingTripId ? "Update Trip" : "Schedule Trip"}</button>
            {editingTripId && (<button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel</button>)}
          </div>
        </form>
      </div>

      {/* TABLE CARD */}
      <div className="card">
        <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 16 }}>My Scheduled Trips</div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Bus</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Fare / Status</th><th style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length > 0 ? trips.map((t) => (
                <tr key={t.id} className={t.cancelled ? "row-cancelled" : ""}>
                  <td>{busLabel(t.busId)}</td>
                  <td>{routeLabel(t.routeId)}</td>
                  <td>{toLocalYYYYMMDD(t.departureTime)} {toLocalHHMM(t.departureTime)}</td>
                  <td>{toLocalYYYYMMDD(t.arrivalTime)} {toLocalHHMM(t.arrivalTime)}</td>
                  <td>
                    {t.cancelled ? (<span style={{ color: "var(--danger)", fontWeight: 700 }}>Cancelled</span>) : (`₹${Number(t.fare).toFixed(2)}`)}
                  </td>
                  <td>
                    {!t.cancelled && (
                      <>
                        <button className="btn-sm btn-warning" onClick={() => handleEdit(t)}>Edit</button>
                        <button className="btn-sm btn-danger" style={{ marginLeft: 6 }} onClick={() => handleCancel(t.id)}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 20, color: "var(--muted)" }}>No trips have been scheduled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerTripManagement;
