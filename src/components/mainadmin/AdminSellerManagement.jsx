// src/components/admin/AdminSellerManagement.js
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

/**
 * Professional Admin Seller Management UI (UI-only changes)
 * - Search, pagination, per-row action buttons, status badges, loading states
 * - Keeps the same API endpoints and request shapes you already had
 */

const styles = `
:root{
  --bg: #f5f7fb;
  --card: #ffffff;
  --muted: #6b7280;
  --text: #0f172a;
  --primary: #0b74f6;
  --danger: #dc2626;
  --success: #059669;
  --border: #e6eef8;
  --table-head: #f8fafc;
  --shadow: 0 6px 22px rgba(11, 20, 40, 0.06);
  --radius: 12px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.admin-page {
  background: var(--bg);
  min-height: 100vh;
  padding: 28px;
  color: var(--text);
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:18px;
}
.title {
  font-size:20px;
  font-weight:700;
  letter-spacing:-0.2px;
}
.subtitle {
  color:var(--muted);
  font-size:13px;
  margin-top:4px;
}
.card {
  background:var(--card);
  border-radius:var(--radius);
  padding:18px;
  box-shadow:var(--shadow);
  border:1px solid var(--border);
}
.toolbar {
  display:flex;
  gap:12px;
  align-items:center;
  margin-bottom:14px;
  flex-wrap:wrap;
}
.search {
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 12px;
  border-radius:10px;
  background:#fff;
  border:1px solid #e9f1ff;
  min-width:260px;
  box-shadow: 0 2px 8px rgba(12,34,80,0.04);
}
.search input {
  border:0;
  outline:none;
  font-size:14px;
  width:220px;
}
.actions {
  margin-left:auto;
  display:flex;
  gap:8px;
}
.btn {
  padding:9px 12px;
  border-radius:10px;
  cursor:pointer;
  border:0;
  font-weight:600;
  font-size:13px;
}
.btn.secondary {
  background:white;
  border:1px solid #e6eef8;
  color:var(--text);
}
.btn.primary {
  background:var(--primary);
  color:white;
}
.table-wrap { overflow:auto; margin-top:8px; }
.table {
  width:100%;
  border-collapse:collapse;
  min-width:780px;
}
.table thead th {
  text-align:left;
  padding:12px 14px;
  background:var(--table-head);
  font-size:12px;
  color:var(--muted);
  text-transform:uppercase;
  letter-spacing:0.7px;
  border-bottom:1px solid var(--border);
}
.table tbody td {
  padding:14px;
  border-bottom:1px dashed #eef4ff;
  vertical-align:middle;
  font-size:14px;
}
.row-name { font-weight:700; color:var(--text); }
.row-sub { color:var(--muted); font-size:13px; margin-top:4px; }
.badge {
  display:inline-block;
  padding:6px 10px;
  border-radius:999px;
  font-weight:700;
  font-size:12px;
  color:white;
}
.badge.unfrozen { background:var(--success); }
.badge.frozen { background:var(--danger); }
.empty {
  text-align:center;
  padding:28px;
  color:var(--muted);
}
.pager {
  display:flex;
  align-items:center;
  gap:8px;
  justify-content:flex-end;
  margin-top:14px;
}
.pbtn {
  padding:8px 10px;
  border-radius:8px;
  border:1px solid var(--border);
  background:white;
  cursor:pointer;
}
.pbtn[disabled] { opacity:0.5; cursor:not-allowed; }
.small { font-size:13px; color:var(--muted); }
.action-btn {
  padding:8px 10px;
  border-radius:8px;
  border:0;
  cursor:pointer;
  font-weight:700;
}
.action-freeze { background:#fff3f3; color:var(--danger); border:1px solid rgba(220,38,38,0.08); }
.action-unfreeze { background:#f0fbf6; color:var(--success); border:1px solid rgba(5,150,105,0.08); }
.spinner {
  display:inline-block;
  width:14px;
  height:14px;
  border-radius:50%;
  border:2px solid rgba(0,0,0,0.08);
  border-top-color: rgba(0,0,0,0.4);
  animation: spin 0.8s linear infinite;
  margin-right:8px;
  vertical-align:middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* toast */
.toast {
  position:fixed;
  right:20px;
  bottom:20px;
  background:linear-gradient(180deg,#0b74f6,#084fb2);
  color:white;
  padding:12px 16px;
  border-radius:10px;
  box-shadow:0 8px 30px rgba(11,20,40,0.15);
  font-weight:600;
}
@media (max-width:960px){
  .header { flex-direction:column; align-items:flex-start; gap:6px; }
  .actions { margin-left:0; width:100%; justify-content:flex-start; }
  .search input{ width:140px; }
}
`;

