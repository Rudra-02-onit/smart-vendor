import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost/backend";

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
  const [form,      setForm]      = useState({ name: "", price: "", unit: "kg", available_quantity: "", description: "", category: "Vegetables", location: "" });
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
    sessionStorage.removeItem("sv_user");
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
    setForm({ name: veg.name, price: veg.price, unit: veg.unit, available_quantity: veg.quantity, description: veg.description, category: veg.category || "Vegetables", location: veg.location || "" });
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0a0f 0%,#0d1f0d 40%,#0a0f1a 100%)" }}>
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
                { icon: "🥕", label: "My Products",  val: vegetables.length, color: "#81c784", grad:"linear-gradient(135deg,#1b5e20,#2e7d32)" },
                { icon: "📦", label: "Total Orders",  val: bookings.length,   color: "#90caf9", grad:"linear-gradient(135deg,#1565c0,#1976d2)" },
                { icon: "⏳", label: "Pending",       val: bookings.filter(b => b.status === "pending").length,   color: "#ffa726", grad:"linear-gradient(135deg,#e65100,#f57c00)" },
                { icon: "✅", label: "Completed",     val: bookings.filter(b => b.status === "completed").length, color: "#ce93d8", grad:"linear-gradient(135deg,#6a1b9a,#7b1fa2)" },
              ].map((st) => (
                <div key={st.label} style={{...s.statCard, background:st.grad, boxShadow:`0 8px 25px rgba(0,0,0,0.3)`}}>
                  <div style={{ fontSize: 32 }}>{st.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "white" }}>{st.val}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{st.label}</div>
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
              <h2 style={{ color: "#81c784", margin: 0 }}>My Vegetables</h2>
              <button onClick={openAddForm} style={s.greenBtn}>+ Add Vegetable</button>
            </div>

            {vegetables.length === 0 ? (
              <div style={s.emptyCard}><p>No vegetables added yet.</p><button onClick={openAddForm} style={s.greenBtn}>Add First Vegetable</button></div>
            ) : (
              <div style={s.vegGrid}>
                {vegetables.map((veg) => (
                  <div key={veg.id} style={s.vegCard}>
                    {veg.image
                      ? <img
                          src={veg.image.startsWith("http") ? veg.image : `http://localhost/uploads/${veg.image}`}
                          alt={veg.name} style={s.vegImg}
                          onError={e => { e.target.onerror=null; e.target.style.display="none"; }}
                        />
                      : <div style={s.vegImgPlaceholder}>🥬</div>
                    }
                    <h3 style={{ color: "#81c784", margin: "10px 0 4px" }}>{veg.name}</h3>
                    <p style={{ margin: "4px 0", color: "rgba(255,255,255,0.6)" }}>₹{veg.price} / {veg.unit}</p>
                    <p style={{ margin: "4px 0", color: "rgba(255,255,255,0.5)" }}>Stock: {veg.quantity} {veg.unit}</p>
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
                        <h3 style={{ color: "#81c784", margin: "0 0 6px" }}>🥬 {b.vegetable_name}</h3>
                        <p style={s.bookingMeta}>👤 <strong style={{color:"white"}}>{b.customer_name}</strong> · <span style={{color:"rgba(255,255,255,0.4)"}}>{b.customer_email}</span></p>
                        <p style={s.bookingMeta}>� {b.customer_phone || "N/A"}</p>
                        <p style={s.bookingMeta}>�📦 Qty: <strong style={{color:"#ffa726"}}>{b.quantity} {b.unit}</strong> · ₹{Number(b.price).toFixed(2)}/{b.unit}</p>
                        <p style={s.bookingMeta}>💰 Total: <strong style={{ color: "#ffa726" }}>₹{Number(b.total_amount).toFixed(2)}</strong></p>
                        {b.customer_note && <p style={s.bookingMeta}>📝 {b.customer_note}</p>}
                        {b.delivery_slot && (
                          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,167,38,0.1)",border:"1px solid rgba(255,167,38,0.25)",borderRadius:8,padding:"5px 10px",marginTop:6}}>
                            <span>🚚</span>
                            <span style={{color:"#ffa726",fontSize:12,fontWeight:"bold"}}>{b.delivery_slot}</span>
                          </div>
                        )}
                        <p style={{...s.bookingMeta, marginTop:6}}>📅 {b.created_at}</p>
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
            <h2 style={{ color: "#81c784", marginBottom: 20 }}>{editingId ? "✏️ Edit Product" : "➕ Add Product"}</h2>
            <form onSubmit={handleSaveVeg}>
              {[
                { name: "name",               label: "Product Name *", type: "text",   placeholder: "e.g. Tomato" },
                { name: "price",              label: "Price (₹) *",    type: "number", placeholder: "e.g. 40" },
                { name: "available_quantity", label: "Quantity *",     type: "number", placeholder: "e.g. 50" },
              ].map((f) => (
                <div key={f.name} style={{ marginBottom: 14 }}>
                  <label style={s.label}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })} required style={s.input} />
                </div>
              ))}

              {/* Category */}
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Category *</label>
                <select value={form.category || "Vegetables"} onChange={e => setForm({ ...form, category: e.target.value })} style={s.input}>
                  <option value="Vegetables">🥕 Vegetables</option>
                  <option value="Fruits">🍎 Fruits</option>
                  <option value="Dairy">🥛 Dairy</option>
                  <option value="Grocery">🌾 Grocery</option>
                  <option value="Herbs">🌿 Herbs</option>
                  <option value="Spices">🌶️ Spices</option>
                  <option value="Leafy">🥬 Leafy Greens</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Unit *</label>
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={s.input}>
                  <option value="kg">kg</option>
                  <option value="piece">piece</option>
                  <option value="dozen">dozen</option>
                  <option value="litre">litre</option>
                  <option value="gm">gm (gram)</option>
                  <option value="packet">packet</option>
                </select>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Pickup Location</label>
                <div style={{display:"flex",gap:8}}>
                  <input type="text" placeholder="Enter location or use GPS" value={form.location || ""}
                    onChange={e => setForm({ ...form, location: e.target.value })} style={{...s.input,flex:1}} />
                  <button type="button" onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(pos => {
                        setForm({ ...form, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
                      }, () => alert("Location access denied."));
                    }
                  }} style={{padding:"0 12px",background:"rgba(66,165,245,0.2)",border:"1px solid rgba(66,165,245,0.4)",borderRadius:8,color:"#90caf9",cursor:"pointer",fontSize:18,flexShrink:0}}>
                    📍
                  </button>
                </div>
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
  center:      { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, color: "#aaa", background:"linear-gradient(135deg,#0a0a0f,#0d1f0d,#0a0f1a)" },
  nav:         { background: "rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center", height:64, borderBottom:"1px solid rgba(255,255,255,0.08)", position:"sticky", top:0, zIndex:100 },
  navBrand:    { color: "white", fontWeight: "bold", fontSize: 18, display:"flex", alignItems:"center", gap:10 },
  logoutBtn:   { padding: "8px 18px", background: "rgba(198,40,40,0.2)", border: "1px solid rgba(198,40,40,0.4)", borderRadius: 20, color:"#ef9a9a", cursor: "pointer", fontWeight: "bold", fontSize:13 },
  toast:       { background: "#43a047", color: "white", padding: "12px 20px", textAlign: "center", fontWeight: "bold", position:"fixed", top:20, right:20, zIndex:9999, borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,0.5)" },
  tabs:        { background: "rgba(255,255,255,0.03)", display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 28px 0" },
  tab:         { padding: "10px 20px", border: "1px solid transparent", background: "transparent", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: "bold", borderRadius:"10px 10px 0 0", transition:"all 0.2s" },
  tabActive:   { background:"rgba(46,125,50,0.25)", borderColor:"rgba(46,125,50,0.5)", color: "#81c784" },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 },
  statCard:    { background: "rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "22px 16px", textAlign: "center" },
  vegGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 },
  vegCard:     { background: "rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, overflow:"hidden" },
  vegImg:      { width: "100%", height: 160, objectFit: "cover", borderRadius: 8 },
  vegImgPlaceholder: { width: "100%", height: 120, background: "rgba(46,125,50,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 },
  emptyCard:   { background: "rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 40, textAlign: "center", color:"rgba(255,255,255,0.5)" },
  bookingCard: { background: "rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", marginBottom: 14 },
  bookingMeta: { margin: "4px 0", color: "rgba(255,255,255,0.6)", fontSize: 14 },
  greenBtn:    { padding: "10px 20px", background: "linear-gradient(135deg,#1b5e20,#43a047)", color: "white", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", fontSize: 14 },
  editBtn:     { flex: 1, padding: "8px 0", background: "rgba(21,101,192,0.2)", color: "#90caf9", border: "1px solid rgba(21,101,192,0.3)", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  deleteBtn:   { flex: 1, padding: "8px 0", background: "rgba(198,40,40,0.2)", color: "#ef9a9a", border: "1px solid rgba(198,40,40,0.3)", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  acceptBtn:   { padding: "8px 14px", background: "rgba(46,125,50,0.2)", color: "#81c784", border: "1px solid rgba(46,125,50,0.3)", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  rejectBtn:   { padding: "8px 14px", background: "rgba(198,40,40,0.2)", color: "#ef9a9a", border: "1px solid rgba(198,40,40,0.3)", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  completeBtn: { padding: "8px 14px", background: "rgba(21,101,192,0.2)", color: "#90caf9", border: "1px solid rgba(21,101,192,0.3)", borderRadius: 7, fontWeight: "bold", cursor: "pointer" },
  cancelBtn:   { padding: "10px 20px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontWeight: "bold", cursor: "pointer" },
  overlay:     { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20, zIndex: 1000 },
  modal:       { background: "#111820", border:"1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: 480, padding: 30, borderRadius: 18, maxHeight: "90vh", overflowY: "auto", boxShadow:"0 30px 80px rgba(0,0,0,0.6)" },
  label:       { display: "block", marginBottom: 5, fontWeight: "bold", color: "rgba(255,255,255,0.7)", fontSize: 13 },
  input:       { width: "100%", padding: "10px 12px", background:"rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, fontSize: 14, boxSizing: "border-box", color:"white", fontFamily:"inherit" },
};
