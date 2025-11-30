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
.pdf-controls{display:flex;gap:12px;align-items:center;}
.btn-primary{background:var(--primary);color:white;padding:10px 14px;border-radius:10px;border:0;cursor:pointer;font-weight:700;}
.btn-secondary{background:white;border:1px solid var(--border);padding:10px 14px;border-radius:10px;cursor:pointer;}
.fadeIn{animation:fadeIn .5s ease-out;}
@keyframes fadeIn{from{opacity:0} to{opacity:1}}
`;

/* ---------------------------
   Utility: dynamic script loader
   --------------------------- */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = Array.from(document.getElementsByTagName("script")).find(s => s.src === src);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") return resolve();
      existing.addEventListener("load", () => {
        existing.setAttribute("data-loaded", "true");
        resolve();
      });
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.setAttribute("data-loaded", "true");
      resolve();
    };
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

/* ---------------------------
   createPdfFromRows
   - loads html2canvas + jsPDF from CDN
   - builds offscreen HTML table, renders to canvas, slices pages, saves PDF
   --------------------------- */
async function createPdfFromRows(rows, title = "Bookings") {
  if (!rows || rows.length === 0) {
    alert("No rows to download for this status.");
    return;
  }

  const HTML2CANVAS = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  const JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

  try {
    await loadScript(HTML2CANVAS);
    await loadScript(JSPDF);
  } catch (err) {
    console.error("Failed to load PDF libraries:", err);
    alert("Unable to load PDF libraries. Please check your connection and try again.");
    return;
  }

  // build off-screen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1200px";
  container.style.background = "white";
  container.id = "pdf-offscreen-container";

  const headerHtml = `
    <div style="padding:12px 16px;border-bottom:1px solid #e6e8ee;">
      <h2 style="margin:0;font-family:Inter,Arial,Helvetica,sans-serif">${title}</h2>
      <div style="margin-top:4px;color:#6f7683;font-size:13px">Generated: ${new Date().toLocaleString()}</div>
    </div>
  `;

  const tableHead = `
    <thead>
      <tr>
        <th>Booking ID</th>
        <th>Status</th>
        <th>Amount</th>
        <th>Seats</th>
        <th>Trip/Bus</th>
        <th>Date</th>
        <th>Passengers</th>
      </tr>
    </thead>
  `;

  const tableRowsHtml = rows.map(r => {
    const seats = (r.seats || []).map(s => s.seatNumber).join(", ");
    const passengers = (r.passengers || []).map(p => `${p.name}${p.age ? ` (${p.age})` : ""}`).join("; ");
    const route = r.routeName || "N/A";
    const bus = r.busNumber || "N/A";
    const date = r.bookingDate ? new Date(r.bookingDate).toLocaleString() : "N/A";
    return `
      <tr>
        <td>${r.bookingId}</td>
        <td>${r.status}</td>
        <td>₹${r.totalAmount ?? ""}</td>
        <td>${seats}</td>
        <td>${bus} / ${route}</td>
        <td>${date}</td>
        <td>${passengers}</td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <style>
      .pdf-wrap{padding:18px 20px;}
      .pdf-table{width:100%;border-collapse:collapse;font-family:Inter,Arial,Helvetica,sans-serif;}
      .pdf-table th{border:1px solid #e6e8ee;padding:8px;background:#fafbfc;text-align:left;font-weight:700;}
      .pdf-table td{border:1px solid #e6e8ee;padding:8px;vertical-align:top;}
    </style>
    <div class="pdf-wrap">
      ${headerHtml}
      <table class="pdf-table">
        ${tableHead}
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // render to canvas
    // html2canvas should be available at window.html2canvas
    const canvas = await window.html2canvas(container, { scale: 1.5, useCORS: true, allowTaint: true });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf || (window.jspdf ? window.jspdf : window);
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - 40;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    if (imgHeight <= pageHeight - 40) {
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    } else {
      // slicing approach
      const tmpCanvas = document.createElement("canvas");
      const tmpCtx = tmpCanvas.getContext("2d");
      tmpCanvas.width = canvas.width;

      const ratio = imgWidth / canvas.width;
      tmpCanvas.height = Math.floor((pageHeight - 40) / ratio);

      let y = 0;
      let first = true;
      while (y < canvas.height) {
        tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(canvas, 0, y, tmpCanvas.width, tmpCanvas.height, 0, 0, tmpCanvas.width, tmpCanvas.height);
        const sliceData = tmpCanvas.toDataURL("image/png");
        if (!first) pdf.addPage();
        pdf.addImage(sliceData, "PNG", 20, 20, imgWidth, (tmpCanvas.height * imgWidth) / tmpCanvas.width);
        first = false;
        y += tmpCanvas.height;
      }
    }

    const fileName = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.pdf`;
    pdf.save(fileName);

  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate PDF. See console for details.");
  } finally {
    const el = document.getElementById("pdf-offscreen-container");
    if (el) el.remove();
  }
}

/* ---------------------------
   CSV helper
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

  const handleDownloadStatusPDF = async (targetStatus) => {
    const rows = flatBookings.filter(b => b.status === targetStatus);
    const title = `${targetStatus}_Bookings`;
    await createPdfFromRows(rows, title);
  };

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
            <button className="btn-secondary" onClick={() => handleDownloadStatusPDF("CONFIRMED")}>Download CONFIRMED PDF</button>
            <button className="btn-secondary" onClick={() => handleDownloadStatusPDF("CANCELLED")}>Download CANCELLED PDF</button>
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
