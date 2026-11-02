import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OffersSlider from "../components/OffersSlider";

const MENU_ITEMS = [
  { icon:"🏠", label:"Home",            path:"/customer-dashboard" },
  { icon:"🥕", label:"Vegetables",      cat:"Vegetables"  },
  { icon:"🍎", label:"Fresh Fruits",    cat:"Fruits"      },
  { icon:"🥛", label:"Dairy Products",  cat:"Dairy"       },
  { icon:"🌾", label:"Organic Grocery", cat:"Grocery"     },
  { icon:"🌿", label:"Herbs",           cat:"Herbs"       },
  { icon:"🌶️", label:"Spices",         cat:"Spices"      },
  { icon:"🥬", label:"Leafy Greens",    cat:"Leafy"       },
  { icon:"📦", label:"My Orders",       path:"/my-bookings" },
];

const CATEGORIES = [
  { id:"Vegetables", icon:"🥕", label:"Indian Vegetable",   emoji:"🥕" },
  { id:"Fruits",     icon:"🍎", label:"In Season Fruits",   emoji:"🍎" },
  { id:"Dairy",      icon:"🥛", label:"Dairy Products",     emoji:"🥛" },
  { id:"Grocery",    icon:"🌾", label:"Organic Grocery",    emoji:"🌾" },
  { id:"Herbs",      icon:"🌿", label:"Herbs & Seasoning",  emoji:"🌿" },
  { id:"Spices",     icon:"🌶️", label:"Exotic Spices",     emoji:"🌶️" },
  { id:"Leafy",      icon:"🥬", label:"Leafy Greens",       emoji:"🥬" },
  { id:"Exotic",     icon:"🫑", label:"Exotic Vegetables",  emoji:"🫑" },
  { id:"Fruits",     icon:"🍇", label:"Exotic Fruits",      emoji:"🍇" },
  { id:"Cut",        icon:"🔪", label:"Fresh Cut Veggies",  emoji:"🔪" },
  { id:"Mushroom",   icon:"🍄", label:"Mushroom",           emoji:"🍄" },
  { id:"Imported",   icon:"🌍", label:"Imported Veggies",   emoji:"🌍" },
];

const BANNERS = [
  { bg:"linear-gradient(135deg,#1b5e20,#43a047)", emoji:"🥕", title:"Fresh Vegetables Daily",  sub:"Direct from local farms • Best prices", badge:"UP TO 30% OFF" },
  { bg:"linear-gradient(135deg,#e65100,#ff9800)", emoji:"🍎", title:"Fresh Fruits This Season", sub:"Hand-picked • Farm fresh quality",       badge:"NEW ARRIVALS"  },
  { bg:"linear-gradient(135deg,#1565c0,#42a5f5)", emoji:"🥛", title:"Pure Dairy Products",      sub:"Fresh milk & curd • Morning delivery",   badge:"DAILY FRESH"   },
  { bg:"linear-gradient(135deg,#6a1b9a,#ab47bc)", emoji:"🌾", title:"Organic Grocery",          sub:"Chemical-free • Healthy living",         badge:"ORGANIC"       },
];

