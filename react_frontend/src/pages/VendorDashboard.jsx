import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost/smart_vendor/backend";

export default function VendorDashboard() {
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [bookings,   setBookings]   = useState([]);
  const [tab,        setTab]        = useState("overview");  // overview | vegetables | bookings
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState("");

  // Add/Edit vegetable form
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState({ name: "", price: "", unit: "kg", available_quantity: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [formMsg,   setFormMsg]   = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadProfile(), loadVegetables(), loadBookings()]);
    setLoading(false);
  }

  async function loadProfile() {
    try {
      const r = await fetch(`${API}/vendor/profile_api.php`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setProfile(d.vendor);
      else if (d.message?.toLowerCase().includes("login")) navigate("/login");
    } catch { /* ignore */ }
  }

  async function loadVegetables() {
    try {
      const r = await fetch(`${API}/vendor/vegetables_api.php`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setVegetables(d.vegetables);
    } catch { /* ignore */ }
  }

  async function loadBookings() {
    try {
      const r = await fetch(`${API}/vendor/bookings_api.php`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setBookings(d.bookings);
    } catch { /* ignore */ }
  }

  async function handleLogout() {
    await fetch(`${API}/logout_api.php`, { method: "POST", credentials: "include" });
    navigate("/login");
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ name: "", price: "", unit: "kg", available_quantity: "", description: "" });
    setImageFile(null);
    setFormMsg("");
    setShowForm(true);
  }

  function openEditForm(veg) {
    setEditingId(veg.id);
    setForm({ name: veg.name, price: veg.price, unit: veg.unit, available_quantity: veg.quantity, description: veg.description });
    setImageFile(null);
    setFormMsg("");
    setShowForm(true);
  }

  async function handleSaveVeg(e) {
    e.preventDefault();
    setFormMsg("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    if (editingId) fd.append("id", editingId);

    const url = editingId
      ? `${API}/vendor/edit_vegetable_api.php`
      : `${API}/vendor/add_vegetable_api.php`;

    const r = await fetch(url, { method: "POST", credentials: "include", body: fd });
    const d = await r.json();
    if (d.success) {
      setShowForm(false);
      loadVegetables();
    } else {
      setFormMsg(d.message);
    }
  }

  async function handleDeleteVeg(id) {
    if (!confirm("Delete this vegetable?")) return;
    const r = await fetch(`${API}/vendor/delete_vegetable_api.php`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const d = await r.json();
    if (d.success) loadVegetables();
    else alert(d.message);
  }

  async function handleBookingStatus(bookingId, status) {
    const r = await fetch(`${API}/vendor/bookings_api.php`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, status })
    });
    const d = await r.json();
    if (d.success) { setMsg(`✅ Booking ${status}!`); loadBookings(); setTimeout(() => setMsg(""), 2500); }
    else alert(d.message);
  }

  const statusColor = { pending: "#856404", accepted: "#2e7d32", rejected: "#c62828", completed: "#1565c0" };
  const statusBg    = { pending: "#fff3cd", accepted: "#e8f5e9", rejected: "#ffebee", completed: "#e3f2fd" };

  if (loading) return <div style={s.center}><div style={{ fontSize: 48 }}>🥬</div><p>Loading...</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f8e9" }}>
      {/* NAVBAR */}
      <nav style={s.nav}>
        <span style={s.navBrand}>🥬 Smart Vendor — Vendor Panel</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "white", fontSize: 14 }}>👤 {profile?.name}</span>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      {msg && <div style={s.toast}>{msg}</div>}

      {/* TABS */}
      <div style={s.tabs}>
        {[["overview","📊 Overview"], ["vegetables","🥕 My Vegetables"], ["bookings","📦 Bookings"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            <div style={s.statsGrid}>
              {[
                { icon: "🥕", label: "My Vegetables", val: vegetables.length, color: "#2e7d32" },
                { icon: "📦", label: "Total Orders",  val: bookings.length,   color: "#1565c0" },
                { icon: "⏳", label: "Pending",       val: bookings.filter(b => b.status === "pending").length,   color: "#e65100" },
                { icon: "✅", label: "Completed",     val: bookings.filter(b => b.status === "completed").length, color: "#6a1b9a" },
              ].map((st) => (
                <div key={st.label} style={s.statCard}>
                  <div style={{ fontSize: 32 }}>{st.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: st.color }}>{st.val}</div>
                  <div style={{ color: "#666", fontSize: 14 }}>{st.label}</div>
                </div>
              ))}
            </div>
            {profile?.licence_number && (
              <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 10, padding: "16px 20px", marginTop: 8 }}>
                <strong>🪪 Licence Number:</strong> {profile.licence_number}
              </div>
            )}
          </>
        )}

        {/* ── VEGETABLES ── */}
        {tab === "vegetables" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ color: "#2e7d32", margin: 0 }}>My Vegetables</h2>
              <button onClick={openAddForm} style={s.greenBtn}>+ Add Vegetable</button>
            </div>

            {vegetables.length === 0 ? (
              <div style={s.emptyCard}><p>No vegetables added yet.</p><button onClick={openAddForm} style={s.greenBtn}>Add First Vegetable</button></div>
            ) : (
              <div style={s.vegGrid}>
                {vegetables.map((veg) => (
                  <div key={veg.id} style={s.vegCard}>
                    {veg.image
                      ? <img src={veg.image} alt={veg.name} style={s.vegImg} onError={e => e.target.style.display = "none"} />
                      : <div style={s.vegImgPlaceholder}>🥬</div>
                    }
                    <h3 style={{ color: "#2e7d32", margin: "10px 0 4px" }}>{veg.name}</h3>
                    <p style={{ margin: "4px 0", color: "#555" }}>₹{veg.price} / {veg.unit}</p>
                    <p style={{ margin: "4px 0", color: "#555" }}>Stock: {veg.quantity} {veg.unit}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => openEditForm(veg)} style={s.editBtn}>✏️ Edit</button>
                      <button onClick={() => handleDeleteVeg(veg.id)} style={s.deleteBtn}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── BOOKINGS ── */}
        {tab === "bookings" && (
          <>
            <h2 style={{ color: "#2e7d32", marginBottom: 18 }}>Customer Bookings</h2>
            {bookings.length === 0 ? (
              <div style={s.emptyCard}><p>No bookings yet.</p></div>
            ) : (
              bookings.map((b) => {
                const st = b.status;
                return (
                  <div key={b.booking_id} style={s.bookingCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <h3 style={{ color: "#2e7d32", margin: "0 0 6px" }}>🥬 {b.vegetable_name}</h3>
                        <p style={s.bookingMeta}>👤 Customer: <strong>{b.customer_name}</strong> · {b.customer_email}</p>
                        <p style={s.bookingMeta}>📦 Qty: {b.quantity} {b.unit} · ₹{Number(b.price).toFixed(2)}/{b.unit}</p>
                        <p style={s.bookingMeta}>💰 Total: <strong style={{ color: "#2e7d32" }}>₹{Number(b.total_amount).toFixed(2)}</strong></p>
                        {b.customer_note && <p style={s.bookingMeta}>📝 Note: {b.customer_note}</p>}
                        <p style={s.bookingMeta}>📅 {b.created_at}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, fontWeight: "bold", background: statusBg[st] || "#eee", color: statusColor[st] || "#333", textTransform: "capitalize" }}>
                          {st === "completed" ? "Delivered" : st}
                        </span>
                        <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          {st === "pending" && <>
                            <button onClick={() => handleBookingStatus(b.booking_id, "accepted")} style={s.acceptBtn}>✅ Accept</button>
                            <button onClick={() => handleBookingStatus(b.booking_id, "rejected")} style={s.rejectBtn}>❌ Reject</button>
                          </>}
                          {st === "accepted" && (
                            <button onClick={() => handleBookingStatus(b.booking_id, "completed")} style={s.completeBtn}>🚚 Mark Delivered</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* ── ADD/EDIT FORM MODAL ── */}
      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={{ color: "#2e7d32", marginBottom: 20 }}>{editingId ? "✏️ Edit Vegetable" : "➕ Add Vegetable"}</h2>
            <form onSubmit={handleSaveVeg}>
              {[
                { name: "name",               label: "Name *",     type: "text",   placeholder: "e.g. Tomato" },
                { name: "price",              label: "Price (₹) *", type: "number", placeholder: "e.g. 40" },
                { name: "available_quantity", label: "Quantity *",  type: "number", placeholder: "e.g. 50" },
              ].map((f) => (
                <div key={f.name} style={{ marginBottom: 14 }}>
                  <label style={s.label}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })} required style={s.input} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Unit *</label>
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={s.input}>
                  <option value="kg">kg</option>
                  <option value="piece">piece</option>
                  <option value="dozen">dozen</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description" style={{ ...s.input, minHeight: 70, resize: "vertical" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Image {editingId ? "(leave blank to keep current)" : ""}</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={s.input} />
              </div>
              {formMsg && <p style={{ color: "#c62828", marginBottom: 12, fontWeight: "bold" }}>{formMsg}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={s.greenBtn}>{editingId ? "Update" : "Add Vegetable"}</button>
                <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──
const s = {
  center:      { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, color: "#555" },
  nav:         { background: "#2e7d32", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  navBrand:    { color: "white", fontWeight: "bold", fontSize: 18 },
  logoutBtn:   { padding: "8px 16px", background: "white", color: "#c62828", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  toast:       { background: "#43a047", color: "white", padding: "12px 20px", textAlign: "center", fontWeight: "bold" },
  tabs:        { background: "white", display: "flex", gap: 0, borderBottom: "2px solid #e8f5e9", padding: "0 24px" },
  tab:         { padding: "14px 22px", border: "none", background: "none", cursor: "pointer", fontSize: 15, color: "#555", fontWeight: "bold" },
  tabActive:   { borderBottom: "3px solid #2e7d32", color: "#2e7d32" },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 },
  statCard:    { background: "white", borderRadius: 12, padding: "22px 16px", textAlign: "center", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" },
  vegGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 },
  vegCard:     { background: "white", borderRadius: 12, padding: 18, boxShadow: "0 3px 12px rgba(0,0,0,0.08)" },
  vegImg:      { width: "100%", height: 160, objectFit: "cover", borderRadius: 8 },
  vegImgPlaceholder: { width: "100%", height: 120, background: "#e8f5e9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 },
  emptyCard:   { background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" },
  bookingCard: { background: "white", borderRadius: 12, padding: "18px 20px", marginBottom: 14, boxShadow: "0 3px 12px rgba(0,0,0,0.08)" },
  bookingMeta: { margin: "4px 0", color: "#555", fontSize: 14 },
  greenBtn:    { padding: "10px 20px", background: "#2e7d32", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 14 },
  editBtn:     { flex: 1, padding: "8px 0", background: "#e3f2fd", color: "#1565c0", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  deleteBtn:   { flex: 1, padding: "8px 0", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  acceptBtn:   { padding: "8px 14px", background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  rejectBtn:   { padding: "8px 14px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  completeBtn: { padding: "8px 14px", background: "#e3f2fd", color: "#1565c0", border: "none", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  cancelBtn:   { padding: "10px 20px", background: "#757575", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" },
  overlay:     { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20, zIndex: 1000 },
  modal:       { background: "white", width: "100%", maxWidth: 480, padding: 30, borderRadius: 14, maxHeight: "90vh", overflowY: "auto" },
  label:       { display: "block", marginBottom: 5, fontWeight: "bold", color: "#444", fontSize: 13 },
  input:       { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 7, fontSize: 14, boxSizing: "border-box" },
};
