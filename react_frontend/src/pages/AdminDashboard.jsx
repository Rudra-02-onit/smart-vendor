import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost/smart_vendor/backend";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pending,  setPending]  = useState([]);
  const [tab,      setTab]      = useState("overview");
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadBookings(), loadPendingVendors()]);
    setLoading(false);
  }

  async function loadStats() {
    try {
      const r = await fetch(`${API}/admin/dashboard_api.php`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setStats(d);
      else if (d.message?.toLowerCase().includes("login")) navigate("/login");
    } catch { /* ignore */ }
  }

  async function loadUsers() {
    try {
      const r = await fetch(`${API}/admin/users_api.php`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setUsers(d.users);
    } catch { /* ignore */ }
  }

  async function loadBookings() {
    try {
      const r = await fetch(`${API}/admin/bookings_api.php`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setBookings(d.bookings);
    } catch { /* ignore */ }
  }

  async function loadPendingVendors() {
    try {
      const r = await fetch(`${API}/admin/pending_vendors_api.php`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setPending(d.vendors);
    } catch { /* ignore */ }
  }

  async function userAction(userId, action) {
    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("action",  action);
    const r = await fetch(`${API}/admin/users_api.php`, { method: "POST", credentials: "include", body: fd });
    const d = await r.json();
    showMsg(d.success ? `✅ ${d.message}` : `❌ ${d.message}`);
    loadAll();
  }

  async function vendorApproval(vendorId, action) {
    const fd = new FormData();
    fd.append("vendor_id", vendorId);
    fd.append("action",    action);
    const r = await fetch(`${API}/admin/vendor_approval_api.php`, { method: "POST", credentials: "include", body: fd });
    const d = await r.json();
    showMsg(d.success ? `✅ ${d.message}` : `❌ ${d.message}`);
    loadAll();
  }

  async function generateLicence(vendorId) {
    const fd = new FormData();
    fd.append("vendor_id", vendorId);
    const r = await fetch(`${API}/admin/generate_vendor_licence_api.php`, { method: "POST", credentials: "include", body: fd });
    const d = await r.json();
    showMsg(d.success ? `🪪 Licence: ${d.licence_number}` : `❌ ${d.message}`);
    loadUsers();
  }

  function showMsg(m) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function handleLogout() {
    await fetch(`${API}/logout_api.php`, { method: "POST", credentials: "include" });
    navigate("/login");
  }

  const statusColor = { pending: "#856404", active: "#2e7d32", blocked: "#c62828", rejected: "#616161" };
  const statusBg    = { pending: "#fff3cd", active: "#e8f5e9", blocked: "#ffebee", rejected: "#eeeeee" };

  if (loading) return <div style={s.center}><div style={{ fontSize: 48 }}>🥬</div><p>Loading Admin Panel...</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7f5" }}>
      {/* NAVBAR */}
      <nav style={s.nav}>
        <span style={s.navBrand}>🥬 Smart Vendor — Admin Panel</span>
        <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
      </nav>

      {msg && <div style={{ ...s.toast, background: msg.startsWith("❌") ? "#c62828" : "#43a047" }}>{msg}</div>}

      {/* TABS */}
      <div style={s.tabs}>
        {[
          ["overview",  "📊 Dashboard"],
          ["pending",   `⏳ Pending Vendors${pending.length ? ` (${pending.length})` : ""}`],
          ["users",     "👥 Users"],
          ["bookings",  "📦 Bookings"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && stats && (
          <>
            <h2 style={{ color: "#2e7d32", marginBottom: 18 }}>System Overview</h2>
            <div style={s.statsGrid}>
              {[
                { icon: "👤", label: "Customers",   val: stats.customers,        color: "#1565c0" },
                { icon: "🏪", label: "Vendors",      val: stats.vendors,          color: "#2e7d32" },
                { icon: "🥕", label: "Vegetables",   val: stats.vegetables,       color: "#e65100" },
                { icon: "📦", label: "Total Orders", val: stats.total_bookings,   color: "#6a1b9a" },
              ].map((st) => (
                <div key={st.label} style={s.statCard}>
                  <div style={{ fontSize: 34 }}>{st.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: "bold", color: st.color }}>{st.val}</div>
                  <div style={{ color: "#666", fontSize: 14 }}>{st.label}</div>
                </div>
              ))}
            </div>
            <h3 style={{ color: "#555", margin: "20px 0 12px" }}>Booking Status</h3>
            <div style={s.statsGrid}>
              {[
                { icon: "⏳", label: "Pending",   val: stats.pending_bookings,   color: "#e65100", bg: "#fff3cd" },
                { icon: "✅", label: "Accepted",  val: stats.accepted_bookings,  color: "#1565c0", bg: "#e3f2fd" },
                { icon: "🚚", label: "Delivered", val: stats.completed_bookings, color: "#2e7d32", bg: "#e8f5e9" },
                { icon: "❌", label: "Rejected",  val: stats.rejected_bookings,  color: "#c62828", bg: "#ffebee" },
              ].map((st) => (
                <div key={st.label} style={{ ...s.statCard, borderTop: `4px solid ${st.color}`, background: st.bg }}>
                  <div style={{ fontSize: 28 }}>{st.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: st.color }}>{st.val}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{st.label}</div>
                </div>
              ))}
            </div>
            {stats.pending_vendors > 0 && (
              <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 10, padding: "14px 18px", marginTop: 8 }}>
                ⚠️ <strong>{stats.pending_vendors}</strong> vendor(s) waiting for approval.
                <button onClick={() => setTab("pending")} style={{ marginLeft: 12, padding: "6px 14px", background: "#e65100", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Review Now</button>
              </div>
            )}
          </>
        )}

        {/* ── PENDING VENDORS ── */}
        {tab === "pending" && (
          <>
            <h2 style={{ color: "#2e7d32", marginBottom: 18 }}>⏳ Pending Vendor Approvals</h2>
            {pending.length === 0 ? (
              <div style={s.emptyCard}><p>✅ No pending vendors!</p></div>
            ) : (
              pending.map((v) => (
                <div key={v.id} style={s.userCard}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: "#2e7d32", margin: "0 0 6px" }}>🏪 {v.shop_name || v.name}</h3>
                    <p style={s.meta}>👤 {v.name} · {v.email}</p>
                    <p style={s.meta}>📞 {v.phone} · 📍 {v.address}</p>
                    {v.description && <p style={s.meta}>📝 {v.description}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => vendorApproval(v.id, "approve")} style={s.acceptBtn}>✅ Approve</button>
                    <button onClick={() => vendorApproval(v.id, "reject")}  style={s.rejectBtn}>❌ Reject</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <>
            <h2 style={{ color: "#2e7d32", marginBottom: 18 }}>👥 All Users</h2>
            {users.length === 0 ? <div style={s.emptyCard}><p>No users found.</p></div> : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Name", "Email", "Phone", "Role", "Status", "Actions"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={s.td}>{u.name}</td>
                        <td style={s.td}>{u.email}</td>
                        <td style={s.td}>{u.phone}</td>
                        <td style={s.td}><span style={{ textTransform: "capitalize" }}>{u.role}</span></td>
                        <td style={s.td}>
                          <span style={{ padding: "4px 10px", borderRadius: 20, fontWeight: "bold", fontSize: 12, background: statusBg[u.status] || "#eee", color: statusColor[u.status] || "#333" }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {u.role === "vendor" && u.status === "active" && (
                              <button onClick={() => generateLicence(u.id)} style={s.licenceBtn}>🪪 Licence</button>
                            )}
                            {u.status !== "blocked" ? (
                              <button onClick={() => userAction(u.id, "block")} style={s.blockBtn}>🚫 Block</button>
                            ) : (
                              <button onClick={() => userAction(u.id, "unblock")} style={s.unblockBtn}>✅ Unblock</button>
                            )}
                            <button onClick={() => userAction(u.id, "delete")} style={s.deleteBtn}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── BOOKINGS ── */}
        {tab === "bookings" && (
          <>
            <h2 style={{ color: "#2e7d32", marginBottom: 18 }}>📦 All Bookings</h2>
            {bookings.length === 0 ? <div style={s.emptyCard}><p>No bookings found.</p></div> : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Booking ID", "Customer", "Vendor", "Vegetable", "Qty", "Total", "Status", "Date"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.booking_id}>
                        <td style={s.td}><small>#{b.booking_id.slice(-6)}</small></td>
                        <td style={s.td}>{b.customer_name}<br /><small style={{ color: "#888" }}>{b.customer_email}</small></td>
                        <td style={s.td}>{b.vendor_name}<br /><small style={{ color: "#888" }}>{b.vendor_email}</small></td>
                        <td style={s.td}>{b.vegetable_name}</td>
                        <td style={s.td}>{b.quantity} {b.unit}</td>
                        <td style={s.td}><strong style={{ color: "#2e7d32" }}>₹{Number(b.total_amount).toFixed(2)}</strong></td>
                        <td style={s.td}>
                          <span style={{ padding: "4px 10px", borderRadius: 20, fontWeight: "bold", fontSize: 12, background: statusBg[b.status] || "#eee", color: statusColor[b.status] || "#333", textTransform: "capitalize" }}>
                            {b.status === "completed" ? "Delivered" : b.status}
                          </span>
                        </td>
                        <td style={s.td}><small>{b.created_at}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  center:     { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, color: "#555" },
  nav:        { background: "#1b5e20", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  navBrand:   { color: "white", fontWeight: "bold", fontSize: 18 },
  logoutBtn:  { padding: "8px 16px", background: "white", color: "#c62828", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  toast:      { padding: "12px 20px", textAlign: "center", fontWeight: "bold", color: "white" },
  tabs:       { background: "white", display: "flex", gap: 0, borderBottom: "2px solid #e8f5e9", padding: "0 20px", flexWrap: "wrap" },
  tab:        { padding: "14px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#555", fontWeight: "bold" },
  tabActive:  { borderBottom: "3px solid #2e7d32", color: "#2e7d32" },
  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 },
  statCard:   { background: "white", borderRadius: 12, padding: "22px 16px", textAlign: "center", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" },
  emptyCard:  { background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 3px 12px rgba(0,0,0,0.08)", color: "#666" },
  userCard:   { background: "white", borderRadius: 12, padding: "16px 20px", marginBottom: 12, boxShadow: "0 3px 12px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" },
  meta:       { margin: "3px 0", color: "#555", fontSize: 13 },
  table:      { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" },
  th:         { background: "#2e7d32", color: "white", padding: "12px 14px", textAlign: "left", whiteSpace: "nowrap", fontSize: 13 },
  td:         { padding: "11px 14px", borderBottom: "1px solid #f0f0f0", fontSize: 13, color: "#444" },
  acceptBtn:  { padding: "8px 14px", background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer", fontSize: 13 },
  rejectBtn:  { padding: "8px 14px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer", fontSize: 13 },
  blockBtn:   { padding: "6px 12px", background: "#fff3e0", color: "#e65100", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 12 },
  unblockBtn: { padding: "6px 12px", background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 12 },
  deleteBtn:  { padding: "6px 10px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 12 },
  licenceBtn: { padding: "6px 12px", background: "#e3f2fd", color: "#1565c0", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 12 },
};
