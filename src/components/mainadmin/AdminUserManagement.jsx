// src/components/admin/AdminUserManagement.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

/**
 * AdminUserManagement (UI-only)
 * - Search, filter by role/status, per-user freeze/unfreeze actions
 * - Polished styling, pagination, toasts, accessibility
 * - Keeps your original endpoints (no backend changes)
 */

const styles = `
:root{
  --bg:#f5f7fb;
  --card:#ffffff;
  --muted:#6b7280;
  --text:#0f172a;
  --primary:#0b74f6;
  --danger:#dc2626;
  --success:#059669;
  --border:#e6eef8;
  --radius:12px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.page { background:var(--bg); min-height:100vh; padding:28px; color:var(--text); }
.container { max-width:1200px; margin:0 auto; }
.header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; flex-wrap:wrap; }
.title { font-size:22px; font-weight:800; }
.subtitle { color:var(--muted); font-size:13px; margin-top:6px; }
.card { background:var(--card); border-radius:var(--radius); padding:18px; border:1px solid var(--border); box-shadow:0 8px 28px rgba(2,6,23,0.06); }
.toolbar { display:flex; gap:10px; align-items:center; margin-bottom:14px; flex-wrap:wrap; }
.search { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; background:white; border:1px solid #e9f1ff; min-width:260px; }
.search input { border:0; outline:none; width:220px; font-size:14px; }
.select { padding:8px 10px; border-radius:10px; border:1px solid var(--border); background:white; min-width:150px; }
.btn { padding:9px 12px; border-radius:10px; cursor:pointer; border:0; font-weight:700; font-size:13px; }
.btn.secondary { background:white; border:1px solid var(--border); color:var(--text); }
.btn.primary { background:var(--primary); color:white; }
.table-wrap { overflow:auto; margin-top:8px; }
.table { width:100%; border-collapse:collapse; min-width:780px; }
.table thead th { text-align:left; padding:12px; background:#fbfdff; color:var(--muted); font-size:12px; text-transform:uppercase; border-bottom:1px solid var(--border); }
.table tbody td { padding:12px; border-bottom:1px dashed #eef4ff; vertical-align:middle; font-size:14px; }
.row-name { font-weight:700; color:var(--text); }
.row-sub { color:var(--muted); font-size:13px; margin-top:4px; }
.badge { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:800; font-size:12px; color:white; }
.badge.active { background:var(--success); }
.badge.frozen { background:var(--danger); }
.empty { text-align:center; padding:28px; color:var(--muted); }
.pager { display:flex; gap:8px; justify-content:flex-end; margin-top:14px; align-items:center; }
.pbtn { padding:8px 10px; border-radius:8px; border:1px solid var(--border); background:white; cursor:pointer; }
.pbtn[disabled] { opacity:0.5; cursor:not-allowed; }
.action-btn { padding:8px 10px; border-radius:8px; border:0; cursor:pointer; font-weight:700; }
.action-freeze { background:#fff3f3; color:var(--danger); border:1px solid rgba(220,38,38,0.08); }
.action-unfreeze { background:#f0fbf6; color:var(--success); border:1px solid rgba(5,150,105,0.08); }
.spinner { display:inline-block; width:14px; height:14px; border-radius:50%; border:2px solid rgba(0,0,0,0.08); border-top-color: rgba(0,0,0,0.4); animation: spin 0.8s linear infinite; margin-right:8px; vertical-align:middle; }
@keyframes spin { to { transform: rotate(360deg); } }
.toast { position:fixed; right:20px; bottom:20px; background:linear-gradient(180deg,#0b74f6,#084fb2); color:white; padding:12px 16px; border-radius:10px; box-shadow:0 8px 30px rgba(11,20,40,0.15); font-weight:700; }
@media (max-width:960px) { .header { flex-direction:column; align-items:flex-start; } .search input{ width:140px; } }
`;

