// src/components/admin/AdminAnalyticsDashboard.js
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";

const styles = `
:root{
  --bg: #f5f7fb;
  --card: #ffffff;
  --muted: #6b7280;
  --text: #0f172a;
  --primary: #0b74f6;
  --success: #059669;
  --warning: #f59e0b;
  --danger: #dc2626;
  --border: #e6eef8;
  --shadow: 0 8px 28px rgba(2,6,23,0.06);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.page {
  background: var(--bg);
  min-height: 100vh;
  padding: 28px;
  color: var(--text);
}
.container { max-width: 1200px; margin: 0 auto; }
.header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:18px; flex-wrap:wrap; }
.title { font-size:24px; font-weight:800; }
.subtitle { color:var(--muted); margin-top:6px; font-size:13px; }
.grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:20px; }
.card { background:var(--card); border-radius:12px; padding:18px; border:1px solid var(--border); box-shadow:var(--shadow); }
.metric-value { font-size:28px; font-weight:800; color:var(--primary); }
.metric-label { font-size:13px; color:var(--muted); margin-top:6px; }
.charts { display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap:18px; margin-bottom:20px; }
.chart-card { padding:16px; border-radius:12px; border:1px solid var(--border); background:var(--card); box-shadow:var(--shadow); }
.chart-title { font-weight:700; margin-bottom:10px; }
.canvas-wrap { background:#f8fafc; border-radius:10px; padding:12px; min-height:260px; display:flex; align-items:flex-start; justify-content:center; }
.table { width:100%; border-collapse:collapse; }
.table th { text-align:left; padding:12px; font-size:13px; color:var(--muted); background:#fbfdff; border-bottom:1px solid var(--border); }
.table td { padding:12px; border-bottom:1px solid #eef4ff; font-size:14px; vertical-align:middle; }
.badge { padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; color:white; }
.badge.confirm { background:var(--success); }
.badge.pending { background:var(--warning); }
.badge.cancel { background:var(--danger); }
.controls { display:flex; gap:10px; align-items:center; margin-bottom:12px; flex-wrap:wrap; }
.search { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; background:white; border:1px solid #e9f1ff; }
.search input { border:0; outline:none; width:200px; font-size:14px; }
.small { font-size:13px; color:var(--muted); }
.empty { text-align:center; padding:28px; color:var(--muted); }
@media (max-width:880px) {
  .header { flex-direction:column; align-items:flex-start; }
  .search input { width:140px; }
}
`;

const AdminAnalyticsDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");

  const revenueCanvasRef = useRef(null);
  const userCanvasRef = useRef(null);

  // Fetch data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [bookingsRes, usersRes] = await Promise.all([
          axios.get("http://localhost:9004/api/v1/bookings/all").catch(e => ({ data: [] })),
          axios.get("http://localhost:9001/api/admin/users/all").catch(e => ({ data: [] }))
        ]);

        if (!mounted) return;
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (mounted) setError("Failed to load analytics data. Check server connection.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  // Derived analytics
  const analytics = useMemo(() => {
    const confirmedBookings = bookings.filter(b => String(b.status || "").toUpperCase() === "CONFIRMED");
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const uniqueUsers = new Set((users || []).map(u => u.email)).size;
    const verifiedUsers = (users || []).filter(u => u.verified).length;
    const frozenUsers = (users || []).filter(u => String(u.status || "").toUpperCase() === "FROZEN").length;

    // monthly revenue (sort months ascending)
    const monthlyRevenueMap = {};
    confirmedBookings.forEach(b => {
      const d = b.bookingDate ? new Date(b.bookingDate) : null;
      const month = d ? d.toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "Unknown";
      monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + (Number(b.totalAmount) || 0);
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"));

    // user registration trend
    const userTrendMap = {};
    (users || []).forEach(u => {
      const d = u.profileCreatedAt ? new Date(u.profileCreatedAt) : null;
      const month = d ? d.toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "Unknown";
      userTrendMap[month] = (userTrendMap[month] || 0) + 1;
    });

    const userTrend = Object.entries(userTrendMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month + " 1") - new Date(b.month + " 1"));

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      totalRevenue,
      uniqueUsers,
      verifiedUsers,
      frozenUsers,
      monthlyRevenue,
      userTrend,
    };
  }, [bookings, users]);

  // Canvas drawing helpers
  const drawBarChart = useCallback((canvas, data, options = {}) => {
    if (!canvas || !data || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    const maxVal = Math.max(...data.map(d => (options.valueKey ? d[options.valueKey] : d.revenue)), 1);
    const padding = 20;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const gap = 12;
    const barWidth = Math.max(18, (usableWidth - (data.length - 1) * gap) / data.length);

    data.forEach((item, i) => {
      const val = options.valueKey ? item[options.valueKey] : item.revenue;
      const barHeight = (val / maxVal) * (usableHeight * 0.8);
      const x = padding + i * (barWidth + gap);
      const y = height - padding - barHeight;

      ctx.fillStyle = options.color || "#1d4ed8";
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#111827";
      ctx.font = "12px Inter, Arial";
      ctx.textAlign = "center";
      ctx.fillText(options.formatValue ? options.formatValue(val) : String(val), x + barWidth / 2, y - 6);

      // month label (wrap if long)
      ctx.fillStyle = "#374151";
      ctx.font = "11px Inter, Arial";
      const label = item.month || "";
      ctx.fillText(label, x + barWidth / 2, height - 6);
    });
  }, []);

  // Draw charts when analytics change
  useEffect(() => {
    if (!loading) {
      // set canvas pixel size to device pixel ratio for sharper rendering
      const setCanvasSize = (canvas) => {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const revCanvas = revenueCanvasRef.current;
      const usrCanvas = userCanvasRef.current;

      if (revCanvas) {
        setCanvasSize(revCanvas);
        drawBarChart(revCanvas, analytics.monthlyRevenue, {
          valueKey: "revenue",
          color: "#1d4ed8",
          formatValue: (v) => `₹${Number(v).toLocaleString("en-IN")}`
        });
      }
      if (usrCanvas) {
        setCanvasSize(usrCanvas);
        drawBarChart(usrCanvas, analytics.userTrend, {
          valueKey: "count",
          color: "#059669",
          formatValue: (v) => `${v}`
        });
      }
    }
  }, [analytics, drawBarChart, loading]);

  const filteredBookings = useMemo(() => {
    const q = (query || "").toString().toLowerCase().trim();
    if (!q) return bookings;
    return bookings.filter(b => {
      return (
        String(b.bookingId || b.id || "").toLowerCase().includes(q) ||
        String(b.userEmail || b.email || "").toLowerCase().includes(q) ||
        String(b.status || "").toLowerCase().includes(q) ||
        String(b.busNumber || b.busNo || "").toLowerCase().includes(q)
      );
    });
  }, [bookings, query]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading analytics...</div>;
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <div className="page">
      <style>{styles}</style>
      <div className="container">
        <div className="header">
          <div>
            <div className="title">Admin Analytics</div>
            <div className="subtitle">High-level overview of bookings, revenue and user activity</div>
          </div>

          <div className="controls">
            <div className="search" role="search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.6 }}>
                <path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                placeholder="Search bookings or users..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search analytics"
              />
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <div className="metric-value">₹{Number(analytics.totalRevenue || 0).toLocaleString("en-IN")}</div>
            <div className="metric-label">Total Revenue</div>
          </div>

          <div className="card">
            <div className="metric-value">{analytics.confirmedBookings}</div>
            <div className="metric-label">Confirmed Bookings</div>
          </div>

          <div className="card">
            <div className="metric-value">{analytics.uniqueUsers}</div>
            <div className="metric-label">Total Users</div>
          </div>

          <div className="card">
            <div className="metric-value">{analytics.verifiedUsers}</div>
            <div className="metric-label">Verified Users</div>
          </div>

          <div className="card">
            <div className="metric-value" style={{ color: "var(--danger)" }}>{analytics.frozenUsers}</div>
            <div className="metric-label">Frozen Accounts</div>
          </div>

          <div className="card">
            <div className="metric-value">{analytics.totalBookings}</div>
            <div className="metric-label">Total Bookings</div>
          </div>
        </div>

        <div className="charts">
          <div className="chart-card">
            <div className="chart-title">Monthly Revenue Trend</div>
            <div className="canvas-wrap">
              <canvas ref={revenueCanvasRef} style={{ width: "100%", height: 250 }} aria-label="Monthly revenue chart" />
            </div>
            <div style={{ marginTop: 10 }} className="small">Total: ₹{Number(analytics.totalRevenue || 0).toLocaleString("en-IN")}</div>
          </div>

          <div className="chart-card">
            <div className="chart-title">User Registrations Trend</div>
            <div className="canvas-wrap">
              <canvas ref={userCanvasRef} style={{ width: "100%", height: 250 }} aria-label="User registrations chart" />
            </div>
            <div style={{ marginTop: 10 }} className="small">{analytics.uniqueUsers} unique users</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 700 }}>Recent Confirmed Bookings</div>
            <div className="small">{filteredBookings.filter(b => String(b.status || "").toUpperCase() === "CONFIRMED").length} confirmed</div>
          </div>

          {filteredBookings.filter(b => String(b.status || "").toUpperCase() === "CONFIRMED").length === 0 ? (
            <div className="empty">No confirmed bookings available.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table" role="table" aria-label="recent bookings table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Seats</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings
                    .filter(b => String(b.status || "").toUpperCase() === "CONFIRMED")
                    .slice(0, 12)
                    .map((booking) => (
                      <tr key={booking.id || booking.bookingId || Math.random()}>
                        <td><strong>#{booking.id || booking.bookingId || "N/A"}</strong></td>
                        <td>{booking.userEmail || booking.email || booking.user || "N/A"}</td>
                        <td style={{ color: "var(--success)", fontWeight: 700 }}>₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}</td>
                        <td>{(booking.seats || []).map(s => s.seatNumber || s).join(", ") || "N/A"}</td>
                        <td>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "N/A"}</td>
                        <td><span className="badge confirm">CONFIRMED</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
