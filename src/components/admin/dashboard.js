// src/components/admin/dashboard.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "./navbar"; // seller-specific navbar component

const styles = `
:root{--bg:#f7f9fc;--card:#ffffff;--muted:#6f7683;--primary:#1d4ed8;--border:#e6e8ee;--success:#059669;}
.admin-root{background:var(--bg);min-height:100vh;padding:32px 26px;font-family:Inter,ui-sans-serif,system-ui,-apple-system;color:#111827;}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;}
.brand-name{font-size:26px;font-weight:800;letter-spacing:-0.3px;}
.brand-sub{font-size:14px;color:var(--muted);margin-top:4px;}
.controls{display:flex;gap:14px;}
.search{display:flex;align-items:center;gap:8px;background:white;border:1px solid var(--border);padding:10px 14px;border-radius:10px;box-shadow:0 3px 10px rgba(0,0,0,0.03);}
.search input{border:0;outline:none;background:transparent;width:230px;font-size:14px;}
.select{border:1px solid var(--border);padding:10px 12px;border-radius:10px;background:white;font-size:14px;}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px;}
.metric{background:white;border-radius:14px;padding:22px;border:1px solid var(--border);box-shadow:0 8px 28px rgba(0,0,0,0.04);}
.metric-label{font-size:14px;color:var(--muted);font-weight:600;}
.metric-value{font-size:30px;font-weight:800;margin-top:6px;}
.card{background:white;border-radius:14px;padding:22px;border:1px solid var(--border);box-shadow:0 8px 28px rgba(0,0,0,0.04);}
.table-wrap{overflow:auto;margin-top:20px;}
.table{width:100%;border-collapse:collapse;min-width:900px;}
.table thead th{padding:14px;background:#fafbfc;text-align:left;color:var(--muted);font-size:12px;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:0.7px;}
.table tbody td{padding:16px;border-bottom:1px solid #eef1f5;font-size:14px;}
.table tbody tr:hover{background:#f9fafb;}
.badge{padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;color:white;}
.badge.success{background:var(--success);}
.badge.cancel{background:#dc2626;}
.badge.pending{background:#f59e0b;}
.passenger{border-bottom:1px dashed #e4e7ec;padding-bottom:8px;margin-bottom:8px;font-size:13px;}
.small{font-size:13px;color:var(--muted);}
.pagination{display:flex;gap:10px;margin-top:16px;}
.pbtn{padding:9px 12px;border-radius:8px;background:white;border:1px solid var(--border);cursor:pointer;font-size:14px;font-weight:600;}
.pbtn[disabled]{opacity:.45;cursor:not-allowed;}
.pdf-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;}
.btn-primary{background:var(--primary);color:white;padding:10px 14px;border-radius:10px;border:0;cursor:pointer;font-weight:700;}
.btn-secondary{background:white;border:1px solid var(--border);padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:600;}
.btn-secondary:hover{background:#f8fafc;}
.btn-secondary:disabled{background:#f1f5f9;color:var(--muted);cursor:not-allowed;}
.fadeIn{animation:fadeIn .5s ease-out;}
@keyframes fadeIn{from{opacity:0} to{opacity:1}}
`;

/* ---------------------------
   DOWNLOAD TRIP BOOKINGS PDF FROM BACKEND
   --------------------------- */
