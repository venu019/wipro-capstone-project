import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

const AdminAnalyticsDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all bookings
        const bookingsRes = await axios.get('http://localhost:9004/api/v1/bookings/all');
        setBookings(bookingsRes.data);
        
        // Fetch all users
        const usersRes = await axios.get('http://localhost:9001/api/admin/users/all');
        setUsers(usersRes.data);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Analytics calculations
  const analytics = useMemo(() => {
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const uniqueUsers = [...new Set(users.map(u => u.email))].length;
    const verifiedUsers = users.filter(u => u.verified).length;
    const frozenUsers = users.filter(u => u.status === 'FROZEN').length;
    
    // Monthly revenue data for chart
    const monthlyRevenue = {};
    confirmedBookings.forEach(b => {
      const month = new Date(b.bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.totalAmount || 0);
    });

    // User registration trend
    const userTrend = {};
    users.forEach(u => {
      const month = new Date(u.profileCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      userTrend[month] = (userTrend[month] || 0) + 1;
    });

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      totalRevenue,
      uniqueUsers,
      verifiedUsers,
      frozenUsers,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
      userTrend: Object.entries(userTrend).map(([month, count]) => ({ month, count })),
    };
  }, [bookings, users]);

  // ✅ FIXED: Chart drawing effect inside component
  const drawCharts = useCallback(() => {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx && analytics.monthlyRevenue.length) {
      const maxRevenue = Math.max(...analytics.monthlyRevenue.map(d => d.revenue));
      const width = 350, height = 200, barWidth = 40, gap = 10;
      
      revenueCtx.clearRect(0, 0, width, height);
      revenueCtx.fillStyle = '#f8fafc';
      revenueCtx.fillRect(0, 0, width, height);
      
      analytics.monthlyRevenue.forEach((item, i) => {
        const barHeight = (item.revenue / maxRevenue) * height * 0.8;
        const x = i * (barWidth + gap) + 20;
        const y = height - barHeight - 20;
        
        revenueCtx.fillStyle = '#1d4ed8';
        revenueCtx.fillRect(x, y, barWidth, barHeight);
        revenueCtx.fillStyle = '#111827';
        revenueCtx.font = '12px Inter';
        revenueCtx.textAlign = 'center';
        revenueCtx.fillText(item.revenue.toLocaleString(), x + barWidth/2, y - 5);
        revenueCtx.fillText(item.month, x + barWidth/2, height - 5);
      });
    }

    // User Chart
    const userCtx = document.getElementById('userChart')?.getContext('2d');
    if (userCtx && analytics.userTrend.length) {
      const maxUsers = Math.max(...analytics.userTrend.map(d => d.count));
      const width = 350, height = 200, barWidth = 40, gap = 10;
      
      userCtx.clearRect(0, 0, width, height);
      userCtx.fillStyle = '#f8fafc';
      userCtx.fillRect(0, 0, width, height);
      
      analytics.userTrend.forEach((item, i) => {
        const barHeight = (item.count / maxUsers) * height * 0.8;
        const x = i * (barWidth + gap) + 20;
        const y = height - barHeight - 20;
        
        userCtx.fillStyle = '#059669';
        userCtx.fillRect(x, y, barWidth, barHeight);
        userCtx.fillStyle = '#111827';
        userCtx.font = '12px Inter';
        userCtx.textAlign = 'center';
        userCtx.fillText(item.count, x + barWidth/2, y - 5);
        userCtx.fillText(item.month, x + barWidth/2, height - 5);
      });
    }
  }, [analytics.monthlyRevenue, analytics.userTrend]);

  // ✅ FIXED: Effect to draw charts after analytics update
  useEffect(() => {
    if (!loading && analytics.monthlyRevenue.length > 0) {
      const timer = setTimeout(drawCharts, 100);
      return () => clearTimeout(timer);
    }
  }, [drawCharts, loading]);

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}>Loading Analytics...</div>;
  if (error) return <div style={{ padding: 50, textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        :root {
          --bg: #f7f9fc;
          --card: #ffffff;
          --muted: #6f7683;
          --primary: #1d4ed8;
          --success: #059669;
          --warning: #f59e0b;
          --danger: #dc2626;
          --border: #e6e8ee;
        }
        .dashboard { background: var(--bg); min-height: 100vh; }
        .header { font-size: 28px; font-weight: 800; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: var(--card); padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 8px 28px rgba(0,0,0,0.04); }
        .metric-value { font-size: 32px; font-weight: 800; color: var(--primary); }
        .metric-label { font-size: 14px; color: var(--muted); margin-top: 4px; }
        .metric-revenue { color: var(--success) !important; }
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 30px; }
        .chart-card { background: var(--card); padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 8px 28px rgba(0,0,0,0.04); }
        .chart-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
        .recent-bookings { background: var(--card); border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: 0 8px 28px rgba(0,0,0,0.04); }
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 16px; background: #fafbfc; text-align: left; font-weight: 600; color: var(--muted); }
        .table td { padding: 16px; border-bottom: 1px solid #eef1f5; }
        .status-confirmed { background: var(--success); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .status-pending { background: var(--warning); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .status-cancelled { background: var(--danger); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
      `}</style>

      <h1 style={{ color: '#111827' }}>Admin Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="metrics">
        <div className="metric">
          <div className="metric-value">₹{analytics.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="metric-label metric-revenue">Total Revenue</div>
        </div>
        <div className="metric">
          <div className="metric-value">{analytics.confirmedBookings}</div>
          <div className="metric-label">Confirmed Bookings</div>
        </div>
        <div className="metric">
          <div className="metric-value">{analytics.uniqueUsers}</div>
          <div className="metric-label">Total Users</div>
        </div>
        <div className="metric">
          <div className="metric-value">{analytics.verifiedUsers}</div>
          <div className="metric-label">{analytics.verifiedUsers}/{analytics.uniqueUsers} Verified</div>
        </div>
        <div className="metric">
          <div className="metric-value" style={{ color: '#dc2626' }}>{analytics.frozenUsers}</div>
          <div className="metric-label">Frozen Accounts</div>
        </div>
        <div className="metric">
          <div className="metric-value">{analytics.totalBookings}</div>
          <div className="metric-label">Total Bookings</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Monthly Revenue Trend</div>
          <div style={{ height: 300, background: '#f8fafc', borderRadius: 12, padding: 20 }}>
            <canvas id="revenueChart" width="400" height="250"></canvas>
            <div style={{ marginTop: 10, fontSize: 14, color: 'var(--muted)' }}>₹{analytics.totalRevenue.toLocaleString('en-IN')} Total</div>
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-title">User Registrations Trend</div>
          <div style={{ height: 300, background: '#f8fafc', borderRadius: 12, padding: 20 }}>
            <canvas id="userChart" width="400" height="250"></canvas>
            <div style={{ marginTop: 10, fontSize: 14, color: 'var(--muted)' }}>{analytics.uniqueUsers} Total Users</div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="recent-bookings">
        <h3 style={{ marginBottom: 20 }}>Recent Confirmed Bookings</h3>
        <table className="table">
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
            {bookings
              .filter(b => b.status === 'CONFIRMED')
              .slice(0, 10)
              .map(booking => (
                <tr key={booking.id || booking.bookingId}>
                  <td><strong>#{booking.id || booking.bookingId}</strong></td>
                  <td>{booking.userEmail || 'N/A'}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{booking.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>{booking.seats?.map(s => s.seatNumber).join(', ') || 'N/A'}</td>
                  <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td><span className="status-confirmed">CONFIRMED</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