const AdminSellerManagement = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingMap, setActionLoadingMap] = useState({}); // { [sellerId]: true/false }
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:9001/api/auth/seller/all');
      // Ensure we have an array
      setSellers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching sellers:', err);
      showMessage('Failed to load sellers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const setSellerLoading = (sellerId, value) => {
    setActionLoadingMap(prev => ({ ...prev, [sellerId]: value }));
  };

  const freezeSeller = async (sellerId) => {
    const ok = window.confirm('Are you sure you want to freeze this seller? This will prevent the seller from receiving new bookings.');
    if (!ok) return;
    setSellerLoading(sellerId, true);
    try {
      const res = await axios.put(`http://localhost:9001/api/auth/seller/${sellerId}/freeze`);
      showMessage(res?.data?.message || 'Seller frozen successfully');
      await fetchSellers();
    } catch (err) {
      console.error('Error freezing seller:', err);
      showMessage('Failed to freeze seller', 'error');
    } finally {
      setSellerLoading(sellerId, false);
    }
  };

  const unfreezeSeller = async (sellerId) => {
    const ok = window.confirm('Unfreeze this seller and allow operations again?');
    if (!ok) return;
    setSellerLoading(sellerId, true);
    try {
      const res = await axios.put(`http://localhost:9001/api/auth/seller/${sellerId}/unfreeze`);
      showMessage(res?.data?.message || 'Seller unfrozen successfully');
      await fetchSellers();
    } catch (err) {
      console.error('Error unfreezing seller:', err);
      showMessage('Failed to unfreeze seller', 'error');
    } finally {
      setSellerLoading(sellerId, false);
    }
  };

  // Client-side filtered & paginated list
  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    return sellers.filter(s => {
      if (!q) return true;
      return (
        String(s.id).includes(q) ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.status || '').toLowerCase().includes(q)
      );
    });
  }, [sellers, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page if filtering reduces results
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  return (
    <div className="admin-page">
      <style>{styles}</style>
      <div className="container">
        <div className="header">
          <div>
            <div className="title">Seller Management</div>
            <div className="subtitle">View, freeze or unfreeze sellers. Actions are performed live on the server.</div>
          </div>

          <div className="actions" role="region" aria-label="controls">
            <div className="search" role="search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.6 }}>
                <path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                aria-label="Search sellers"
                placeholder="Search by ID, name, email or status..."
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
              />
            </div>

            <button className="btn secondary" type="button" onClick={() => { setQuery(''); setPage(1); fetchSellers(); }}>
              Refresh
            </button>
          </div>
        </div>

        <div className="card" role="region" aria-labelledby="seller-table">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>Sellers</div>
            <div className="small">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="table-wrap" aria-live="polite">
            <table className="table" aria-describedby="seller-table">
              <thead>
                <tr>
                  <th>Seller ID</th>
                  <th>Name / Email</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="5" className="empty">Loading sellers...</td>
                  </tr>
                )}

                {!loading && pageData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty">No sellers found.</td>
                  </tr>
                )}

                {!loading && pageData.map(seller => {
                  const isLoading = !!actionLoadingMap[seller.id];
                  const isFrozen = String((seller.status || '')).toLowerCase() !== 'unfrozen' && String((seller.status || '')).toLowerCase() !== 'active';
                  return (
                    <tr key={seller.id}>
                      <td>
                        <div className="row-name">{seller.id}</div>
                        <div className="row-sub">#{seller.id}</div>
                      </td>

                      <td>
                        <div className="row-name">{seller.name || '-'}</div>
                        <div className="row-sub">{seller.email || '-'}</div>
                      </td>

                      <td>
                        <span className={`badge ${isFrozen ? 'frozen' : 'unfrozen'}`}>
                          { (seller.status || '').toUpperCase() || (isFrozen ? 'FROZEN' : 'UNFROZEN') }
                        </span>
                      </td>

                      <td>
                        <div className="small">{ seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : '-' }</div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {isFrozen ? (
                            <button
                              className="action-btn action-unfreeze"
                              type="button"
                              onClick={() => unfreezeSeller(seller.id)}
                              disabled={isLoading}
                              aria-label={`Unfreeze seller ${seller.id}`}
                            >
                              {isLoading ? <span className="spinner" aria-hidden /> : null}
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              className="action-btn action-freeze"
                              type="button"
                              onClick={() => freezeSeller(seller.id)}
                              disabled={isLoading}
                              aria-label={`Freeze seller ${seller.id}`}
                            >
                              {isLoading ? <span className="spinner" aria-hidden /> : null}
                              Freeze
                            </button>
                          )}

                          <button
                            className="btn secondary"
                            type="button"
                            onClick={() => {
                              // Show details quickly in an alert - you can replace this with a modal if you prefer
                              const info = `Seller ID: ${seller.id}\nName: ${seller.name || '-'}\nEmail: ${seller.email || '-'}\nStatus: ${seller.status || '-'}`;
                              window.alert(info);
                            }}
                            aria-label={`View details for seller ${seller.id}`}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pager" role="navigation" aria-label="pagination">
            <div className="small">Page {page} of {totalPages}</div>
            <button className="pbtn" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button className="pbtn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <button className="pbtn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button className="pbtn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
          </div>
        </div>

        {message && (
          <div className="toast" role="status" aria-live="polite">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellerManagement;
