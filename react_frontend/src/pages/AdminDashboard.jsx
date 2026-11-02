import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost/backend";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pending,  setPending]  = useState([]);
  const [tab,      setTab]      = useState("overview");
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState("");

  const user = JSON.parse(sessionStorage.getItem("sv_user") || "{}");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadBookings(), loadPending()]);
    setLoading(false);
  }

  async function loadStats() {
    try {
      const r = await fetch(`${API}/admin/dashboard_api.php`, { credentials:"include" });
      const d = await r.json();
      if (d.success) setStats(d);
      else if (d.message?.toLowerCase().includes("login")) navigate("/login");
    } catch {}
  }
  async function loadUsers() {
    try { const r = await fetch(`${API}/admin/users_api.php`, { credentials:"include" }); const d = await r.json(); if (d.success) setUsers(d.users); } catch {}
  }
  async function loadBookings() {
    try { const r = await fetch(`${API}/admin/bookings_api.php`, { credentials:"include" }); const d = await r.json(); if (d.success) setBookings(d.bookings); } catch {}
  }
  async function loadPending() {
    try { const r = await fetch(`${API}/admin/pending_vendors_api.php`, { credentials:"include" }); const d = await r.json(); if (d.success) setPending(d.vendors); } catch {}
  }

  async function userAction(uid, action) {
    const fd = new FormData(); fd.append("user_id", uid); fd.append("action", action);
    const r = await fetch(`${API}/admin/users_api.php`, { method:"POST", credentials:"include", body:fd });
    const d = await r.json();
    showToast(d.success ? `✅ ${d.message}` : `❌ ${d.message}`);
    loadAll();
  }

  async function vendorApproval(vid, action) {
    const fd = new FormData(); fd.append("vendor_id", vid); fd.append("action", action);
    const r = await fetch(`${API}/admin/vendor_approval_api.php`, { method:"POST", credentials:"include", body:fd });
    const d = await r.json();
    showToast(d.success ? `✅ ${d.message}` : `❌ ${d.message}`);
    loadAll();
  }

  async function genLicence(vid) {
    const fd = new FormData(); fd.append("vendor_id", vid);
    const r = await fetch(`${API}/admin/generate_vendor_licence_api.php`, { method:"POST", credentials:"include", body:fd });
    const d = await r.json();
    showToast(d.success ? `🪪 ${d.licence_number}` : `❌ ${d.message}`);
    loadUsers();
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleLogout() {
    await fetch(`${API}/logout_api.php`, { method:"POST", credentials:"include" });
    sessionStorage.removeItem("sv_user");
    navigate("/login");
  }

  const tabs = [
    { key:"overview", icon:"📊", label:"Dashboard" },
    { key:"pending",  icon:"⏳", label:`Pending${pending.length ? ` (${pending.length})` : ""}` },
    { key:"users",    icon:"👥", label:"Users" },
    { key:"bookings", icon:"📦", label:"Bookings" },
  ];

  const statCards = stats ? [
    { icon:"👥", label:"Customers",   val:stats.customers,       grad:"linear-gradient(135deg,#1565c0,#42a5f5)", shadow:"rgba(21,101,192,0.4)" },
    { icon:"🏪", label:"Vendors",     val:stats.vendors,         grad:"linear-gradient(135deg,#2e7d32,#66bb6a)", shadow:"rgba(46,125,50,0.4)"  },
    { icon:"🥕", label:"Vegetables",  val:stats.vegetables,      grad:"linear-gradient(135deg,#e65100,#ffa726)", shadow:"rgba(230,81,0,0.4)"   },
    { icon:"📦", label:"Orders",      val:stats.total_bookings,  grad:"linear-gradient(135deg,#6a1b9a,#ab47bc)", shadow:"rgba(106,27,154,0.4)" },
  ] : [];

  if (loading) return (
    <div style={{minHeight:"100vh",background:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:64}}>🌿</div>
      <p style={{color:"#888",fontSize:18}}>Loading Admin Panel...</p>
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:"#f5f5f0", fontFamily:"system-ui,sans-serif"}}>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:toast.startsWith("❌")?"#c62828":"#2e7d32",color:"white",padding:"14px 22px",borderRadius:12,fontWeight:"bold",boxShadow:"0 8px 30px rgba(0,0,0,0.2)",fontSize:14}}>
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{background:"white",borderBottom:"1px solid #e0e0d8",padding:"0 28px",display:"flex",justifyContent:"space-between",alignItems:"center",height:64,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:10,background:"linear-gradient(135deg,#1b5e20,#43a047)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🌿</div>
          <div>
            <div style={{fontWeight:900,fontSize:18,color:"#1b5e20",lineHeight:1}}>FreshMart Admin</div>
            <div style={{color:"#888",fontSize:11}}>Smart Vendor Control Panel</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{background:"#e8f5e9",border:"1px solid #a5d6a7",borderRadius:25,padding:"6px 16px",color:"#1b5e20",fontSize:13,fontWeight:"bold"}}>
            👑 {user.name || "Admin"}
          </div>
          <button onClick={handleLogout} style={{padding:"8px 18px",background:"#ffebee",border:"1px solid #ef9a9a",borderRadius:20,color:"#c62828",cursor:"pointer",fontWeight:"bold",fontSize:13}}>
            Logout
          </button>
        </div>
      </nav>

      {/* TABS */}
      <div style={{background:"white",display:"flex",gap:0,borderBottom:"2px solid #f0f0e8",padding:"0 28px",flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{padding:"14px 20px",border:"none",background:"transparent",cursor:"pointer",fontSize:14,color:tab===t.key?"#1b5e20":"#888",fontWeight:tab===t.key?"bold":"normal",borderBottom:tab===t.key?"3px solid #2e7d32":"3px solid transparent",transition:"all 0.2s",fontFamily:"inherit"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"28px",maxWidth:1300,margin:"0 auto"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && stats && (
          <>
            {/* Stat Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:20,marginBottom:28}}>
            {statCards.map(c=>(
              <div key={c.label} style={{background:c.grad,borderRadius:18,padding:"24px 20px",boxShadow:`0 8px 30px ${c.shadow}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",right:-10,top:-10,fontSize:80,opacity:0.15}}>{c.icon}</div>
                <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,fontWeight:"bold",marginBottom:8}}>{c.label}</div>
                <div style={{color:"white",fontSize:40,fontWeight:900}}>{c.val}</div>
              </div>
            ))}
            </div>

            {/* Booking Status */}
            <h3 style={{color:"#555",marginBottom:16,fontSize:15,fontWeight:"bold"}}>📊 Booking Status</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:28}}>
              {[
                {icon:"⏳",label:"Pending",   val:stats.pending_bookings,   color:"#e65100",bg:"#fff3e0",border:"#ffcc80"},
                {icon:"✅",label:"Accepted",  val:stats.accepted_bookings,  color:"#1565c0",bg:"#e3f2fd",border:"#90caf9"},
                {icon:"🚚",label:"Delivered", val:stats.completed_bookings, color:"#1b5e20",bg:"#e8f5e9",border:"#a5d6a7"},
                {icon:"❌",label:"Rejected",  val:stats.rejected_bookings,  color:"#c62828",bg:"#ffebee",border:"#ef9a9a"},
              ].map(b=>(
                <div key={b.label} style={{background:b.bg,border:`1px solid ${b.border}`,borderRadius:14,padding:"20px 16px",textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:8}}>{b.icon}</div>
                  <div style={{color:b.color,fontSize:32,fontWeight:900}}>{b.val}</div>
                  <div style={{color:"#666",fontSize:13}}>{b.label}</div>
                </div>
              ))}
            </div>

            {stats.pending_vendors > 0 && (
              <div style={{background:"#fff3e0",border:"1px solid #ffcc80",borderRadius:14,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"#e65100",fontWeight:"bold"}}>⚠️ {stats.pending_vendors} vendor(s) waiting for approval</span>
                <button onClick={()=>setTab("pending")} style={{padding:"8px 18px",background:"#e65100",color:"white",border:"none",borderRadius:20,fontWeight:"bold",cursor:"pointer",fontSize:13}}>Review Now</button>
              </div>
            )}
          </>
        )}

        {/* ── PENDING VENDORS ── */}
        {tab==="pending" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:20,fontSize:20}}>⏳ Pending Vendor Approvals</h2>
            {pending.length===0 ? (
              <div style={{background:"white",border:"1px solid #e0e0d8",borderRadius:16,padding:48,textAlign:"center",color:"#888",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                ✅ No pending vendors!
              </div>
            ) : pending.map(v=>(
              <div key={v.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:"24px",marginBottom:20}}>

                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{display:"flex",gap:16,alignItems:"center"}}>
                    {/* Vendor Photo */}
                    <div style={{width:64,height:64,borderRadius:12,background:"rgba(46,125,50,0.2)",border:"2px solid rgba(46,125,50,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,overflow:"hidden",flexShrink:0}}>
                      {v.photo
                        ? <img src={`http://localhost/uploads/${v.photo}`} alt={v.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}} />
                        : "🏪"
                      }
                    </div>
                    <div>
                      <h3 style={{color:"#81c784",margin:"0 0 4px",fontSize:18,fontWeight:900}}>{v.shop_name || v.name + "'s Shop"}</h3>
                      <p style={{color:"rgba(255,255,255,0.5)",margin:"2px 0",fontSize:13}}>👤 {v.name}</p>
                      <p style={{color:"rgba(255,255,255,0.5)",margin:"2px 0",fontSize:13}}>📧 {v.email} · 📞 {v.phone}</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>vendorApproval(v.id,"approve")} style={{padding:"10px 22px",background:"linear-gradient(135deg,#1b5e20,#43a047)",border:"none",borderRadius:10,color:"white",fontWeight:"bold",cursor:"pointer",fontSize:14,boxShadow:"0 4px 15px rgba(46,125,50,0.4)"}}>✅ Approve</button>
                    <button onClick={()=>vendorApproval(v.id,"reject")}  style={{padding:"10px 22px",background:"rgba(198,40,40,0.2)",border:"1px solid rgba(198,40,40,0.4)",borderRadius:10,color:"#ef9a9a",fontWeight:"bold",cursor:"pointer",fontSize:14}}>❌ Reject</button>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>

                  {/* Personal Info */}
                  <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px"}}>
                    <h4 style={{color:"#90caf9",margin:"0 0 12px",fontSize:13,textTransform:"uppercase",letterSpacing:0.5}}>📋 Personal Info</h4>
                    {[
                      {l:"Full Name",  v:v.name},
                      {l:"Address",    v:v.address},
                      {l:"Location",   v:v.location || "Not provided"},
                    ].map(x=>(
                      <div key={x.l} style={{marginBottom:8}}>
                        <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{x.l}</span>
                        <p style={{color:"white",margin:"2px 0",fontSize:13,fontWeight:"bold"}}>{x.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Documents */}
                  <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px"}}>
                    <h4 style={{color:"#ffa726",margin:"0 0 12px",fontSize:13,textTransform:"uppercase",letterSpacing:0.5}}>📄 Documents</h4>
                    {[
                      {l:"ID Proof No.", v:v.id_proof_number || "N/A"},
                      {l:"Tax Number",   v:v.tax_number      || "N/A"},
                    ].map(x=>(
                      <div key={x.l} style={{marginBottom:8}}>
                        <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{x.l}</span>
                        <p style={{color:"white",margin:"2px 0",fontSize:13,fontWeight:"bold"}}>{x.v}</p>
                      </div>
                    ))}
                    {/* Document Files */}
                    <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                      {v.id_proof_document && (
                        <a href={`http://localhost/uploads/${v.id_proof_document}`} target="_blank" rel="noreferrer"
                          style={{padding:"6px 12px",background:"rgba(255,167,38,0.15)",border:"1px solid rgba(255,167,38,0.3)",borderRadius:8,color:"#ffa726",fontSize:12,fontWeight:"bold",textDecoration:"none"}}>
                          📎 ID Proof
                        </a>
                      )}
                      {v.tax_document && (
                        <a href={`http://localhost/uploads/${v.tax_document}`} target="_blank" rel="noreferrer"
                          style={{padding:"6px 12px",background:"rgba(66,165,245,0.15)",border:"1px solid rgba(66,165,245,0.3)",borderRadius:8,color:"#90caf9",fontSize:12,fontWeight:"bold",textDecoration:"none"}}>
                          📎 Tax Doc
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px"}}>
                    <h4 style={{color:"#81c784",margin:"0 0 12px",fontSize:13,textTransform:"uppercase",letterSpacing:0.5}}>🏦 Bank Details</h4>
                    {[
                      {l:"Bank",           v:v.bank_name           || "N/A"},
                      {l:"Account Holder", v:v.account_holder_name || "N/A"},
                      {l:"Account No.",    v:v.account_number      || "N/A"},
                      {l:"IFSC Code",      v:v.ifsc_code           || "N/A"},
                    ].map(x=>(
                      <div key={x.l} style={{marginBottom:6}}>
                        <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{x.l}</span>
                        <p style={{color:"white",margin:"1px 0",fontSize:13,fontWeight:"bold"}}>{x.v}</p>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </>
        )}

        {/* ── USERS ── */}
        {tab==="users" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:20,fontSize:20}}>👥 All Users</h2>
            <div style={{background:"white",border:"1px solid #e0e0d8",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#e8f5e9"}}>
                    {["Name","Email","Phone","Role","Status","Actions"].map(h=>(
                      <th key={h} style={{padding:"14px 16px",textAlign:"left",color:"#1b5e20",fontSize:12,fontWeight:"bold",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid #c8e6c9"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u,i)=>{
                    const sc={active:"#1b5e20",pending:"#e65100",blocked:"#c62828",rejected:"#616161"}[u.status]||"#555";
                    const sb={active:"#e8f5e9",pending:"#fff3e0",blocked:"#ffebee",rejected:"#f5f5f0"}[u.status]||"#f5f5f0";
                    return (
                      <tr key={u.id} style={{borderBottom:"1px solid #f0f0e8",background:i%2===0?"white":"#fafaf5"}}>
                        <td style={{padding:"12px 16px",color:"#222",fontSize:13,fontWeight:"bold"}}>{u.name}</td>
                        <td style={{padding:"12px 16px",color:"#666",fontSize:12}}>{u.email}</td>
                        <td style={{padding:"12px 16px",color:"#555",fontSize:13}}>{u.phone}</td>
                        <td style={{padding:"12px 16px"}}>
                          <span style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:"bold",background:u.role==="vendor"?"#e8f5e9":"#e3f2fd",color:u.role==="vendor"?"#1b5e20":"#1565c0",textTransform:"capitalize"}}>{u.role}</span>
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <span style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:"bold",background:sb,color:sc,textTransform:"capitalize"}}>{u.status}</span>
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {u.role==="vendor"&&u.status==="active"&&(
                              <button onClick={()=>genLicence(u.id)} style={AB("#1565c0","#e3f2fd")}>🪪</button>
                            )}
                            {u.status!=="blocked"
                              ? <button onClick={()=>userAction(u.id,"block")} style={AB("#e65100","#fff3e0")}>🚫</button>
                              : <button onClick={()=>userAction(u.id,"unblock")} style={AB("#1b5e20","#e8f5e9")}>✅</button>
                            }
                            <button onClick={()=>{ if(confirm("Delete user?")) userAction(u.id,"delete"); }} style={AB("#c62828","#ffebee")}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── BOOKINGS ── */}
        {tab==="bookings" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:20,fontSize:20}}>📦 All Bookings</h2>
            <div style={{background:"white",border:"1px solid #e0e0d8",borderRadius:16,overflow:"auto",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
                <thead>
                  <tr style={{background:"#e8f5e9"}}>
                    {["#","Customer","Vendor","Item","Qty","Total","Status","Date"].map(h=>(
                      <th key={h} style={{padding:"14px 16px",textAlign:"left",color:"#1b5e20",fontSize:12,fontWeight:"bold",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid #c8e6c9"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b,i)=>{
                    const sc={pending:"#e65100",accepted:"#1565c0",completed:"#1b5e20",rejected:"#c62828"}[b.status]||"#555";
                    const sb={pending:"#fff3e0",accepted:"#e3f2fd",completed:"#e8f5e9",rejected:"#ffebee"}[b.status]||"#f5f5f0";
                    return (
                      <tr key={b.booking_id} style={{borderBottom:"1px solid #f0f0e8",background:i%2===0?"white":"#fafaf5"}}>
                        <td style={{padding:"12px 16px",color:"#aaa",fontSize:11}}>#{b.booking_id.slice(-5)}</td>
                        <td style={{padding:"12px 16px",color:"#222",fontSize:13,fontWeight:"bold"}}>{b.customer_name}</td>
                        <td style={{padding:"12px 16px",color:"#1b5e20",fontSize:13,fontWeight:"bold"}}>{b.vendor_name}</td>
                        <td style={{padding:"12px 16px",color:"#444",fontSize:13}}>{b.vegetable_name}</td>
                        <td style={{padding:"12px 16px",color:"#555",fontSize:13}}>{b.quantity} {b.unit}</td>
                        <td style={{padding:"12px 16px",color:"#e65100",fontWeight:"bold",fontSize:13}}>₹{Number(b.total_amount).toFixed(2)}</td>
                        <td style={{padding:"12px 16px"}}>
                          <span style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:"bold",background:sb,color:sc,textTransform:"capitalize"}}>{b.status==="completed"?"Delivered":b.status}</span>
                        </td>
                        <td style={{padding:"12px 16px",color:"#888",fontSize:11}}>{b.created_at?.slice(0,10)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const AB = (color, bg) => ({
  padding:"6px 10px", background:bg, border:`1px solid ${color}`,
  borderRadius:8, color, cursor:"pointer", fontSize:13, fontWeight:"bold",
});
