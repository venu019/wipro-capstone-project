import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "./navbar";

/* (Your Enterprise CSS remains the same) */
const css = `
:root {
  --bg:#f6f7fb;
  --card:#ffffff;
  --border:#e4e7ec;
  --text:#0f172a;
  --muted:#64748b;
  --accent:#0b69ff;
  --danger:#dc2626;
}
.page { background:var(--bg); min-height:100vh; padding:28px; font-family: Inter, ui-sans-serif, system-ui; color:var(--text); }
.title { font-size:22px; font-weight:800; margin-bottom:6px; }
.subtitle { font-size:14px; color:var(--muted); margin-bottom:24px; }
.card { background:var(--card); border-radius:14px; padding:22px; border:1px solid var(--border); box-shadow:0 10px 32px rgba(12,20,40,0.04); margin-bottom:24px; }
.form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; }
.input, .select { padding:10px 12px; border-radius:10px; border:1px solid var(--border); background:white; font-size:14px; }
.input:focus, .select:focus { outline:none; border-color:var(--accent); }
.btn { padding:10px 16px; border-radius:10px; border:1px solid var(--border); background:var(--accent); color:white; font-weight:700; cursor:pointer; transition:0.2s; }
.btn:hover { background:#0857d5; }
.btn-secondary { background:#e5e7eb; color:#111; }
.btn-danger { background:var(--danger); color:white; border:0; }
.btn-small { padding:6px 10px; font-size:13px; border-radius:8px; }
.table-wrapper { overflow:auto; border-radius:8px; }
.table { width:100%; border-collapse:collapse; min-width:820px; }
.table thead th { background:#f9fafb; padding:12px; font-size:12px; font-weight:700; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--border); }
.table tbody td { padding:14px; border-bottom:1px solid #edf0f4; font-size:14px; }
.table tbody tr:hover { background:#f7f9fc; }
.row-edit { background:#eef4ff !important; }
`;

const SellerRouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [editingRouteId, setEditingRouteId] = useState(null);

  // --- GET SELLER-SPECIFIC DATA FROM LOCALSTORAGE ---
  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("sellerId");
  const travelsName = localStorage.getItem("travelsName");

  // --- FETCH SELLER'S ROUTES ---
  const fetchRoutes = useCallback(async () => {
    if (!sellerId) {
      console.error("Seller ID not found. Please log in.");
      return;
    }
    try {
      // **CHANGE**: Use the new seller-specific endpoint to fetch routes
      const res = await axios.get(`http://localhost:9002/api/v1/seller/${sellerId}/routes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutes(res.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      alert("Could not load your routes. Please try again.");
    }
  }, [token, sellerId]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const resetForm = () => {
    setSource("");
    setDestination("");
    setDistance("");
    setDuration("");
    setEditingRouteId(null);
  };

  // --- ADD OR UPDATE ROUTE ---
  const handleAddOrUpdateRoute = async (e) => {
    e.preventDefault();

    if (!source.trim() || !destination.trim()) return alert("Source and Destination are required.");
    const distVal = distance === "" ? 0 : parseFloat(distance);
    const durVal = duration === "" ? 0 : parseInt(duration, 10);
    if (distVal <= 0 || durVal <= 0) return alert("Distance and Duration must be positive numbers.");

    // **CHANGE**: Automatically include the sellerId in the payload
    const routeData = {
      source: source.trim(),
      destination: destination.trim(),
      distance: distVal,
      duration: durVal,
      sellerId: sellerId, // Add sellerId to the request
    };

    try {
      if (editingRouteId) {
        // --- UPDATE ---
        const res = await axios.put(
          `http://localhost:9002/api/v1/routes/${editingRouteId}`,
          routeData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRoutes(routes.map((r) => (r.id === editingRouteId ? res.data : r)));
      } else {
        // --- ADD NEW ---
        const res = await axios.post(
          "http://localhost:9002/api/v1/routes",
          routeData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRoutes([...routes, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error("Operation failed:", err);
      alert(`Failed to save route: ${err.response?.data?.message || 'Check console.'}`);
    }
  };

  const handleEditClick = (route) => {
    setEditingRouteId(route.id);
    setSource(route.source);
    setDestination(route.destination);
    setDistance(String(route.distance));
    setDuration(String(route.duration));
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await axios.delete(`http://localhost:9002/api/v1/routes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutes(routes.filter((r) => r.id !== id));
      if (editingRouteId === id) resetForm();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Failed to delete route: ${err.response?.data?.message || 'Check console.'}`);
    }
  };

  return (
    <div className="page">
      <style>{css}</style>
      <AdminNavbar />

      <div className="title">My Route Management</div>
      <div className="subtitle">Manage routes for <strong>{travelsName || 'your agency'}</strong>. Add, edit, or remove operating routes.</div>

      {/* FORM CARD */}
      <div className="card">
        <form onSubmit={handleAddOrUpdateRoute}>
          <div className="form-grid">
            <input className="input" placeholder="Source City" value={source}
              onChange={(e) => setSource(e.target.value)} required />

            <input className="input" placeholder="Destination City" value={destination}
              onChange={(e) => setDestination(e.target.value)} required />

            <input className="input" type="number" min="1" placeholder="Distance (km)"
              value={distance} onChange={(e) => setDistance(e.target.value)} required />

            <input className="input" type="number" min="1" placeholder="Duration (minutes)"
              value={duration} onChange={(e) => setDuration(e.target.value)} required />
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
            <button className="btn" type="submit">
              {editingRouteId ? "Update Route" : "Add Route"}
            </button>

            {editingRouteId && (
              <button className="btn btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE CARD */}
      <div className="card">
        <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 16 }}>My Route List</div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Destination</th>
                <th>Distance (km)</th>
                <th>Duration (min)</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className={editingRouteId === r.id ? "row-edit" : ""}>
                  <td>{r.source}</td>
                  <td>{r.destination}</td>
                  <td>{r.distance}</td>
                  <td>{r.duration}</td>
                  <td>
                    <button className="btn-small btn-secondary" onClick={() => handleEditClick(r)}>
                      Edit
                    </button>
                    <button className="btn-small btn-danger" style={{ marginLeft: 6 }}
                      onClick={() => handleDeleteClick(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 20, color: "var(--muted)" }}>
                    You have not added any routes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerRouteManagement;