export default function Vegetables() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("sv_user") || "{}");

  const [vegetables, setVegetables] = useState([]);
  const [message,    setMessage]    = useState("Loading...");
  const [selected,   setSelected]   = useState(null);
  const [qty,        setQty]        = useState(1);
  const [note,       setNote]       = useState("");
  const [bookMsg,    setBookMsg]    = useState("");
  const [booking,    setBooking]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("all");
  const [banner,     setBanner]     = useState(0);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  // Auto-slide banner
  useEffect(() => {
    const t = setInterval(() => setBanner(b => (b + 1) % BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const load = () => {
    fetch("http://localhost/backend/customer/vegetables_api.php", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setVegetables(d.vegetables); setMessage(""); }
        else setMessage(d.message || "Failed to load.");
      })
      .catch(() => setMessage("Connection failed."));
  };
  useEffect(() => { load(); }, []);

  const open  = (v) => { setSelected(v); setQty(1); setNote(""); setBookMsg(""); setDeliveryInfo(null); };
  const close = () => { setSelected(null); setBookMsg(""); setDeliveryInfo(null); };
  const total = selected ? (Number(qty) * Number(selected.price)).toFixed(2) : "0.00";

  const getDeliverySlot = () => {
    const h = new Date().getHours();
    if (h >= 5  && h < 8)  return "10:00 AM - 12:00 PM Today";
    if (h >= 8  && h < 12) return "2:00 PM - 4:00 PM Today";
    return "7:00 AM - 9:00 AM Tomorrow";
  };

  const confirmBook = async () => {
    if (!qty || Number(qty) <= 0) { setBookMsg("Enter valid quantity."); return; }
    if (Number(qty) > Number(selected.available_quantity)) {
      setBookMsg(`Only ${selected.available_quantity} ${selected.unit} available.`); return;
    }
    setBooking(true);
    const fd = new FormData();
    fd.append("vegetable_id", selected.id);
    fd.append("quantity", qty);
    fd.append("customer_note", note);
    try {
      const r = await fetch("http://localhost/backend/customer/book_api.php", { method: "POST", credentials: "include", body: fd });
      const d = await r.json();
      if (d.success) { setDeliveryInfo({ slot: d.delivery_slot, id: d.booking_id, total: d.total_amount, itemTotal: d.item_total, fee: d.platform_fee, delivery: d.delivery_charge, tax: d.tax }); load(); }
      else setBookMsg(d.message || "Booking failed.");
    } catch { setBookMsg("Connection failed."); }
    finally { setBooking(false); }
  };

  const filtered = vegetables.filter(v =>
    (category === "all" || v.category === category) &&
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const B = BANNERS[banner];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: "system-ui, sans-serif" }}>

      {/* ── SLIDING MENU OVERLAY ── */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1000, display: "flex" }}>
          {/* Dark overlay */}
          <div onClick={() => setMenuOpen(false)}
            style={{ flex: 1, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }} />
          {/* Slide Menu Panel */}
          <div style={{ width: 300, background: "#fafaf5", height: "100%", overflowY: "auto", boxShadow: "-8px 0 30px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
            {/* Menu Header */}
            <div style={{ background: "linear-gradient(135deg,#1b5e20,#2e7d32)", padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "white", fontWeight: 900, fontSize: 20 }}>🌿 FreshMart</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Smart Vendor</div>
              </div>
              <button onClick={() => setMenuOpen(false)}
                style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "white", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* User Info */}
            <div style={{ padding: "16px 20px", background: "#e8f5e9", borderBottom: "1px solid #c8e6c9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d32,#43a047)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", fontWeight: "bold" }}>
                  {user.name?.[0]?.toUpperCase() || "C"}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#1b5e20", fontSize: 15 }}>{user.name || "Customer"}</div>
                  <div style={{ color: "#666", fontSize: 12 }}>{user.email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: "8px 0", flex: 1 }}>
              {MENU_ITEMS.map((item, i) => (
                <button key={i}
                  onClick={() => {
                    setMenuOpen(false);
                    if (item.path) navigate(item.path);
                    else { setCategory(item.cat); }
                  }}
                  style={{ width: "100%", padding: "14px 20px", background: "transparent", border: "none", borderBottom: "1px solid #f0f0e8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", fontSize: 15, color: "#333", fontFamily: "inherit" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    {item.label}
                  </span>
                  <span style={{ color: "#aaa", fontSize: 14 }}>›</span>
                </button>
              ))}
            </div>

            {/* Bottom */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #e0e0d8" }}>
              <div style={{ fontSize: 12, color: "#888", textAlign: "center" }}>© 2026 Smart Vendor · FreshMart</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <nav style={{ background: "white", borderBottom: "1px solid #e0e0d8", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 56, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMenuOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, padding: 6 }}>
            <div style={{ width: 22, height: 2, background: "#333", borderRadius: 2 }} />
            <div style={{ width: 22, height: 2, background: "#333", borderRadius: 2 }} />
            <div style={{ width: 22, height: 2, background: "#333", borderRadius: 2 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#1b5e20,#43a047)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#1b5e20", lineHeight: 1 }}>FreshMart</div>
              <div style={{ fontSize: 9, color: "#888" }}>Smart Vendor</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 380, margin: "0 16px", position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#888" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vegetables, fruits..."
            style={{ width: "100%", padding: "8px 16px 8px 34px", background: "#f5f5f0", border: "1px solid #e0e0d8", borderRadius: 25, color: "#333", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => navigate("/my-bookings")}
            style={{ padding: "8px 14px", background: "#e8f5e9", border: "none", borderRadius: 20, color: "#2e7d32", cursor: "pointer", fontWeight: "bold", fontSize: 12 }}>
            📦 Orders
          </button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d32,#43a047)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 16 }}>
            {user.name?.[0]?.toUpperCase() || "C"}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>

        {/* ── OFFERS SLIDER ── */}
        <OffersSlider />

        {/* ── BANNER SLIDER ── */}
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, position: "relative", height: 160, cursor: "pointer" }}>
          <div style={{ background: B.bg, height: "100%", display: "flex", alignItems: "center", padding: "0 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -20, top: -20, fontSize: 150, opacity: 0.12 }}>{B.emoji}</div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <span style={{ background: "rgba(255,255,255,0.25)", color: "white", fontSize: 10, fontWeight: "bold", padding: "3px 10px", borderRadius: 20, letterSpacing: 1, marginBottom: 8, display: "inline-block" }}>{B.badge}</span>
              <h2 style={{ color: "white", margin: "6px 0", fontSize: 20, fontWeight: 900 }}>{B.title}</h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>{B.sub}</p>
            </div>
            <div style={{ fontSize: 80, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))", flexShrink: 0 }}>{B.emoji}</div>
          </div>
          {/* Dots */}
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
            {BANNERS.map((_, i) => (
              <div key={i} onClick={() => setBanner(i)}
                style={{ width: i === banner ? 18 : 6, height: 6, borderRadius: 3, background: i === banner ? "white" : "rgba(255,255,255,0.5)", transition: "all 0.3s", cursor: "pointer" }} />
            ))}
          </div>
        </div>

        {/* ── CATEGORY GRID (FreshnLocal style) ── */}
        <h3 style={{ color: "#1b5e20", fontWeight: 900, fontSize: 16, marginBottom: 14 }}>Shop by Category</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12, marginBottom: 24 }}>
          <div onClick={() => setCategory("all")}
            style={{ background: category === "all" ? "linear-gradient(135deg,#1b5e20,#43a047)" : "white", borderRadius: 14, padding: "16px 8px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: category === "all" ? "none" : "1px solid #e8e8e0", transition: "all 0.2s" }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>🛒</div>
            <div style={{ fontSize: 11, fontWeight: "bold", color: category === "all" ? "white" : "#333", lineHeight: 1.2 }}>ALL ITEMS</div>
          </div>
          {CATEGORIES.map((c, i) => (
            <div key={i} onClick={() => setCategory(c.id)}
              style={{ background: category === c.id ? "linear-gradient(135deg,#1b5e20,#43a047)" : "white", borderRadius: 14, padding: "16px 8px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: category === c.id ? "none" : "1px solid #e8e8e0", transition: "all 0.2s" }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>{c.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: "bold", color: category === c.id ? "white" : "#333", lineHeight: 1.2, textTransform: "uppercase" }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── PRODUCTS ── */}
        <h3 style={{ color: "#1b5e20", fontWeight: 900, fontSize: 16, marginBottom: 14 }}>
          {category === "all" ? "All Products" : CATEGORIES.find(c => c.id === category)?.label} ({filtered.length})
        </h3>

        {message && <p style={{ textAlign: "center", color: "#888", marginTop: 30 }}>{message}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {filtered.map(v => (
            <div key={v.id}
              style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: "1px solid #f0f0e8", cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>

              <div style={{ height: 140, background: "#f5f5f0", position: "relative", overflow: "hidden" }}>
                {v.image
                  ? <img src={v.image.startsWith("http") ? v.image : `http://localhost/uploads/${v.image}`}
                    alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.onerror = null; e.target.style.display = "none"; }} />
                  : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>
                    {CATEGORIES.find(c => c.id === v.category)?.emoji || "🥬"}
                  </div>
                }
                <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(46,125,50,0.9)", borderRadius: 20, padding: "2px 8px", color: "white", fontSize: 9, fontWeight: "bold" }}>
                  {v.category || "Vegetables"}
                </div>
              </div>

              <div style={{ padding: "12px" }}>
                <h3 style={{ color: "#222", margin: "0 0 4px", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</h3>
                <p style={{ color: "#2e7d32", fontSize: 11, margin: "0 0 6px" }}>🏪 {v.vendor_name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: "#e65100", fontWeight: 900, fontSize: 17 }}>₹{v.price}</span>
                  <span style={{ color: "#888", fontSize: 11 }}>/{v.unit}</span>
                </div>
                <button onClick={() => open(v)}
                  style={{ width: "100%", padding: "9px", background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                  Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOOKING MODAL ── */}
      {selected && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 500 }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            {deliveryInfo ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
                <h2 style={{ color: "#1b5e20", marginBottom: 8 }}>Booking Confirmed!</h2>
                <p style={{ color: "#888", marginBottom: 20 }}>ID: #{deliveryInfo.id?.slice(-6)}</p>
                <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                  <div style={{ color: "#888", fontSize: 12 }}>🚚 Delivery Slot</div>
                  <div style={{ color: "#1b5e20", fontWeight: 900, fontSize: 18, marginTop: 4 }}>{deliveryInfo.slot}</div>
                </div>

                {/* Price Breakdown */}
                <div style={{background:"#f9f9f5",border:"1px solid #e0e0d8",borderRadius:12,padding:"14px",marginBottom:14,textAlign:"left"}}>
                  {[
                    {l:"Item Total",      v:`₹${Number(deliveryInfo.itemTotal||0).toFixed(2)}`,      c:"#222"},
                    {l:"Platform Fee",    v:`+₹${Number(deliveryInfo.fee||0).toFixed(2)}`,      c:"#e65100"},
                    {l:"Delivery",        v:`+₹${Number(deliveryInfo.delivery||0).toFixed(2)}`, c:"#1565c0"},
                    {l:"Tax",             v:`+₹${Number(deliveryInfo.tax||0).toFixed(2)}`,      c:"#6a1b9a"},
                  ].map(x=>(
                    <div key={x.l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0e8"}}>
                      <span style={{color:"#666",fontSize:13}}>{x.l}</span>
                      <span style={{color:x.c,fontWeight:"bold",fontSize:13}}>{x.v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                    <span style={{color:"#1b5e20",fontWeight:900,fontSize:15}}>Grand Total</span>
                    <span style={{color:"#1b5e20",fontWeight:900,fontSize:18}}>₹{Number(deliveryInfo.total).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => navigate("/my-bookings")} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "white", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer" }}>View Orders</button>
                  <button onClick={close} style={{ flex: 1, padding: "12px", background: "#f5f5f0", color: "#555", border: "none", borderRadius: 10, cursor: "pointer" }}>Continue</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ color: "#1b5e20", margin: 0, fontSize: 18 }}>🛒 {selected.name}</h2>
                  <button onClick={close} style={{ background: "#f5f5f0", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
                <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <span>🚚</span>
                  <div>
                    <div style={{ color: "#888", fontSize: 11 }}>Estimated Delivery</div>
                    <div style={{ color: "#1b5e20", fontWeight: "bold", fontSize: 14 }}>{getDeliverySlot()}</div>
                  </div>
                </div>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>₹{selected.price}/{selected.unit} · Available: {selected.available_quantity} {selected.unit}</p>
                <label style={LBL}>Quantity ({selected.unit})</label>
                <input type="number" min="0.01" max={selected.available_quantity} step="0.01"
                  value={qty} onChange={e => setQty(e.target.value)} style={INP} />
                <label style={{ ...LBL, marginTop: 12 }}>Note (Optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Special request..."
                  style={{ ...INP, minHeight: 60, resize: "vertical" }} />
                <div style={{ background: "#fff3e0", borderRadius: 10, padding: "12px", textAlign: "center", margin: "14px 0" }}>
                  <div style={{ color: "#888", fontSize: 11 }}>Total</div>
                  <div style={{ color: "#e65100", fontWeight: 900, fontSize: 26 }}>₹{total}</div>
                </div>
                {bookMsg && <p style={{ color: "#c62828", textAlign: "center", fontWeight: "bold", fontSize: 13 }}>{bookMsg}</p>}
                <button onClick={confirmBook} disabled={booking}
                  style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "white", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", fontSize: 15, marginBottom: 8, opacity: booking ? 0.7 : 1 }}>
                  {booking ? "⏳ Processing..." : "✅ Confirm Order"}
                </button>
                <button onClick={close} style={{ width: "100%", padding: "11px", background: "#f5f5f0", color: "#555", border: "none", borderRadius: 10, cursor: "pointer" }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const LBL = { display: "block", marginBottom: 6, color: "#555", fontSize: 13, fontWeight: "bold" };
const INP = { width: "100%", padding: "11px 14px", background: "#f5f5f0", border: "1px solid #e0e0d8", borderRadius: 10, color: "#333", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