/* helper: safe value */
const safe = (v, fallback = "") => (v === null || v === undefined ? fallback : v);

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // { [userId]: boolean }
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const token = localStorage.getItem("token"); // optional if you want to include auth in requests

  const apiConfig = { headers: token ? { Authorization: `Bearer ${token}` } : undefined };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:9001/api/v1/auth/all", apiConfig);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3800);
  };

  const setUserLoading = (id, v) => setActionLoading(prev => ({ ...prev, [id]: v }));

  const freezeUser = async (userId) => {
    const ok = window.confirm("Freeze this user? They won't be able to perform certain actions until unfrozen.");
    if (!ok) return;
    setUserLoading(userId, true);
    try {
      const res = await axios.put(`http://localhost:9001/api/v1/auth/${userId}/freeze`, null, apiConfig);
      showToast((res?.data?.message) || "User frozen");
      await fetchUsers();
    } catch (err) {
      console.error("Error freezing user:", err);
      showToast("Failed to freeze user", "error");
    } finally {
      setUserLoading(userId, false);
    }
  };

  const unfreezeUser = async (userId) => {
    const ok = window.confirm("Unfreeze this user and restore access?");
    if (!ok) return;
    setUserLoading(userId, true);
    try {
      const res = await axios.put(`http://localhost:9001/api/v1/auth/${userId}/unfreeze`, null, apiConfig);
      showToast((res?.data?.message) || "User unfrozen");
      await fetchUsers();
    } catch (err) {
      console.error("Error unfreezing user:", err);
      showToast("Failed to unfreeze user", "error");
    } finally {
      setUserLoading(userId, false);
    }
  };

  // derived list: filter by search, status, role
  const filtered = useMemo(() => {
    const q = (query || "").toString().toLowerCase().trim();
    return (users || []).filter(u => {
      if (statusFilter !== "ALL") {
        const st = String(u.status || "").toUpperCase();
        if (statusFilter === "FROZEN" && st !== "FROZEN") return false;
        if (statusFilter === "ACTIVE" && st === "FROZEN") return false;
      }
      if (roleFilter !== "ALL") {
        const role = String(u.role || "USER").toUpperCase();
        if (roleFilter !== role) return false;
      }
      if (!q) return true;
      return (
        String(u.id || "").toLowerCase().includes(q) ||
        (u.name || "").toString().toLowerCase().includes(q) ||
        (u.email || "").toString().toLowerCase().includes(q) ||
        (u.role || "").toString().toLowerCase().includes(q) ||
        (u.status || "").toString().toLowerCase().includes(q)
      );
    });
  }, [users, query, statusFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ensure page valid on filter change
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  return (
    <div className="page">
      <style>{styles}</style>
      <div className="container">
        <div className="header">
          <div>
            <div className="title">User Management</div>
            <div className="subtitle">Search, filter and freeze/unfreeze platform users.</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn secondary" type="button" onClick={() => { setQuery(""); setStatusFilter("ALL"); setRoleFilter("ALL"); setPage(1); fetchUsers(); }}>
              Refresh
            </button>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        <div className="card" role="region" aria-label="user-management">
          <div className="toolbar" role="toolbar" aria-label="controls">
            <div className="search" role="search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.6 }}>
                <path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input aria-label="Search users" placeholder="Search by id, name, email or role..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
            </div>

            <select className="select" aria-label="Filter by status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="FROZEN">Frozen</option>
            </select>

            <select className="select" aria-label="Filter by role" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="SELLER">Seller</option>
            </select>

            <button className="btn primary" type="button" onClick={() => { downloadCSV(); }}>
              Export CSV
            </button>
          </div>

          <div className="table-wrap" aria-live="polite">
            <table className="table" role="table" aria-label="Users table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name / Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr><td colSpan="6" className="empty">Loading users...</td></tr>
                )}

                {!loading && pageData.length === 0 && (
                  <tr><td colSpan="6" className="empty">No users found.</td></tr>
                )}

                {!loading && pageData.map(user => {
                  const id = safe(user.id, "");
                  const isFrozen = String((user.status || "")).toUpperCase() === "FROZEN";
                  const isActionLoading = !!actionLoading[id];
                  return (
                    <tr key={id || Math.random()}>
                      <td>
                        <div className="row-name">{id}</div>
                        <div className="row-sub">#{id}</div>
                      </td>

                      <td>
                        <div className="row-name">{safe(user.name, "-")}</div>
                        <div className="row-sub">{safe(user.email, "-")}</div>
                      </td>

                      <td>
                        <div className="small">{safe(user.role, "USER").toUpperCase()}</div>
                      </td>

                      <td>
                        <span className={`badge ${isFrozen ? "frozen" : "active"}`}>
                          { (user.status || (isFrozen ? "FROZEN" : "ACTIVE")).toString().toUpperCase() }
                        </span>
                      </td>

                      <td>
                        <div className="small">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</div>
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          {isFrozen ? (
                            <button
                              className="action-btn action-unfreeze"
                              type="button"
                              onClick={() => unfreezeUser(id)}
                              disabled={isActionLoading}
                              aria-label={`Unfreeze user ${id}`}
                            >
                              {isActionLoading ? <span className="spinner" aria-hidden /> : null}
                              Unfreeze
                            </button>
                          ) : (
                            <button
                              className="action-btn action-freeze"
                              type="button"
                              onClick={() => freezeUser(id)}
                              disabled={isActionLoading}
                              aria-label={`Freeze user ${id}`}
                            >
                              {isActionLoading ? <span className="spinner" aria-hidden /> : null}
                              Freeze
                            </button>
                          )}

                          <button
                            className="btn secondary"
                            type="button"
                            onClick={() => {
                              const info = `ID: ${id}\nName: ${safe(user.name, "-")}\nEmail: ${safe(user.email, "-")}\nRole: ${safe(user.role, "-")}\nStatus: ${safe(user.status, "-")}`;
                              window.alert(info);
                            }}
                            aria-label={`View details for user ${id}`}
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

        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );

  // CSV export helper (exports current filtered list)
  function downloadCSV() {
    const rows = filtered.map(u => ({
      id: u.id,
      name: u.name || "",
      email: u.email || "",
      role: u.role || "",
      status: u.status || "",
      createdAt: u.createdAt || ""
    }));
    if (!rows.length) {
      showToast("No users to export", "error");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")].concat(
      rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `users_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`);
    link.click();
  }
};

export default AdminUserManagement;
