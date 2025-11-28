import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "./navbar"; // Assuming this is your seller-specific navbar

const styles = `
/* (Your enterprise CSS remains unchanged) */
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
.fadeIn{animation:fadeIn .5s ease-out;}
@keyframes fadeIn{from{opacity:0} to{opacity:1}}
`;

function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  link.click();
}

const SellerDashboard = () => {
  const [bookingsByTrip, setBookingsByTrip] = useState({});
  const [tripDetails, setTripDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // --- GET SELLER-SPECIFIC DATA ---
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
      
      // 1. Fetch all trips that belong to the seller
      const tripsRes = await axios.get(`http://localhost:9003/api/v1/trips/seller/${sellerId}`, { headers });
      const sellerTrips = tripsRes.data;

      if (!sellerTrips || sellerTrips.length === 0) {
        setLoading(false);
        return;
      }
      
      console.log("Seller trips:", sellerTrips);
      const tripIds = sellerTrips.map(t => t.id);

      // 2. Fetch details for all the seller's trips (buses, routes) in parallel
      const tripDetailsPromises = sellerTrips.map(async (trip) => {
        const bus = (await axios.get(`http://localhost:9002/api/v1/buses/${trip.busId}`, { headers })).data;
        const route = (await axios.get(`http://localhost:9002/api/v1/routes/${trip.routeId}`, { headers })).data;
        return { tripId: trip.id, bus, route };
      });

      const details = await Promise.all(tripDetailsPromises);
      const detailsMap = details.reduce((acc, {tripId, bus, route}) => ({...acc, [tripId]: {bus, route}}), {});
      setTripDetails(detailsMap);

      // 3. Fetch all bookings for each of the seller's trips
      const bookingsPromises = tripIds.map(tripId =>
        axios.get(`http://localhost:9004/api/v1/bookings/trip/${tripId}`, { headers })
      );
      
      const bookingsResults = await Promise.all(bookingsPromises);
      const allBookings = bookingsResults.reduce((acc, res, index) => {
        const tripId = tripIds[index];
        if (res.data && res.data.length > 0) {
          acc[tripId] = res.data;
        }
        return acc;
      }, {});
      console.log("Bookings by trip:", allBookings);
      setBookingsByTrip(allBookings);

    } catch (err) {
      console.error("Failed to load seller dashboard data:", err);
      // Handle error display to the user
    } finally {
      setLoading(false);
    }
  }, [token, sellerId]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  // Flatten the booking data for easy filtering and pagination
  const flatBookings = useMemo(() => {
    return Object.entries(bookingsByTrip).flatMap(([tripId, bookings]) => {
      const details = tripDetails[tripId] || {};
      const { bus = {}, route = {} } = details;
      return bookings.map(b => ({
        ...b,
        tripId,
        busNumber: bus.busNumber || "N/A",
        routeName: route.source ? `${route.source} → ${route.destination}` : "N/A",
      }));
    });
  }, [bookingsByTrip, tripDetails]);
  
  // Apply search and status filters
  const filtered = flatBookings.filter(r => {
    if (status !== "ALL" && r.status !== status) return false;
    const q = search.toLowerCase();
    return (
      r.bookingId.toString().includes(q) ||
      r.busNumber.toLowerCase().includes(q) ||
      r.routeName.toLowerCase().includes(q) ||
      (r.passengers && r.passengers.some(p => p.name.toLowerCase().includes(q)))
    );
  });
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Prepare data for CSV export
  const csvRows = pageData.map(d => ({
    BookingID: d.bookingId, TripID: d.tripId, BusNumber: d.busNumber, Route: d.routeName,
    Status: d.status, Seats: d.seats.map(s => s.seatNumber).join(", "), Amount: d.totalAmount,
    Date: new Date(d.bookingDate).toLocaleString(),
    Passengers: d.passengers.map(p => p.name).join("; ")
  }));

  if (loading) return <div className="admin-root">Loading Dashboard...</div>;

  return (
    <div className="admin-root fadeIn">
      <style>{styles}</style>
      <AdminNavbar />

      <div className="topbar">
        <div>
          <div className="brand-name">{travelsName || 'Seller'} Dashboard</div>
          <div className="brand-sub">Your Bookings & Operational Data</div>
        </div>
        <div className="controls">
          <div className="search">
            <input placeholder="Search bookings..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <select className="select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="ALL">All Status</option><option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option><option value="CANCELLED">Cancelled</option>
          </select>
          <button className="select" style={{ cursor:"pointer", fontWeight:600 }} onClick={() => downloadCSV("bookings.csv", csvRows)}>
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
          <div className="metric-value">₹{flatBookings.reduce((sum, b) => b.status === 'CONFIRMED' ? sum + b.totalAmount : sum, 0).toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Visible Results</div>
          <div className="metric-value">{filtered.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Your Bookings</div>
        <div className="small">Filter and search through bookings made on your trips.</div>
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
                  <td style={{ fontWeight:700, color: "#059669" }}>₹{d.totalAmount}</td>
                  <td>{d.seats.map(s => s.seatNumber).join(", ")}</td>
                  <td><strong>{d.busNumber}</strong><div className="small">{d.routeName}</div></td>
                  <td className="small">{new Date(d.bookingDate).toLocaleString()}</td>
                  <td style={{ width:260 }}>
                    {d.passengers.map(p => (
                      <div key={p.passengerId} className="passenger">
                        <strong>{p.name}</strong><div className="small">{p.gender}, {p.age}</div><div className="small">{p.contact}</div>
                      </div>
                    ))}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={{ textAlign:"center", padding:26, color:"var(--muted)" }}>No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button className="pbtn" disabled={page===1} onClick={()=>setPage(1)}>First</button>
          <button className="pbtn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <button className="pbtn" disabled>{page}</button>
          <button className="pbtn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
          <button className="pbtn" disabled={page===totalPages} onClick={()=>setPage(totalPages)}>Last</button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