const downloadTripBookingsPdf = async (tripId, event) => {
  try {
    const token = localStorage.getItem("token");
    const button = event?.target;
    
    // Show loading state
    if (button) {
      button.disabled = true;
      button.innerHTML = "Generating PDF...";
    }

    const response = await axios.get(
      `http://localhost:9004/api/v1/pdf/trip/${tripId}/bookings`,
      {
        headers: { 
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      }
    );

    // Create blob and trigger download
    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `trip_${tripId}_bookings.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup memory
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

    if (button) {
      button.disabled = false;
      button.innerHTML = `Download Trip ${tripId} PDF`;
    }
  } catch (error) {
    console.error("PDF download error:", error);
    alert("Failed to download trip bookings PDF. Please try again.");
    
    const button = event?.target;
    if (button) {
      button.disabled = false;
      button.innerHTML = `Download Trip ${tripId} PDF`;
    }
  }
};

/* ---------------------------
   CSV helper (kept for CSV export)
   --------------------------- */
function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  link.click();
}

/* ---------------------------
   Main component
   --------------------------- */
const SellerDashboard = () => {
  const [bookingsByTrip, setBookingsByTrip] = useState({});
  const [tripDetails, setTripDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("sellerId");
  const travelsName = localStorage.getItem("travelsName");

  const loadSellerData = useCallback(async () => {
    if (!sellerId) {
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const tripsRes = await axios.get(`http://localhost:9003/api/v1/trips/seller/${sellerId}`, { headers });
      const sellerTrips = tripsRes.data || [];

      if (sellerTrips.length === 0) {
        setLoading(false);
        return;
      }

      const tripIds = sellerTrips.map(t => t.id);

      const tripDetailsPromises = sellerTrips.map(async (trip) => {
        const bus = (await axios.get(`http://localhost:9002/api/v1/buses/${trip.busId}`, { headers })).data;
        const route = (await axios.get(`http://localhost:9002/api/v1/routes/${trip.routeId}`, { headers })).data;
        return { tripId: trip.id, bus, route };
      });

      const details = await Promise.all(tripDetailsPromises);
      const detailsMap = details.reduce((acc, { tripId, bus, route }) => ({ ...acc, [tripId]: { bus, route } }), {});
      setTripDetails(detailsMap);

      const bookingsPromises = tripIds.map(tripId =>
        axios.get(`http://localhost:9004/api/v1/bookings/trip/${tripId}`, { headers }).catch(err => ({ data: [] }))
      );

      const bookingsResults = await Promise.all(bookingsPromises);
      const allBookings = bookingsResults.reduce((acc, res, index) => {
        const tripId = tripIds[index];
        if (res.data && res.data.length > 0) {
          acc[tripId] = res.data;
        }
        return acc;
      }, {});
      setBookingsByTrip(allBookings);

    } catch (err) {
      console.error("Failed to load seller dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [token, sellerId]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  const flatBookings = useMemo(() => {
    return Object.entries(bookingsByTrip).flatMap(([tripId, bookings]) => {
      const details = tripDetails[tripId] || {};
      const { bus = {}, route = {} } = details;
      return (bookings || []).map(b => ({
        ...b,
        tripId,
        busNumber: (bus && bus.busNumber) || "N/A",
        routeName: route && route.source ? `${route.source} → ${route.destination}` : "N/A",
      }));
    });
  }, [bookingsByTrip, tripDetails]);

  const filtered = flatBookings.filter(r => {
    if (status !== "ALL" && r.status !== status) return false;
    const q = (search || "").toString().toLowerCase();
    return (
      (r.bookingId && r.bookingId.toString().toLowerCase().includes(q)) ||
      (r.busNumber || "").toLowerCase().includes(q) ||
      (r.routeName || "").toLowerCase().includes(q) ||
      ((r.passengers || []).some(p => (p.name || "").toLowerCase().includes(q)))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const csvRows = pageData.map(d => ({
    BookingID: d.bookingId, TripID: d.tripId, BusNumber: d.busNumber, Route: d.routeName,
    Status: d.status, Seats: (d.seats || []).map(s => s.seatNumber).join(", "), Amount: d.totalAmount,
    Date: d.bookingDate ? new Date(d.bookingDate).toLocaleString() : "", Passengers: (d.passengers || []).map(p => p.name).join("; ")
  }));

  if (loading) return <div className="admin-root">Loading Dashboard...</div>;

  return (
    <div className="admin-root fadeIn">
      <style>{styles}</style>
      {/* <AdminNavbar /> */}

      <div className="topbar">
        <div>
          <div className="brand-name">{travelsName || 'Seller'} Dashboard</div>
          <div className="brand-sub">Your Bookings & Operational Data</div>
        </div>
        <div className="controls">
          <div className="search">
            <input placeholder="Search bookings..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="ALL">All Status</option><option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option><option value="CANCELLED">Cancelled</option>
          </select>
          <button className="select" style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => downloadCSV(`bookings_page_${page}.csv`, csvRows)}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Your Total Trips</div>
          <div className="metric-value">{Object.keys(tripDetails).length}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Bookings</div>
          <div className="metric-value">{flatBookings.length}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">₹{flatBookings.reduce((sum, b) => b.status === 'CONFIRMED' ? sum + (Number(b.totalAmount) || 0) : sum, 0).toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Visible Results</div>
          <div className="metric-value">{filtered.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Your Bookings</div>
            <div className="small">Filter and search through bookings made on your trips.</div>
          </div>

          <div className="pdf-controls">
            {Object.keys(bookingsByTrip).map(tripId => (
              <button 
                key={tripId}
                className="btn-secondary" 
                onClick={(e) => downloadTripBookingsPdf(tripId, e)}
              >
                Download Trip {tripId} PDF
              </button>
            ))}
            {Object.keys(bookingsByTrip).length === 0 && (
              <span className="small text-muted">No trips with bookings</span>
            )}
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Booking</th><th>Status</th><th>Amount</th><th>Seats</th><th>Trip / Bus</th><th>Date</th><th>Passengers</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length > 0 ? pageData.map((d) => (
                <tr key={d.bookingId}>
                  <td><strong>{d.bookingId}</strong><div className="small">Trip {d.tripId}</div></td>
                  <td>
                    {d.status === "CONFIRMED" && <span className="badge success">CONFIRMED</span>}
                    {d.status === "PENDING" && <span className="badge pending">PENDING</span>}
                    {d.status === "CANCELLED" && <span className="badge cancel">CANCELLED</span>}
                  </td>
                  <td style={{ fontWeight: 700, color: "#059669" }}>₹{d.totalAmount}</td>
                  <td>{(d.seats || []).map(s => s.seatNumber).join(", ")}</td>
                  <td><strong>{d.busNumber}</strong><div className="small">{d.routeName}</div></td>
                  <td className="small">{d.bookingDate ? new Date(d.bookingDate).toLocaleString() : "N/A"}</td>
                  <td style={{ width: 260 }}>
                    {(d.passengers || []).map(p => (
                      <div key={p.passengerId || `${d.bookingId}-${p.name}`} className="passenger">
                        <strong>{p.name}</strong><div className="small">{p.gender || ""}{p.age ? `, ${p.age}` : ""}</div><div className="small">{p.contact || ""}</div>
                      </div>
                    ))}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 26, color: "var(--muted)" }}>No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pbtn" disabled={page === 1} onClick={() => setPage(1)}>First</button>
          <button className="pbtn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <button className="pbtn" disabled>{page}</button>
          <button className="pbtn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          <button className="pbtn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>Last</button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
