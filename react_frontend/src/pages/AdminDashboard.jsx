import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost/backend";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(sessionStorage.getItem("sv_user") || "{}");

  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [pending,   setPending]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings,  setSettings]  = useState({ platform_fee_percent:5, delivery_charge_base:20, min_order_amount:50, min_quantity_kg:0.5, tax_percent:2 });
  const [tab,       setTab]       = useState("overview");
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadBookings(), loadPending(), loadAnalytics(), loadSettings()]);
    setLoading(false);
  }
  async function loadStats() {
    try { const r=await fetch(`${API}/admin/dashboard_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setStats(d); else if(d.message?.toLowerCase().includes("login"))navigate("/login"); } catch {}
  }
  async function loadUsers() {
    try { const r=await fetch(`${API}/admin/users_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setUsers(d.users); } catch {}
  }
  async function loadBookings() {
    try { const r=await fetch(`${API}/admin/bookings_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setBookings(d.bookings); } catch {}
  }
  async function loadPending() {
    try { const r=await fetch(`${API}/admin/pending_vendors_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setPending(d.vendors); } catch {}
  }
  async function loadAnalytics() {
    try { const r=await fetch(`${API}/admin/analytics_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setAnalytics(d); } catch {}
  }
  async function loadSettings() {
    try { const r=await fetch(`${API}/admin/platform_settings_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setSettings(d.settings); } catch {}
  }

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const r = await fetch(`${API}/admin/platform_settings_api.php`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
      const d = await r.json();
      showToast(d.success?"✅ Settings saved!":"❌ "+d.message);
      if(d.success) loadAnalytics();
    } catch { showToast("❌ Failed to save"); }
    setSavingSettings(false);
  }

  async function userAction(uid, action) {
    const fd=new FormData(); fd.append("user_id",uid); fd.append("action",action);
    const r=await fetch(`${API}/admin/users_api.php`,{method:"POST",credentials:"include",body:fd});
    const d=await r.json();
    showToast(d.success?`✅ ${d.message}`:`❌ ${d.message}`);
    loadAll();
  }
  async function vendorApproval(vid, action) {
    const fd=new FormData(); fd.append("vendor_id",vid); fd.append("action",action);
    const r=await fetch(`${API}/admin/vendor_approval_api.php`,{method:"POST",credentials:"include",body:fd});
    const d=await r.json();
    showToast(d.success?`✅ ${d.message}`:`❌ ${d.message}`);
    loadAll();
  }
  async function genLicence(vid) {
    const fd=new FormData(); fd.append("vendor_id",vid);
    const r=await fetch(`${API}/admin/generate_vendor_licence_api.php`,{method:"POST",credentials:"include",body:fd});
    const d=await r.json();
    showToast(d.success?`🪪 ${d.licence_number}`:`❌ ${d.message}`);
    loadUsers();
  }
  async function handleLogout() {
    await fetch(`${API}/logout_api.php`,{method:"POST",credentials:"include"});
    sessionStorage.removeItem("sv_user");
    navigate("/login");
  }
  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  const tabs = [
    {key:"overview",  icon:"📊", label:"Dashboard"},
    {key:"analytics", icon:"💰", label:"Revenue & Profit"},
    {key:"pending",   icon:"⏳", label:`Approvals${pending.length?` (${pending.length})`:""}`},
    {key:"users",     icon:"👥", label:"Users"},
    {key:"bookings",  icon:"📦", label:"All Orders"},
    {key:"settings",  icon:"⚙️", label:"Platform Settings"},
  ];

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:48,animation:"spin 1s linear infinite"}}>🌿</div>
      <p style={{color:"#888"}}>Loading Admin Panel...</p>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f5f5f0",fontFamily:"system-ui,sans-serif"}}>

      {toast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:toast.startsWith("❌")?"#c62828":"#2e7d32",color:"white",padding:"12px 20px",borderRadius:10,fontWeight:"bold",boxShadow:"0 8px 25px rgba(0,0,0,0.2)",fontSize:14}}>
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{background:"white",borderBottom:"1px solid #e0e0d8",padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center",height:60,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#1b5e20,#43a047)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌿</div>
          <div>
            <div style={{fontWeight:900,fontSize:16,color:"#1b5e20",lineHeight:1}}>FreshMart</div>
            <div style={{fontSize:10,color:"#888"}}>Admin Panel</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{background:"#e8f5e9",border:"1px solid #a5d6a7",borderRadius:20,padding:"5px 14px",color:"#1b5e20",fontSize:13,fontWeight:"bold"}}>👑 {user.name||"Admin"}</div>
          <button onClick={handleLogout} style={{padding:"7px 16px",background:"#ffebee",border:"1px solid #ef9a9a",borderRadius:20,color:"#c62828",cursor:"pointer",fontWeight:"bold",fontSize:13}}>Logout</button>
        </div>
      </nav>

      {/* TABS */}
      <div style={{background:"white",borderBottom:"2px solid #f0f0e8",padding:"0 24px",display:"flex",flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{padding:"13px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,color:tab===t.key?"#1b5e20":"#888",fontWeight:tab===t.key?800:400,borderBottom:tab===t.key?"3px solid #2e7d32":"3px solid transparent",transition:"all 0.2s",fontFamily:"inherit",whiteSpace:"nowrap"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:1300,margin:"0 auto",padding:"24px 16px"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && stats && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:24}}>
              {[
                {icon:"👥",label:"Customers",   val:stats.customers,      grad:"linear-gradient(135deg,#1565c0,#42a5f5)",shadow:"rgba(21,101,192,0.3)"},
                {icon:"🏪",label:"Vendors",      val:stats.vendors,        grad:"linear-gradient(135deg,#1b5e20,#43a047)",shadow:"rgba(46,125,50,0.3)"},
                {icon:"🥕",label:"Products",     val:stats.vegetables,     grad:"linear-gradient(135deg,#e65100,#ffa726)",shadow:"rgba(230,81,0,0.3)"},
                {icon:"📦",label:"Total Orders", val:stats.total_bookings, grad:"linear-gradient(135deg,#6a1b9a,#ab47bc)",shadow:"rgba(106,27,154,0.3)"},
              ].map(c=>(
                <div key={c.label} style={{background:c.grad,borderRadius:16,padding:"22px 18px",boxShadow:`0 8px 25px ${c.shadow}`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",right:-8,top:-8,fontSize:70,opacity:0.15}}>{c.icon}</div>
                  <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginBottom:6,fontWeight:"bold"}}>{c.label}</div>
                  <div style={{color:"white",fontSize:36,fontWeight:900}}>{c.val}</div>
                </div>
              ))}
            </div>

            {/* Revenue quick stats */}
            {analytics && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20}}>
                {[
                  {label:"💰 Total Revenue",    val:`₹${analytics.total_revenue.toFixed(0)}`,  color:"#1b5e20",bg:"#e8f5e9"},
                  {label:"🏷️ Platform Fees",   val:`₹${analytics.platform_fees.toFixed(0)}`,  color:"#e65100",bg:"#fff3e0"},
                  {label:"🚚 Delivery Income",  val:`₹${analytics.delivery_charges.toFixed(0)}`,color:"#1565c0",bg:"#e3f2fd"},
                  {label:"🧾 Tax Collected",    val:`₹${analytics.tax_collected.toFixed(0)}`,  color:"#6a1b9a",bg:"#f3e5f5"},
                ].map(x=>(
                  <div key={x.label} style={{background:x.bg,border:`1px solid ${x.color}25`,borderRadius:12,padding:"14px 16px"}}>
                    <div style={{color:"#888",fontSize:12,marginBottom:4}}>{x.label}</div>
                    <div style={{color:x.color,fontSize:22,fontWeight:900}}>{x.val}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
              {[
                {icon:"⏳",label:"Pending",   val:stats.pending_bookings,   color:"#e65100",bg:"#fff3e0",border:"#ffcc80"},
                {icon:"✅",label:"Accepted",  val:stats.accepted_bookings,  color:"#1565c0",bg:"#e3f2fd",border:"#90caf9"},
                {icon:"🚚",label:"Delivered", val:stats.completed_bookings, color:"#1b5e20",bg:"#e8f5e9",border:"#a5d6a7"},
                {icon:"❌",label:"Rejected",  val:stats.rejected_bookings,  color:"#c62828",bg:"#ffebee",border:"#ef9a9a"},
              ].map(b=>(
                <div key={b.label} style={{background:b.bg,border:`1px solid ${b.border}`,borderRadius:12,padding:"16px",textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:6}}>{b.icon}</div>
                  <div style={{color:b.color,fontSize:26,fontWeight:900}}>{b.val}</div>
                  <div style={{color:"#666",fontSize:12}}>{b.label}</div>
                </div>
              ))}
            </div>

            {pending.length>0 && (
              <div style={{background:"#fff3e0",border:"1px solid #ffcc80",borderRadius:12,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"#e65100",fontWeight:"bold"}}>⚠️ {pending.length} vendor(s) waiting for approval</span>
                <button onClick={()=>setTab("pending")} style={{padding:"8px 18px",background:"#e65100",color:"white",border:"none",borderRadius:20,fontWeight:"bold",cursor:"pointer",fontSize:13}}>Review Now</button>
              </div>
            )}
          </>
        )}

        {/* ── ANALYTICS ── */}
        {tab==="analytics" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:20,fontSize:18}}>💰 Revenue & Profit Analytics</h2>

            {analytics ? (
              <>
                {/* Revenue Cards */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:24}}>
                  {[
                    {label:"Total Revenue",     val:`₹${analytics.total_revenue.toFixed(2)}`,     icon:"💰",grad:"linear-gradient(135deg,#1b5e20,#43a047)"},
                    {label:"Platform Fees",     val:`₹${analytics.platform_fees.toFixed(2)}`,     icon:"🏷️",grad:"linear-gradient(135deg,#e65100,#ffa726)"},
                    {label:"Delivery Income",   val:`₹${analytics.delivery_charges.toFixed(2)}`,  icon:"🚚",grad:"linear-gradient(135deg,#1565c0,#42a5f5)"},
                    {label:"Tax Collected",     val:`₹${analytics.tax_collected.toFixed(2)}`,     icon:"🧾",grad:"linear-gradient(135deg,#6a1b9a,#ab47bc)"},
                  ].map(c=>(
                    <div key={c.label} style={{background:c.grad,borderRadius:16,padding:"22px",boxShadow:"0 8px 25px rgba(0,0,0,0.15)",position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",right:-8,top:-8,fontSize:60,opacity:0.15}}>{c.icon}</div>
                      <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginBottom:6}}>{c.label}</div>
                      <div style={{color:"white",fontSize:28,fontWeight:900}}>{c.val}</div>
                    </div>
                  ))}
                </div>

                {/* Monthly Sales Bar Chart (pure CSS) */}
                <div style={{background:"white",borderRadius:16,padding:"24px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",marginBottom:20}}>
                  <h3 style={{color:"#1b5e20",marginBottom:20,fontSize:15}}>📈 Monthly Sales Chart</h3>
                  <div style={{display:"flex",alignItems:"flex-end",gap:8,height:160,overflowX:"auto",paddingBottom:8}}>
                    {analytics.monthly_sales.map((m,i)=>{
                      const maxVal = Math.max(...analytics.monthly_sales.map(x=>x.sales), 1);
                      const h = m.sales > 0 ? Math.max((m.sales/maxVal)*130, 4) : 4;
                      return (
                        <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1,minWidth:36}}>
                          <div style={{fontSize:10,color:"#888",fontWeight:"bold"}}>₹{m.sales>0?Math.round(m.sales):0}</div>
                          <div style={{
                            width:"100%", height:`${h}px`,
                            background:m.sales>0?"linear-gradient(180deg,#43a047,#1b5e20)":"#f0f0e8",
                            borderRadius:"6px 6px 0 0",
                            transition:"height 0.3s",
                            position:"relative",
                          }} title={`₹${m.sales}`} />
                          <div style={{fontSize:9,color:"#888",fontWeight:"bold",textTransform:"uppercase"}}>{m.month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Vendors */}
                <div style={{background:"white",borderRadius:16,padding:"24px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <h3 style={{color:"#1b5e20",marginBottom:16,fontSize:15}}>🏆 Top Vendors by Sales</h3>
                  {analytics.top_vendors.length===0 ? (
                    <p style={{color:"#888",textAlign:"center",padding:20}}>No data yet. Complete some orders first.</p>
                  ) : analytics.top_vendors.map((v,i)=>{
                    const maxSale = analytics.top_vendors[0]?.total_sales || 1;
                    const pct = (v.total_sales/maxSale)*100;
                    return (
                      <div key={i} style={{marginBottom:16}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{fontWeight:"bold",color:"#222",fontSize:14}}>
                            {i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "} {v.vendor_name}
                          </span>
                          <div style={{textAlign:"right"}}>
                            <span style={{color:"#1b5e20",fontWeight:900,fontSize:14}}>₹{v.total_sales.toFixed(0)}</span>
                            <span style={{color:"#888",fontSize:11,marginLeft:8}}>{v.orders} orders</span>
                            <span style={{color:"#e65100",fontSize:11,marginLeft:8}}>Fee: ₹{v.platform_fee.toFixed(0)}</span>
                          </div>
                        </div>
                        <div style={{background:"#f0f0e8",borderRadius:25,overflow:"hidden",height:8}}>
                          <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#43a047,#1b5e20)",borderRadius:25,transition:"width 0.5s"}} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{background:"white",borderRadius:14,padding:48,textAlign:"center",color:"#888"}}>
                No analytics data yet. Complete some orders first.
              </div>
            )}
          </>
        )}

        {/* ── SETTINGS ── */}
        {tab==="settings" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:20,fontSize:18}}>⚙️ Platform Settings</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20}}>

              <div style={{background:"white",borderRadius:16,padding:"24px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <h3 style={{color:"#1b5e20",marginBottom:16,fontSize:15}}>💰 Commission & Charges</h3>

                {[
                  {key:"platform_fee_percent", label:"Platform Fee (%)",         icon:"🏷️", hint:"e.g. 5 means 5% of order value"},
                  {key:"delivery_charge_base", label:"Delivery Charge (₹)",      icon:"🚚", hint:"Fixed per order"},
                  {key:"tax_percent",          label:"Tax (%)",                  icon:"🧾", hint:"Applied on item total"},
                  {key:"min_order_amount",     label:"Minimum Order Amount (₹)", icon:"💵", hint:"Customer minimum order"},
                  {key:"min_quantity_kg",      label:"Minimum Quantity",         icon:"⚖️", hint:"Per product minimum order qty"},
                ].map(f=>(
                  <div key={f.key} style={{marginBottom:16}}>
                    <label style={{display:"block",fontWeight:700,color:"#444",fontSize:13,marginBottom:5}}>{f.icon} {f.label}</label>
                    <input type="number" min="0" step="0.1"
                      value={settings[f.key]}
                      onChange={e=>setSettings({...settings,[f.key]:parseFloat(e.target.value)||0})}
                      style={{width:"100%",padding:"10px 12px",border:"1px solid #e0e0d8",borderRadius:9,fontSize:14,boxSizing:"border-box",color:"#222",background:"#f9f9f5"}} />
                    <small style={{color:"#888",fontSize:11}}>{f.hint}</small>
                  </div>
                ))}

                <button onClick={saveSettings} disabled={savingSettings}
                  style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#2e7d32,#43a047)",color:"white",border:"none",borderRadius:10,fontWeight:"bold",cursor:"pointer",fontSize:15,boxShadow:"0 4px 15px rgba(46,125,50,0.3)",opacity:savingSettings?0.7:1}}>
                  {savingSettings?"Saving...":"💾 Save Settings"}
                </button>
              </div>

              {/* Preview */}
              <div style={{background:"white",borderRadius:16,padding:"24px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <h3 style={{color:"#1b5e20",marginBottom:16,fontSize:15}}>📋 Pricing Preview</h3>
                <p style={{color:"#888",fontSize:12,marginBottom:16}}>For a ₹100 order:</p>
                {[
                  {l:"Item Total",        v:`₹100.00`,                                    c:"#222"},
                  {l:"Platform Fee",      v:`₹${(100*settings.platform_fee_percent/100).toFixed(2)} (${settings.platform_fee_percent}%)`, c:"#e65100"},
                  {l:"Delivery Charge",   v:`₹${settings.delivery_charge_base.toFixed(2)}`,c:"#1565c0"},
                  {l:"Tax",               v:`₹${(100*settings.tax_percent/100).toFixed(2)} (${settings.tax_percent}%)`, c:"#6a1b9a"},
                ].map(x=>(
                  <div key={x.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f0f0e8"}}>
                    <span style={{color:"#555",fontSize:14}}>{x.l}</span>
                    <span style={{color:x.c,fontWeight:"bold",fontSize:14}}>{x.v}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",background:"#e8f5e9",borderRadius:10,marginTop:10,paddingLeft:12,paddingRight:12}}>
                  <span style={{color:"#1b5e20",fontWeight:900,fontSize:15}}>Grand Total</span>
                  <span style={{color:"#1b5e20",fontWeight:900,fontSize:18}}>
                    ₹{(100 + (100*settings.platform_fee_percent/100) + settings.delivery_charge_base + (100*settings.tax_percent/100)).toFixed(2)}
                  </span>
                </div>
                <p style={{color:"#aaa",fontSize:11,marginTop:12,textAlign:"center"}}>Min order: ₹{settings.min_order_amount} · Min qty: {settings.min_quantity_kg}</p>
              </div>
            </div>
          </>
        )}

        {/* ── PENDING VENDORS ── */}
        {tab==="pending" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:20,fontSize:18}}>⏳ Vendor Approval Requests</h2>
            {pending.length===0 ? (
              <div style={{background:"white",border:"1px solid #e0e0d8",borderRadius:14,padding:48,textAlign:"center",color:"#888",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                ✅ No pending vendors!
              </div>
            ) : pending.map(v=>(
              <div key={v.id} style={{background:"white",border:"1px solid #e0e0d8",borderRadius:16,padding:"22px",marginBottom:18,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:18,paddingBottom:14,borderBottom:"1px solid #f0f0e8"}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <div style={{width:60,height:60,borderRadius:12,background:"#e8f5e9",border:"2px solid #a5d6a7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden",flexShrink:0}}>
                      {v.photo ? <img src={`http://localhost/uploads/${v.photo}`} alt={v.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}} /> : "🏪"}
                    </div>
                    <div>
                      <h3 style={{color:"#1b5e20",margin:"0 0 3px",fontSize:17,fontWeight:900}}>{v.shop_name||v.name+"'s Shop"}</h3>
                      <p style={{color:"#555",margin:"2px 0",fontSize:13}}>👤 {v.name} · 📧 {v.email}</p>
                      <p style={{color:"#888",margin:"2px 0",fontSize:13}}>📞 {v.phone} · 📍 {v.address}</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>vendorApproval(v.id,"approve")} style={{padding:"10px 22px",background:"linear-gradient(135deg,#2e7d32,#43a047)",border:"none",borderRadius:10,color:"white",fontWeight:"bold",cursor:"pointer",boxShadow:"0 4px 12px rgba(46,125,50,0.3)"}}>✅ Approve</button>
                    <button onClick={()=>vendorApproval(v.id,"reject")}  style={{padding:"10px 22px",background:"#ffebee",border:"1px solid #ef9a9a",borderRadius:10,color:"#c62828",fontWeight:"bold",cursor:"pointer"}}>❌ Reject</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>
                  <InfoBox title="📋 Personal Info" color="#1565c0" items={[{l:"Name",v:v.name},{l:"Address",v:v.address},{l:"Location",v:v.location||"Not provided"}]} />
                  <InfoBox title="📄 Documents" color="#e65100" items={[{l:"ID Proof No.",v:v.id_proof_number||"N/A"},{l:"Tax Number",v:v.tax_number||"N/A"}]} docs={[{label:"ID Proof",url:v.id_proof_document},{label:"Tax Doc",url:v.tax_document}]} />
                  <InfoBox title="🏦 Bank Details" color="#6a1b9a" items={[{l:"Bank",v:v.bank_name||"N/A"},{l:"A/C Holder",v:v.account_holder_name||"N/A"},{l:"A/C No.",v:v.account_number||"N/A"},{l:"IFSC",v:v.ifsc_code||"N/A"}]} />
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── USERS ── */}
        {tab==="users" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:18,fontSize:18}}>👥 All Users</h2>
            <div style={{background:"white",borderRadius:14,overflow:"auto",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:"1px solid #e0e0d8"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead>
                  <tr style={{background:"#e8f5e9"}}>
                    {["Name","Email","Phone","Role","Status","Actions"].map(h=>(
                      <th key={h} style={{padding:"13px 14px",textAlign:"left",color:"#1b5e20",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid #c8e6c9"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u,i)=>{
                    const sc={active:"#1b5e20",pending:"#e65100",blocked:"#c62828",rejected:"#616161"}[u.status]||"#555";
                    const sb={active:"#e8f5e9",pending:"#fff3e0",blocked:"#ffebee",rejected:"#f5f5f0"}[u.status]||"#f5f5f0";
                    return (
                      <tr key={u.id} style={{borderBottom:"1px solid #f0f0e8",background:i%2===0?"white":"#fafaf5"}}>
                        <td style={{padding:"11px 14px",color:"#222",fontSize:13,fontWeight:700}}>{u.name}</td>
                        <td style={{padding:"11px 14px",color:"#666",fontSize:12}}>{u.email}</td>
                        <td style={{padding:"11px 14px",color:"#555",fontSize:13}}>{u.phone}</td>
                        <td style={{padding:"11px 14px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:"bold",background:u.role==="vendor"?"#e8f5e9":"#e3f2fd",color:u.role==="vendor"?"#1b5e20":"#1565c0",textTransform:"capitalize"}}>{u.role}</span></td>
                        <td style={{padding:"11px 14px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:"bold",background:sb,color:sc,textTransform:"capitalize"}}>{u.status}</span></td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                            {u.role==="vendor"&&u.status==="active"&&<button onClick={()=>genLicence(u.id)} style={AB("#1565c0","#e3f2fd")}>🪪</button>}
                            {u.status!=="blocked"?<button onClick={()=>userAction(u.id,"block")} style={AB("#e65100","#fff3e0")}>🚫</button>:<button onClick={()=>userAction(u.id,"unblock")} style={AB("#1b5e20","#e8f5e9")}>✅</button>}
                            <button onClick={()=>{if(confirm("Delete?"))userAction(u.id,"delete");}} style={AB("#c62828","#ffebee")}>🗑️</button>
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
            <h2 style={{color:"#1b5e20",marginBottom:18,fontSize:18}}>📦 All Orders</h2>
            <div style={{background:"white",borderRadius:14,overflow:"auto",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:"1px solid #e0e0d8"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
                <thead>
                  <tr style={{background:"#e8f5e9"}}>
                    {["#","Customer","Vendor","Item","Qty","Item Total","Fees","Grand Total","Status","Date"].map(h=>(
                      <th key={h} style={{padding:"13px 14px",textAlign:"left",color:"#1b5e20",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid #c8e6c9",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b,i)=>{
                    const sc={pending:"#e65100",accepted:"#1565c0",completed:"#1b5e20",rejected:"#c62828"}[b.status]||"#555";
                    const sb={pending:"#fff3e0",accepted:"#e3f2fd",completed:"#e8f5e9",rejected:"#ffebee"}[b.status]||"#f5f5f0";
                    const fees = (b.platform_fee||0)+(b.delivery_charge||0)+(b.tax||0);
                    return (
                      <tr key={b.booking_id} style={{borderBottom:"1px solid #f0f0e8",background:i%2===0?"white":"#fafaf5"}}>
                        <td style={{padding:"10px 14px",color:"#aaa",fontSize:11}}>#{b.booking_id.slice(-5)}</td>
                        <td style={{padding:"10px 14px",color:"#222",fontSize:13,fontWeight:"bold"}}>{b.customer_name}</td>
                        <td style={{padding:"10px 14px",color:"#1b5e20",fontSize:13,fontWeight:"bold"}}>{b.vendor_name}</td>
                        <td style={{padding:"10px 14px",color:"#444",fontSize:13}}>{b.vegetable_name}</td>
                        <td style={{padding:"10px 14px",color:"#555",fontSize:13}}>{b.quantity} {b.unit}</td>
                        <td style={{padding:"10px 14px",color:"#444",fontSize:13}}>₹{Number(b.item_total||b.total_amount).toFixed(0)}</td>
                        <td style={{padding:"10px 14px",color:"#e65100",fontSize:12}}>+₹{fees.toFixed(0)}</td>
                        <td style={{padding:"10px 14px",color:"#1b5e20",fontWeight:"bold",fontSize:13}}>₹{Number(b.total_amount).toFixed(0)}</td>
                        <td style={{padding:"10px 14px"}}><span style={{padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:"bold",background:sb,color:sc,textTransform:"capitalize"}}>{b.status==="completed"?"Delivered":b.status}</span></td>
                        <td style={{padding:"10px 14px",color:"#888",fontSize:11}}>{b.created_at?.slice(0,10)}</td>
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

function InfoBox({title, color, items, docs}) {
  return (
    <div style={{background:"#fafaf5",border:"1px solid #f0f0e8",borderRadius:10,padding:"14px"}}>
      <h4 style={{color,margin:"0 0 10px",fontSize:12,textTransform:"uppercase",letterSpacing:0.5,fontWeight:800}}>{title}</h4>
      {items.map(x=>(
        <div key={x.l} style={{marginBottom:6}}>
          <span style={{color:"#888",fontSize:11}}>{x.l}</span>
          <p style={{color:"#222",margin:"1px 0",fontSize:13,fontWeight:"bold"}}>{x.v}</p>
        </div>
      ))}
      {docs && (
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
          {docs.filter(d=>d.url).map(d=>(
            <a key={d.label} href={`http://localhost/uploads/${d.url}`} target="_blank" rel="noreferrer"
              style={{padding:"5px 10px",background:"#e3f2fd",border:"1px solid #90caf9",borderRadius:7,color:"#1565c0",fontSize:11,fontWeight:"bold",textDecoration:"none"}}>
              📎 {d.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const AB = (color, bg) => ({
  padding:"5px 10px", background:bg, border:`1px solid ${color}40`,
  borderRadius:7, color, cursor:"pointer", fontSize:12, fontWeight:"bold",
});
