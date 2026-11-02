import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost/backend";

// ── Sidebar menu ──
const SIDEBAR = [
  { section:"USER MANAGEMENT", items:[
    { icon:"👥", label:"Customers",        key:"users_customer"  },
    { icon:"🏪", label:"Vendors",          key:"users_vendor"    },
    { icon:"⏳", label:"Pending Approvals",key:"pending"         },
  ]},
  { section:"PRODUCT MANAGEMENT", items:[
    { icon:"🥕", label:"All Products",     key:"products"        },
    { icon:"📊", label:"Low Stock Alerts", key:"low_stock"       },
  ]},
  { section:"ORDER MANAGEMENT", items:[
    { icon:"📦", label:"All Orders",       key:"bookings"        },
    { icon:"⏳", label:"Pending Orders",   key:"pending_orders"  },
    { icon:"✅", label:"Delivered Orders", key:"delivered_orders"},
  ]},
  { section:"PAYMENT MANAGEMENT", items:[
    { icon:"💰", label:"Revenue & Profit", key:"analytics"       },
    { icon:"⚙️", label:"Platform Settings",key:"settings"       },
  ]},
  { section:"REPORTS", items:[
    { icon:"📈", label:"Sales Report",     key:"sales_report"    },
  ]},
];

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
  const [saving,    setSaving]    = useState(false);
  const [selVendor, setSelVendor] = useState(null);
  const [sideOpen,  setSideOpen]  = useState(true);
  const now = new Date();

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadBookings(), loadPending(), loadAnalytics(), loadSettings()]);
    setLoading(false);
  }
  async function loadStats()    { try { const r=await fetch(`${API}/admin/dashboard_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setStats(d); else if(d.message?.toLowerCase().includes("login"))navigate("/login"); } catch {} }
  async function loadUsers()    { try { const r=await fetch(`${API}/admin/users_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setUsers(d.users); } catch {} }
  async function loadBookings() { try { const r=await fetch(`${API}/admin/bookings_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setBookings(d.bookings); } catch {} }
  async function loadPending()  { try { const r=await fetch(`${API}/admin/pending_vendors_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setPending(d.vendors); } catch {} }
  async function loadAnalytics(){ try { const r=await fetch(`${API}/admin/analytics_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setAnalytics(d); } catch {} }
  async function loadSettings() { try { const r=await fetch(`${API}/admin/platform_settings_api.php`,{credentials:"include"}); const d=await r.json(); if(d.success)setSettings(d.settings); } catch {} }

  async function saveSettings() {
    setSaving(true);
    const r=await fetch(`${API}/admin/platform_settings_api.php`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
    const d=await r.json();
    showToast(d.success?"✅ Settings saved!":"❌ "+d.message);
    if(d.success) loadAnalytics();
    setSaving(false);
  }
  async function userAction(uid,action) {
    const fd=new FormData(); fd.append("user_id",uid); fd.append("action",action);
    const r=await fetch(`${API}/admin/users_api.php`,{method:"POST",credentials:"include",body:fd});
    const d=await r.json(); showToast(d.success?`✅ ${d.message}`:`❌ ${d.message}`); loadAll();
  }
  async function vendorApproval(vid,action) {
    const fd=new FormData(); fd.append("vendor_id",vid); fd.append("action",action);
    const r=await fetch(`${API}/admin/vendor_approval_api.php`,{method:"POST",credentials:"include",body:fd});
    const d=await r.json(); showToast(d.success?`✅ ${d.message}`:`❌ ${d.message}`); loadAll();
  }
  async function genLicence(vid) {
    const fd=new FormData(); fd.append("vendor_id",vid);
    const r=await fetch(`${API}/admin/generate_vendor_licence_api.php`,{method:"POST",credentials:"include",body:fd});
    const d=await r.json(); showToast(d.success?`🪪 ${d.licence_number}`:`❌ ${d.message}`); loadUsers();
  }
  async function handleLogout() {
    await fetch(`${API}/logout_api.php`,{method:"POST",credentials:"include"});
    sessionStorage.removeItem("sv_user"); navigate("/login");
  }
  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  const customers  = users.filter(u=>u.role==="customer");
  const vendors    = users.filter(u=>u.role==="vendor");
  const pendOrders = bookings.filter(b=>b.status==="pending");
  const delOrders  = bookings.filter(b=>b.status==="completed");
  const lowStock   = []; // placeholder

  const filteredUsers = tab==="users_customer" ? customers : tab==="users_vendor" ? vendors : users;
  const filteredBooks = tab==="pending_orders"  ? bookings.filter(b=>b.status==="pending")
                       : tab==="delivered_orders"? bookings.filter(b=>b.status==="completed")
                       : bookings;

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:48}}>🌿</div><p style={{color:"#888"}}>Loading Admin Panel...</p>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"system-ui,sans-serif",background:"#f0f0ea"}}>

      {toast && <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:toast.startsWith("❌")?"#c62828":"#2e7d32",color:"white",padding:"12px 20px",borderRadius:10,fontWeight:"bold",boxShadow:"0 8px 25px rgba(0,0,0,0.2)",fontSize:14}}>{toast}</div>}

      {/* ── SIDEBAR ── */}
      <div style={{width:sideOpen?220:60,background:"linear-gradient(180deg,#1b5e20 0%,#0d3b12 100%)",minHeight:"100vh",flexShrink:0,transition:"width 0.25s",overflow:"hidden",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        {/* Logo */}
        <div style={{padding:"16px 14px",borderBottom:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🌿</div>
          {sideOpen && <div><div style={{color:"white",fontWeight:900,fontSize:14,lineHeight:1}}>SMART VENDOR</div><div style={{color:"rgba(255,255,255,0.55)",fontSize:9,letterSpacing:0.5}}>Buy Local • Support Local</div></div>}
        </div>

        {/* Dashboard btn */}
        <button onClick={()=>setTab("overview")} style={{margin:"8px",padding:"10px 12px",background:tab==="overview"?"rgba(255,255,255,0.2)":"transparent",border:"none",borderRadius:8,color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:tab==="overview"?"bold":"normal",fontFamily:"inherit"}}>
          <span style={{fontSize:16,flexShrink:0}}>🏠</span>{sideOpen&&"Dashboard"}
        </button>

        {SIDEBAR.map(sec=>(
          <div key={sec.section}>
            {sideOpen && <div style={{padding:"8px 14px 4px",color:"rgba(255,255,255,0.35)",fontSize:9,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>{sec.section}</div>}
            {sec.items.map(item=>(
              <button key={item.key} onClick={()=>setTab(item.key)}
                style={{width:"calc(100% - 16px)",margin:"2px 8px",padding:"9px 12px",background:tab===item.key?"rgba(255,255,255,0.2)":"transparent",border:"none",borderRadius:8,color:tab===item.key?"white":"rgba(255,255,255,0.7)",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:tab===item.key?"bold":"normal",fontFamily:"inherit",textAlign:"left"}}>
                <span style={{fontSize:15,flexShrink:0}}>{item.icon}</span>
                {sideOpen&&<span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</span>}
                {sideOpen && item.key==="pending" && pending.length>0 && <span style={{marginLeft:"auto",background:"#ef5350",color:"white",borderRadius:20,padding:"2px 7px",fontSize:10,fontWeight:900,flexShrink:0}}>{pending.length}</span>}
              </button>
            ))}
          </div>
        ))}

        {/* Logout at bottom */}
        <div style={{marginTop:"auto",borderTop:"1px solid rgba(255,255,255,0.1)",padding:"12px 8px",flexShrink:0}}>
          <button onClick={handleLogout}
            style={{width:"calc(100% - 0px)",padding:"10px 12px",background:"rgba(239,83,80,0.2)",border:"1px solid rgba(239,83,80,0.4)",borderRadius:8,color:"#ef9a9a",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:"bold",fontFamily:"inherit"}}>
            <span style={{fontSize:16,flexShrink:0}}>🚪</span>{sideOpen&&"Logout"}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* TOP NAVBAR */}
        <div style={{background:"white",borderBottom:"1px solid #e0e0d8",padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"center",height:56,flexShrink:0,boxShadow:"0 2px 6px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setSideOpen(!sideOpen)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",gap:3,padding:6}}>
              {[0,1,2].map(i=><div key={i} style={{width:20,height:2,background:"#555",borderRadius:2}}/>)}
            </button>
            <input placeholder="Search anything... (Orders, Products, Vendors)"
              style={{padding:"7px 16px",background:"#f5f5f0",border:"1px solid #e0e0d8",borderRadius:25,fontSize:13,outline:"none",width:280,color:"#333"}} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{color:"#888",fontSize:13}}>📅 {now.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})} {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span>
            {pending.length>0 && <div style={{background:"#ef5350",color:"white",borderRadius:20,padding:"4px 10px",fontSize:12,fontWeight:"bold"}}>🔔 {pending.length}</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#e8f5e9",borderRadius:25,padding:"6px 14px 6px 8px"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1b5e20,#43a047)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:14}}>{user.name?.[0]||"A"}</div>
              <div><div style={{fontWeight:700,color:"#1b5e20",fontSize:13,lineHeight:1}}>{user.name||"Admin"}</div><div style={{fontSize:10,color:"#888"}}>Super Admin</div></div>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        {tab==="overview" && (
          <div style={{background:"linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{color:"#a5d6a7",fontSize:14}}>📍</span>
                <span style={{color:"#a5d6a7",fontSize:13}}>Smart Vendor Platform</span>
              </div>
              <div style={{color:"white",fontWeight:900,fontSize:18}}>FreshMart Admin Dashboard</div>
            </div>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,fontStyle:"italic"}}>Fresh Products. Better Prices. Local Market Near You...</div>
          </div>
        )}

        <div style={{flex:1,overflowY:"auto",padding:"20px"}}>

          {/* ── OVERVIEW ── */}
          {tab==="overview" && stats && (
            <>
              {/* Top KPI Cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:20}}>
                {[
                  {icon:"💰",label:"Total Revenue",    val:`₹${analytics?.total_revenue?.toFixed(0)||0}`, sub:`+12.5%`,grad:"linear-gradient(135deg,#1b5e20,#43a047)"},
                  {icon:"🛒",label:"Total Orders",     val:stats.total_bookings,                          sub:`+8.7%`,  grad:"linear-gradient(135deg,#1565c0,#42a5f5)"},
                  {icon:"📦",label:"Today's Orders",   val:pendOrders.length,                             sub:`+10.3%`, grad:"linear-gradient(135deg,#e65100,#ffa726)"},
                  {icon:"⏳",label:"Pending Orders",   val:stats.pending_bookings,                        sub:`-2.1%`,  grad:"linear-gradient(135deg,#c62828,#ef5350)"},
                  {icon:"👥",label:"Total Customers",  val:stats.customers,                               sub:`+15.4%`, grad:"linear-gradient(135deg,#6a1b9a,#ab47bc)"},
                  {icon:"🏪",label:"Total Vendors",    val:stats.vendors,                                 sub:`+6.9%`,  grad:"linear-gradient(135deg,#00695c,#26a69a)"},
                ].map(c=>(
                  <div key={c.label} style={{background:c.grad,borderRadius:14,padding:"18px 16px",boxShadow:"0 6px 20px rgba(0,0,0,0.15)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",right:-8,top:-8,fontSize:60,opacity:0.12}}>{c.icon}</div>
                    <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,marginBottom:4,fontWeight:"bold"}}>{c.label}</div>
                    <div style={{color:"white",fontSize:28,fontWeight:900,lineHeight:1}}>{c.val}</div>
                    <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,marginTop:6}}>{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Middle row - Charts + Orders + Top Vendors */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>

                {/* Monthly Sales Chart */}
                <div style={{background:"white",borderRadius:14,padding:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                    <h3 style={{color:"#1b5e20",fontSize:13,margin:0,fontWeight:800}}>📈 Monthly Sales Overview</h3>
                    <span style={{background:"#e8f5e9",color:"#1b5e20",fontSize:10,padding:"3px 8px",borderRadius:20,fontWeight:"bold"}}>This Year</span>
                  </div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:5,height:100}}>
                    {(analytics?.monthly_sales||Array(12).fill({month:"",sales:0})).map((m,i)=>{
                      const mx=Math.max(...(analytics?.monthly_sales||[{sales:1}]).map(x=>x.sales),1);
                      const h=m.sales>0?Math.max((m.sales/mx)*80,4):4;
                      return (
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                          <div style={{width:"100%",height:`${h}px`,background:i===new Date().getMonth()?"#1b5e20":"#a5d6a7",borderRadius:"3px 3px 0 0"}} title={`₹${m.sales}`} />
                          <div style={{fontSize:7,color:"#aaa",textTransform:"uppercase"}}>{m.month?.slice(0,3)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Status Pie */}
                <div style={{background:"white",borderRadius:14,padding:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                    <h3 style={{color:"#1b5e20",fontSize:13,margin:0,fontWeight:800}}>📊 Order Statistics</h3>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:80,height:80,borderRadius:"50%",background:`conic-gradient(#43a047 0% 62%, #ffa726 62% 80%, #42a5f5 80% 92%, #ef5350 92% 100%)`,flexShrink:0,boxShadow:"0 4px 14px rgba(0,0,0,0.15)"}} />
                    <div style={{flex:1}}>
                      {[
                        {c:"#43a047",l:"Delivered",   v:`${stats.completed_bookings||0}`},
                        {c:"#ffa726",l:"Processing",  v:`${stats.accepted_bookings||0}`},
                        {c:"#42a5f5",l:"Pending",     v:`${stats.pending_bookings||0}`},
                        {c:"#ef5350",l:"Rejected",    v:`${stats.rejected_bookings||0}`},
                      ].map(x=>(
                        <div key={x.l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:x.c,flexShrink:0}} />
                          <span style={{color:"#666",fontSize:11,flex:1}}>{x.l}</span>
                          <span style={{color:"#222",fontWeight:"bold",fontSize:11}}>{x.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category-wise Sales */}
                <div style={{background:"white",borderRadius:14,padding:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <h3 style={{color:"#1b5e20",fontSize:13,margin:"0 0 12px",fontWeight:800}}>🏷️ Category Sales</h3>
                  {[
                    {cat:"Vegetables",val:72,color:"#43a047"},
                    {cat:"Fruits",    val:65,color:"#ffa726"},
                    {cat:"Grocery",   val:48,color:"#42a5f5"},
                    {cat:"Dairy",     val:40,color:"#ab47bc"},
                  ].map(c=>(
                    <div key={c.cat} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:"#555"}}>{c.cat}</span>
                        <span style={{fontSize:11,fontWeight:"bold",color:c.color}}>{c.val}%</span>
                      </div>
                      <div style={{background:"#f0f0e8",borderRadius:25,height:6,overflow:"hidden"}}>
                        <div style={{width:`${c.val}%`,height:"100%",background:c.color,borderRadius:25}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders + Top Vendors + Low Stock */}
              <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 0.8fr",gap:16}}>

                {/* Recent Orders */}
                <div style={{background:"white",borderRadius:14,padding:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <h3 style={{color:"#1b5e20",fontSize:13,margin:0,fontWeight:800}}>📋 Recent Orders</h3>
                    <button onClick={()=>setTab("bookings")} style={{background:"none",border:"none",color:"#1565c0",cursor:"pointer",fontSize:11,fontWeight:"bold"}}>View All →</button>
                  </div>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{background:"#f5f5f0"}}>
                      {["#","Customer","Vendor","Amount","Status"].map(h=><th key={h} style={{padding:"7px 8px",textAlign:"left",fontSize:10,color:"#888",fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {bookings.slice(0,5).map((b,i)=>{
                        const sc={pending:"#e65100",accepted:"#1565c0",completed:"#1b5e20",rejected:"#c62828"}[b.status]||"#555";
                        const sb={pending:"#fff3e0",accepted:"#e3f2fd",completed:"#e8f5e9",rejected:"#ffebee"}[b.status]||"#f5f5f0";
                        return (<tr key={b.booking_id} style={{borderBottom:"1px solid #f0f0e8"}}>
                          <td style={{padding:"7px 8px",color:"#aaa",fontSize:11}}>ORD{b.booking_id.slice(-4)}</td>
                          <td style={{padding:"7px 8px",color:"#333",fontSize:12,fontWeight:"bold"}}>{b.customer_name?.split(" ")[0]}</td>
                          <td style={{padding:"7px 8px",color:"#1b5e20",fontSize:11}}>{b.vendor_name?.split(" ")[0]}</td>
                          <td style={{padding:"7px 8px",color:"#e65100",fontWeight:"bold",fontSize:12}}>₹{Number(b.total_amount).toFixed(0)}</td>
                          <td style={{padding:"7px 8px"}}><span style={{padding:"2px 7px",borderRadius:20,fontSize:9,fontWeight:"bold",background:sb,color:sc,textTransform:"capitalize"}}>{b.status==="completed"?"Delivered":b.status}</span></td>
                        </tr>);
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Top Vendors */}
                <div style={{background:"white",borderRadius:14,padding:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <h3 style={{color:"#1b5e20",fontSize:13,margin:0,fontWeight:800}}>🏆 Top Vendors</h3>
                    <button onClick={()=>setTab("users_vendor")} style={{background:"none",border:"none",color:"#1565c0",cursor:"pointer",fontSize:11,fontWeight:"bold"}}>View All →</button>
                  </div>
                  {(analytics?.top_vendors||[]).slice(0,5).map((v,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #f5f5f0"}}>
                      <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#e8f5e9,#c8e6c9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":"🏪"}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:"bold",color:"#222",fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.vendor_name}</div>
                        <div style={{color:"#888",fontSize:10}}>{v.orders} orders</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{color:"#1b5e20",fontWeight:900,fontSize:13}}>₹{v.total_sales?.toFixed(0)}</div>
                        <div style={{color:"#e65100",fontSize:10}}>Fee:₹{v.platform_fee?.toFixed(0)}</div>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.top_vendors||analytics.top_vendors.length===0) && (
                    <p style={{color:"#aaa",fontSize:12,textAlign:"center",padding:16}}>Complete orders to see vendors</p>
                  )}
                </div>

                {/* Low Stock Alerts */}
                <div style={{background:"white",borderRadius:14,padding:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <h3 style={{color:"#c62828",fontSize:13,margin:0,fontWeight:800}}>⚠️ Stock Alerts</h3>
                  </div>
                  {pending.length>0 ? (
                    <div style={{background:"#fff3e0",borderRadius:10,padding:"12px"}}>
                      <div style={{color:"#e65100",fontWeight:"bold",fontSize:13}}>⏳ {pending.length} Vendor Pending</div>
                      <div style={{color:"#888",fontSize:11,marginTop:4}}>Approval required</div>
                      <button onClick={()=>setTab("pending")} style={{marginTop:8,padding:"6px 14px",background:"#e65100",color:"white",border:"none",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:"bold"}}>Review</button>
                    </div>
                  ) : (
                    <p style={{color:"#aaa",fontSize:12,textAlign:"center",padding:16}}>✅ All good!</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── ANALYTICS ── */}
          {tab==="analytics" && (
            <>
              <h2 style={{color:"#1b5e20",marginBottom:18,fontSize:17,fontWeight:800}}>💰 Revenue & Profit Analytics</h2>
              {analytics ? (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:20}}>
                    {[
                      {l:"Total Revenue",   v:`₹${analytics.total_revenue.toFixed(2)}`,   i:"💰",g:"linear-gradient(135deg,#1b5e20,#43a047)"},
                      {l:"Platform Fees",   v:`₹${analytics.platform_fees.toFixed(2)}`,   i:"🏷️",g:"linear-gradient(135deg,#e65100,#ffa726)"},
                      {l:"Delivery Income", v:`₹${analytics.delivery_charges.toFixed(2)}`,i:"🚚",g:"linear-gradient(135deg,#1565c0,#42a5f5)"},
                      {l:"Tax Collected",   v:`₹${analytics.tax_collected.toFixed(2)}`,   i:"🧾",g:"linear-gradient(135deg,#6a1b9a,#ab47bc)"},
                    ].map(c=>(
                      <div key={c.l} style={{background:c.g,borderRadius:14,padding:"20px",boxShadow:"0 6px 20px rgba(0,0,0,0.12)",position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",right:-6,top:-6,fontSize:55,opacity:0.12}}>{c.i}</div>
                        <div style={{color:"rgba(255,255,255,0.75)",fontSize:12,marginBottom:4}}>{c.l}</div>
                        <div style={{color:"white",fontSize:26,fontWeight:900}}>{c.v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{background:"white",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",marginBottom:16}}>
                    <h3 style={{color:"#1b5e20",marginBottom:16,fontSize:14,fontWeight:800}}>📈 Monthly Sales Bar Chart</h3>
                    <div style={{display:"flex",alignItems:"flex-end",gap:8,height:160,paddingBottom:8}}>
                      {analytics.monthly_sales.map((m,i)=>{
                        const mx=Math.max(...analytics.monthly_sales.map(x=>x.sales),1);
                        const h=m.sales>0?Math.max((m.sales/mx)*130,4):4;
                        return (
                          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                            <div style={{fontSize:9,color:"#888",fontWeight:"bold"}}>{m.sales>0?`₹${Math.round(m.sales)}`:""}</div>
                            <div style={{width:"100%",height:`${h}px`,background:i===new Date().getMonth()?"linear-gradient(180deg,#43a047,#1b5e20)":"#c8e6c9",borderRadius:"5px 5px 0 0"}} title={`₹${m.sales}`} />
                            <div style={{fontSize:9,color:"#888",textTransform:"uppercase",fontWeight:"bold"}}>{m.month}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{background:"white",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                    <h3 style={{color:"#1b5e20",marginBottom:14,fontSize:14,fontWeight:800}}>🏆 Top Vendors Performance</h3>
                    {analytics.top_vendors.map((v,i)=>(
                      <div key={i} style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontWeight:"bold",color:"#222",fontSize:14}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "} {v.vendor_name}</span>
                          <div>
                            <span style={{color:"#1b5e20",fontWeight:900,fontSize:14}}>₹{v.total_sales?.toFixed(0)}</span>
                            <span style={{color:"#888",fontSize:11,marginLeft:8}}>{v.orders} orders</span>
                            <span style={{color:"#e65100",fontSize:11,marginLeft:8}}>Fee:₹{v.platform_fee?.toFixed(0)}</span>
                          </div>
                        </div>
                        <div style={{background:"#f0f0e8",borderRadius:25,height:8,overflow:"hidden"}}>
                          <div style={{width:`${(v.total_sales/(analytics.top_vendors[0]?.total_sales||1))*100}%`,height:"100%",background:"linear-gradient(90deg,#43a047,#1b5e20)",borderRadius:25}} />
                        </div>
                      </div>
                    ))}
                    {analytics.top_vendors.length===0 && <p style={{color:"#aaa",textAlign:"center",padding:20,fontSize:13}}>No completed orders yet.</p>}
                  </div>
                </>
              ) : <p style={{color:"#888",textAlign:"center",padding:40}}>No analytics data. Complete some orders first.</p>}
            </>
          )}

          {/* ── PENDING APPROVALS ── */}
          {tab==="pending" && (
            <>
              <h2 style={{color:"#1b5e20",marginBottom:18,fontSize:17,fontWeight:800}}>⏳ Vendor Approval Requests</h2>
              {pending.length===0 ? (
                <div style={{background:"white",borderRadius:14,padding:48,textAlign:"center",color:"#888",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>✅ No pending vendors!</div>
              ) : pending.map(v=>(
                <div key={v.id} style={{background:"white",borderRadius:16,padding:"22px",marginBottom:18,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:16,paddingBottom:14,borderBottom:"1px solid #f0f0e8"}}>
                    <div style={{display:"flex",gap:14,alignItems:"center"}}>
                      <div style={{width:60,height:60,borderRadius:12,background:"#e8f5e9",border:"2px solid #a5d6a7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden",flexShrink:0}}>
                        {v.photo?<img src={`http://localhost/uploads/${v.photo}`} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="" onError={e=>e.target.style.display="none"}/>:"🏪"}
                      </div>
                      <div>
                        <h3 style={{color:"#1b5e20",margin:"0 0 3px",fontSize:16,fontWeight:900}}>{v.shop_name||v.name+"'s Shop"}</h3>
                        <p style={{color:"#555",margin:"2px 0",fontSize:13}}>👤 {v.name} · 📧 {v.email}</p>
                        <p style={{color:"#888",margin:"2px 0",fontSize:13}}>📞 {v.phone} · 📍 {v.address}</p>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={()=>vendorApproval(v.id,"approve")} style={{padding:"10px 22px",background:"linear-gradient(135deg,#2e7d32,#43a047)",border:"none",borderRadius:10,color:"white",fontWeight:"bold",cursor:"pointer",boxShadow:"0 4px 12px rgba(46,125,50,0.3)"}}>✅ Approve</button>
                      <button onClick={()=>vendorApproval(v.id,"reject")}  style={{padding:"10px 22px",background:"#ffebee",border:"1px solid #ef9a9a",borderRadius:10,color:"#c62828",fontWeight:"bold",cursor:"pointer"}}>❌ Reject</button>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
                    <IBox title="📋 Personal Info" color="#1565c0" items={[{l:"Name",v:v.name},{l:"Address",v:v.address},{l:"Location",v:v.location||"Not provided"}]} />
                    <IBox title="📄 Documents" color="#e65100" items={[{l:"ID Proof No.",v:v.id_proof_number||"N/A"},{l:"Tax Number",v:v.tax_number||"N/A"}]} docs={[{label:"ID Proof",url:v.id_proof_document},{label:"Tax Doc",url:v.tax_document}]} />
                    <IBox title="🏦 Bank Details" color="#6a1b9a" items={[{l:"Bank",v:v.bank_name||"N/A"},{l:"A/C Holder",v:v.account_holder_name||"N/A"},{l:"A/C No.",v:v.account_number||"N/A"},{l:"IFSC",v:v.ifsc_code||"N/A"}]} ifscValidation={v.ifsc_code} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── USERS ── */}
          {(tab==="users_customer"||tab==="users_vendor") && (
            <>
              <h2 style={{color:"#1b5e20",marginBottom:16,fontSize:17,fontWeight:800}}>{tab==="users_customer"?"👥 Customers":"🏪 Vendors"}</h2>

              {/* Vendor Profile Modal */}
              {selVendor && (
                <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div style={{background:"white",borderRadius:18,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
                    <div style={{background:"linear-gradient(135deg,#1b5e20,#2e7d32)",padding:"20px 24px",borderRadius:"18px 18px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{color:"white",fontWeight:900,fontSize:16}}>🏪 Vendor Profile</div>
                      <button onClick={()=>setSelVendor(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:16}}>✕</button>
                    </div>
                    <div style={{padding:"20px 24px"}}>
                      <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:20,paddingBottom:16,borderBottom:"1px solid #f0f0e8"}}>
                        <div style={{width:64,height:64,borderRadius:14,background:"#e8f5e9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:"2px solid #a5d6a7"}}>🏪</div>
                        <div>
                          <h2 style={{color:"#1b5e20",margin:"0 0 4px",fontSize:18}}>{selVendor.name}</h2>
                          <p style={{color:"#888",margin:"2px 0",fontSize:13}}>📧 {selVendor.email}</p>
                          <p style={{color:"#888",margin:"2px 0",fontSize:13}}>📞 {selVendor.phone}</p>
                        </div>
                      </div>
                      {[
                        {l:"Address",    v:selVendor.address},
                        {l:"Status",     v:selVendor.status},
                        {l:"Member Since",v:selVendor.created_at?.slice(0,10)||"N/A"},
                      ].map(x=>(
                        <div key={x.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f5f5f0"}}>
                          <span style={{color:"#888",fontSize:13}}>{x.l}</span>
                          <span style={{color:"#222",fontWeight:"bold",fontSize:13,textTransform:"capitalize"}}>{x.v}</span>
                        </div>
                      ))}
                      <div style={{display:"flex",gap:10,marginTop:16}}>
                        {selVendor.status!=="blocked"
                          ? <button onClick={()=>{userAction(selVendor.id,"block");setSelVendor(null);}} style={{flex:1,padding:"10px",background:"#fff3e0",color:"#e65100",border:"1px solid #ffcc80",borderRadius:9,fontWeight:"bold",cursor:"pointer"}}>🚫 Block</button>
                          : <button onClick={()=>{userAction(selVendor.id,"unblock");setSelVendor(null);}} style={{flex:1,padding:"10px",background:"#e8f5e9",color:"#1b5e20",border:"1px solid #a5d6a7",borderRadius:9,fontWeight:"bold",cursor:"pointer"}}>✅ Unblock</button>
                        }
                        {selVendor.role==="vendor"&&selVendor.status==="active"&&(
                          <button onClick={()=>{genLicence(selVendor.id);setSelVendor(null);}} style={{flex:1,padding:"10px",background:"#e3f2fd",color:"#1565c0",border:"1px solid #90caf9",borderRadius:9,fontWeight:"bold",cursor:"pointer"}}>🪪 Licence</button>
                        )}
                        <button onClick={()=>setSelVendor(null)} style={{padding:"10px 16px",background:"#f5f5f0",color:"#555",border:"none",borderRadius:9,cursor:"pointer"}}>Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{background:"white",borderRadius:14,overflow:"auto",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                  <thead><tr style={{background:"#e8f5e9"}}>
                    {["Name","Email","Phone","Status","Actions"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",color:"#1b5e20",fontSize:11,fontWeight:800,textTransform:"uppercase",borderBottom:"1px solid #c8e6c9"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filteredUsers.map((u,i)=>{
                      const sc={active:"#1b5e20",pending:"#e65100",blocked:"#c62828",rejected:"#616161"}[u.status]||"#555";
                      const sb={active:"#e8f5e9",pending:"#fff3e0",blocked:"#ffebee",rejected:"#f5f5f0"}[u.status]||"#f5f5f0";
                      return (<tr key={u.id} style={{borderBottom:"1px solid #f0f0e8",background:i%2===0?"white":"#fafaf5",cursor:"pointer"}} onClick={()=>setSelVendor(u)}>
                        <td style={{padding:"11px 14px",color:"#222",fontSize:13,fontWeight:700}}>{u.name}</td>
                        <td style={{padding:"11px 14px",color:"#666",fontSize:12}}>{u.email}</td>
                        <td style={{padding:"11px 14px",color:"#555",fontSize:13}}>{u.phone}</td>
                        <td style={{padding:"11px 14px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:"bold",background:sb,color:sc,textTransform:"capitalize"}}>{u.status}</span></td>
                        <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                          <div style={{display:"flex",gap:5}}>
                            {u.role==="vendor"&&u.status==="active"&&<button onClick={()=>genLicence(u.id)} style={AB("#1565c0","#e3f2fd")}>🪪</button>}
                            {u.status!=="blocked"?<button onClick={()=>userAction(u.id,"block")} style={AB("#e65100","#fff3e0")}>🚫</button>:<button onClick={()=>userAction(u.id,"unblock")} style={AB("#1b5e20","#e8f5e9")}>✅</button>}
                            <button onClick={()=>{if(confirm("Delete?"))userAction(u.id,"delete");}} style={AB("#c62828","#ffebee")}>🗑️</button>
                          </div>
                        </td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── ALL ORDERS ── */}
          {(tab==="bookings"||tab==="pending_orders"||tab==="delivered_orders") && (
            <>
              <h2 style={{color:"#1b5e20",marginBottom:16,fontSize:17,fontWeight:800}}>
                {tab==="pending_orders"?"⏳ Pending Orders":tab==="delivered_orders"?"🚚 Delivered Orders":"📦 All Orders"}
              </h2>
              <div style={{background:"white",borderRadius:14,overflow:"auto",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
                  <thead><tr style={{background:"#e8f5e9"}}>
                    {["#","Customer","Vendor","Item","Qty","Item Total","Fees","Grand Total","Delivery","Status","Date"].map(h=>(
                      <th key={h} style={{padding:"12px 12px",textAlign:"left",color:"#1b5e20",fontSize:10,fontWeight:800,textTransform:"uppercase",borderBottom:"1px solid #c8e6c9",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filteredBooks.map((b,i)=>{
                      const sc={pending:"#e65100",accepted:"#1565c0",completed:"#1b5e20",rejected:"#c62828"}[b.status]||"#555";
                      const sb={pending:"#fff3e0",accepted:"#e3f2fd",completed:"#e8f5e9",rejected:"#ffebee"}[b.status]||"#f5f5f0";
                      const fees=(b.platform_fee||0)+(b.delivery_charge||0)+(b.tax||0);
                      return (<tr key={b.booking_id} style={{borderBottom:"1px solid #f0f0e8",background:i%2===0?"white":"#fafaf5"}}>
                        <td style={{padding:"9px 12px",color:"#aaa",fontSize:11}}>#{b.booking_id.slice(-4)}</td>
                        <td style={{padding:"9px 12px",color:"#222",fontSize:12,fontWeight:"bold"}}>{b.customer_name}</td>
                        <td style={{padding:"9px 12px",color:"#1b5e20",fontSize:12,fontWeight:"bold"}}>{b.vendor_name}</td>
                        <td style={{padding:"9px 12px",color:"#444",fontSize:12}}>{b.vegetable_name}</td>
                        <td style={{padding:"9px 12px",color:"#555",fontSize:12}}>{b.quantity} {b.unit}</td>
                        <td style={{padding:"9px 12px",color:"#444",fontSize:12}}>₹{Number(b.item_total||b.total_amount).toFixed(0)}</td>
                        <td style={{padding:"9px 12px",color:"#e65100",fontSize:11}}>+₹{fees.toFixed(0)}</td>
                        <td style={{padding:"9px 12px",color:"#1b5e20",fontWeight:"bold",fontSize:12}}>₹{Number(b.total_amount).toFixed(0)}</td>
                        <td style={{padding:"9px 12px",color:"#888",fontSize:11,whiteSpace:"nowrap"}}>{b.delivery_slot||"—"}</td>
                        <td style={{padding:"9px 12px"}}><span style={{padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:"bold",background:sb,color:sc,textTransform:"capitalize"}}>{b.status==="completed"?"Delivered":b.status}</span></td>
                        <td style={{padding:"9px 12px",color:"#aaa",fontSize:11}}>{b.created_at?.slice(0,10)}</td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PLATFORM SETTINGS ── */}
          {tab==="settings" && (
            <>
              <h2 style={{color:"#1b5e20",marginBottom:18,fontSize:17,fontWeight:800}}>⚙️ Platform Settings</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                <div style={{background:"white",borderRadius:14,padding:"22px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <h3 style={{color:"#1b5e20",marginBottom:16,fontSize:14,fontWeight:800}}>💰 Commission & Charges</h3>
                  {[
                    {key:"platform_fee_percent",label:"Platform Fee (%)",       hint:"% of order value"},
                    {key:"delivery_charge_base",label:"Delivery Charge (₹)",    hint:"Fixed per order"},
                    {key:"tax_percent",          label:"Tax (%)",               hint:"On item total"},
                    {key:"min_order_amount",     label:"Min Order Amount (₹)",  hint:"Customer minimum"},
                    {key:"min_quantity_kg",      label:"Min Quantity",          hint:"Per product minimum"},
                  ].map(f=>(
                    <div key={f.key} style={{marginBottom:14}}>
                      <label style={{display:"block",fontWeight:700,color:"#444",fontSize:13,marginBottom:5}}>{f.label}</label>
                      <input type="number" min="0" step="0.1" value={settings[f.key]}
                        onChange={e=>setSettings({...settings,[f.key]:parseFloat(e.target.value)||0})}
                        style={{width:"100%",padding:"10px 12px",border:"1px solid #e0e0d8",borderRadius:9,fontSize:14,boxSizing:"border-box",color:"#222",background:"#f9f9f5"}} />
                      <small style={{color:"#aaa",fontSize:11}}>{f.hint}</small>
                    </div>
                  ))}
                  <button onClick={saveSettings} disabled={saving}
                    style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#2e7d32,#43a047)",color:"white",border:"none",borderRadius:10,fontWeight:"bold",cursor:"pointer",fontSize:15,opacity:saving?0.7:1}}>
                    {saving?"Saving...":"💾 Save Settings"}
                  </button>
                </div>
                <div style={{background:"white",borderRadius:14,padding:"22px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                  <h3 style={{color:"#1b5e20",marginBottom:14,fontSize:14,fontWeight:800}}>📋 Pricing Preview (₹100 order)</h3>
                  {[
                    {l:"Item Total",      v:"₹100.00",                                                       c:"#222"},
                    {l:"Platform Fee",    v:`₹${(100*settings.platform_fee_percent/100).toFixed(2)} (${settings.platform_fee_percent}%)`, c:"#e65100"},
                    {l:"Delivery",        v:`₹${settings.delivery_charge_base.toFixed(2)}`,                  c:"#1565c0"},
                    {l:"Tax",             v:`₹${(100*settings.tax_percent/100).toFixed(2)} (${settings.tax_percent}%)`, c:"#6a1b9a"},
                  ].map(x=>(
                    <div key={x.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f0f0e8"}}>
                      <span style={{color:"#555",fontSize:14}}>{x.l}</span>
                      <span style={{color:x.c,fontWeight:"bold",fontSize:14}}>{x.v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",background:"#e8f5e9",borderRadius:10,padding:"12px",marginTop:10}}>
                    <span style={{color:"#1b5e20",fontWeight:900,fontSize:15}}>Grand Total</span>
                    <span style={{color:"#1b5e20",fontWeight:900,fontSize:18}}>₹{(100+(100*settings.platform_fee_percent/100)+settings.delivery_charge_base+(100*settings.tax_percent/100)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SALES REPORT ── */}
          {tab==="sales_report" && (
            <>
              <h2 style={{color:"#1b5e20",marginBottom:18,fontSize:17,fontWeight:800}}>📈 Sales Report</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:20}}>
                {[
                  {l:"Total Revenue",   v:`₹${analytics?.total_revenue?.toFixed(2)||0}`,   c:"#1b5e20"},
                  {l:"Platform Income", v:`₹${analytics?.platform_fees?.toFixed(2)||0}`,   c:"#e65100"},
                  {l:"Total Orders",    v:bookings.length,                                  c:"#1565c0"},
                  {l:"Delivered",       v:bookings.filter(b=>b.status==="completed").length,c:"#6a1b9a"},
                ].map(c=>(
                  <div key={c.l} style={{background:"white",borderRadius:12,padding:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                    <div style={{color:"#888",fontSize:12,marginBottom:4}}>{c.l}</div>
                    <div style={{color:c.c,fontSize:26,fontWeight:900}}>{c.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"white",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <h3 style={{color:"#1b5e20",marginBottom:14,fontSize:14,fontWeight:800}}>Order Status Flow</h3>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  {[
                    {s:"Pending",  c:"#e65100",i:"⏳"},
                    {s:"Confirmed",c:"#1565c0",i:"✅"},
                    {s:"Processing",c:"#ffa726",i:"🔄"},
                    {s:"Out for Delivery",c:"#6a1b9a",i:"🚚"},
                    {s:"Delivered",c:"#1b5e20",i:"🎉"},
                  ].map((x,i,arr)=>(
                    <div key={x.s} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{background:x.c,color:"white",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:"bold",textAlign:"center"}}>
                        <div style={{fontSize:18}}>{x.i}</div>
                        <div>{x.s}</div>
                      </div>
                      {i<arr.length-1 && <div style={{color:"#aaa",fontSize:20}}>→</div>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── PRODUCTS ── */}
          {tab==="products" && (
            <>
              <h2 style={{color:"#1b5e20",marginBottom:16,fontSize:17,fontWeight:800}}>🥕 All Products</h2>
              <p style={{color:"#888",fontSize:13,textAlign:"center",padding:40}}>Product management - view from vendor dashboard.</p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function IBox({title,color,items,docs,ifscValidation}) {
  const ifscValid = !ifscValidation || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscValidation);
  return (
    <div style={{background:"#fafaf5",border:"1px solid #f0f0e8",borderRadius:10,padding:"14px"}}>
      <h4 style={{color,margin:"0 0 10px",fontSize:11,textTransform:"uppercase",letterSpacing:0.5,fontWeight:800}}>{title}</h4>
      {items.map(x=>(
        <div key={x.l} style={{marginBottom:6}}>
          <span style={{color:"#888",fontSize:10}}>{x.l}</span>
          <p style={{color:"#222",margin:"1px 0",fontSize:13,fontWeight:"bold"}}>
            {x.l==="IFSC" ? (
              <span style={{color:ifscValid?"#1b5e20":"#c62828"}}>
                {x.v} {x.v!=="N/A" && (ifscValid?"✅":"❌ Invalid IFSC")}
              </span>
            ) : x.v}
          </p>
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

const AB = (color,bg) => ({
  padding:"5px 10px",background:bg,border:`1px solid ${color}40`,
  borderRadius:7,color,cursor:"pointer",fontSize:12,fontWeight:"bold",
});
