import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost/backend";

const PRODUCT_CATEGORIES = [
  { id:"Vegetables", emoji:"🥕", label:"Vegetables"      },
  { id:"Fruits",     emoji:"🍎", label:"Fruits"           },
  { id:"Dairy",      emoji:"🥛", label:"Dairy"            },
  { id:"Grocery",    emoji:"🌾", label:"Grocery"          },
  { id:"Herbs",      emoji:"🌿", label:"Herbs"            },
  { id:"Spices",     emoji:"🌶️", label:"Spices"          },
  { id:"Leafy",      emoji:"🥬", label:"Leafy Greens"     },
  { id:"Exotic",     emoji:"🫑", label:"Exotic Veggies"   },
  { id:"Mushroom",   emoji:"🍄", label:"Mushroom"         },
  { id:"Imported",   emoji:"🌍", label:"Imported"         },
];

const POPULAR = [
  "Tomato","Potato","Onion","Carrot","Spinach","Cabbage","Cauliflower",
  "Capsicum","Brinjal","Peas","Ginger","Garlic","Coriander","Mint",
  "Apple","Banana","Mango","Grapes","Orange","Milk","Curd","Paneer",
];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("sv_user") || "{}");

  const [profile,    setProfile]    = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [bookings,   setBookings]   = useState([]);
  const [tab,        setTab]        = useState("overview");
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState("");

  // Form
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState({ name:"", price:"", unit:"kg", available_quantity:"", description:"", category:"Vegetables", location:"" });
  const [imageFile,  setImageFile]  = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formMsg,    setFormMsg]    = useState("");
  const [nameSearch, setNameSearch] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadProfile(), loadVegetables(), loadBookings()]);
    setLoading(false);
  }

  async function loadProfile() {
    try {
      const r = await fetch(`${API}/vendor/profile_api.php`, { credentials:"include" });
      const d = await r.json();
      if (d.success) setProfile(d.vendor);
      else if (d.message?.toLowerCase().includes("login")) navigate("/login");
    } catch {}
  }
  async function loadVegetables() {
    try { const r = await fetch(`${API}/vendor/vegetables_api.php`, { credentials:"include" }); const d = await r.json(); if (d.success) setVegetables(d.vegetables); } catch {}
  }
  async function loadBookings() {
    try { const r = await fetch(`${API}/vendor/bookings_api.php`, { credentials:"include" }); const d = await r.json(); if (d.success) setBookings(d.bookings); } catch {}
  }

  async function handleLogout() {
    await fetch(`${API}/logout_api.php`, { method:"POST", credentials:"include" });
    sessionStorage.removeItem("sv_user");
    navigate("/login");
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ name:"", price:"", unit:"kg", available_quantity:"", description:"", category:"Vegetables", location:"" });
    setImageFile(null); setImagePreview(null); setFormMsg(""); setShowForm(true);
  }

  function openEditForm(veg) {
    setEditingId(veg.id);
    setForm({ name:veg.name, price:veg.price, unit:veg.unit, available_quantity:veg.quantity, description:veg.description, category:veg.category||"Vegetables", location:veg.location||"" });
    setImageFile(null);
    setImagePreview(veg.image||null);
    setFormMsg(""); setShowForm(true);
  }

  async function handleSaveVeg(e) {
    e.preventDefault();
    setFormMsg("");
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    if (imageFile) fd.append("image", imageFile);
    if (editingId) fd.append("id", editingId);
    const url = editingId ? `${API}/vendor/edit_vegetable_api.php` : `${API}/vendor/add_vegetable_api.php`;
    const r = await fetch(url, { method:"POST", credentials:"include", body:fd });
    const d = await r.json();
    if (d.success) { setShowForm(false); loadVegetables(); showToast("✅ Product saved!"); }
    else setFormMsg(d.message);
  }

  async function handleDeleteVeg(id) {
    if (!confirm("Delete this product?")) return;
    const r = await fetch(`${API}/vendor/delete_vegetable_api.php`, { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    const d = await r.json();
    if (d.success) { loadVegetables(); showToast("🗑️ Product deleted."); }
    else alert(d.message);
  }

  async function handleBookingStatus(bid, status) {
    const r = await fetch(`${API}/vendor/bookings_api.php`, { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({booking_id:bid, status}) });
    const d = await r.json();
    if (d.success) { showToast(`✅ Booking ${status}!`); loadBookings(); }
    else alert(d.message);
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(""),2500); }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setForm({...form, location:`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`}),
        () => alert("Location access denied.")
      );
    }
  };

  const statusColor = { pending:"#e65100", accepted:"#1b5e20", rejected:"#c62828", completed:"#1565c0" };
  const statusBg    = { pending:"#fff3e0", accepted:"#e8f5e9", rejected:"#ffebee", completed:"#e3f2fd" };

        {/* Logout at bottom */}
        <div style={{marginTop:"auto",borderTop:"1px solid rgba(255,255,255,0.1)",padding:"12px 8px",flexShrink:0}}>
          <button onClick={handleLogout}
            style={{width:"calc(100%)",padding:"10px 12px",background:"rgba(239,83,80,0.2)",border:"1px solid rgba(239,83,80,0.4)",borderRadius:8,color:"#ef9a9a",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:"bold",fontFamily:"inherit"}}>
            <span style={{fontSize:16,flexShrink:0}}>🚪</span> Logout
          </button>
        </div>

  return (
    <div style={{minHeight:"100vh",background:"#f5f5f0",fontFamily:"system-ui,sans-serif"}}>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:"#2e7d32",color:"white",padding:"12px 20px",borderRadius:10,fontWeight:"bold",boxShadow:"0 8px 25px rgba(0,0,0,0.3)",fontSize:14}}>
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{background:"white",borderBottom:"1px solid #e0e0d8",padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center",height:60,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#1b5e20,#43a047)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🌿</div>
          <div>
            <div style={{fontWeight:900,fontSize:16,color:"#1b5e20",lineHeight:1}}>FreshMart</div>
            <div style={{fontSize:10,color:"#888"}}>Vendor Panel</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{background:"#e8f5e9",border:"1px solid #a5d6a7",borderRadius:20,padding:"5px 14px",color:"#1b5e20",fontSize:13,fontWeight:"bold"}}>
            🏪 {profile?.shop_name || user.name}
          </div>
          <button onClick={handleLogout} style={{padding:"7px 16px",background:"#ffebee",border:"1px solid #ef9a9a",borderRadius:20,color:"#c62828",cursor:"pointer",fontWeight:"bold",fontSize:13}}>
            Logout
          </button>
        </div>
      </nav>

      {/* TABS */}
      <div style={{background:"white",display:"flex",gap:0,borderBottom:"2px solid #f0f0e8",padding:"0 24px"}}>
        {[
          {key:"overview",  label:"📊 Overview"},
          {key:"products",  label:`🥕 My Products (${vegetables.length})`},
          {key:"bookings",  label:`📦 Orders (${bookings.length})`},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{padding:"14px 20px",border:"none",background:"transparent",cursor:"pointer",fontSize:14,color:tab===t.key?"#1b5e20":"#888",fontWeight:tab===t.key?"bold":"normal",borderBottom:tab===t.key?"3px solid #2e7d32":"3px solid transparent",transition:"all 0.2s",fontFamily:"inherit"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 16px"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:24}}>
              {[
                {icon:"🥕",label:"My Products", val:vegetables.length, grad:"linear-gradient(135deg,#1b5e20,#43a047)"},
                {icon:"📦",label:"Total Orders", val:bookings.length,   grad:"linear-gradient(135deg,#1565c0,#1976d2)"},
                {icon:"⏳",label:"Pending",      val:bookings.filter(b=>b.status==="pending").length,   grad:"linear-gradient(135deg,#e65100,#f57c00)"},
                {icon:"🚚",label:"Delivered",    val:bookings.filter(b=>b.status==="completed").length, grad:"linear-gradient(135deg,#6a1b9a,#7b1fa2)"},
              ].map(c=>(
                <div key={c.label} style={{background:c.grad,borderRadius:16,padding:"22px 18px",boxShadow:"0 8px 25px rgba(0,0,0,0.15)",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",right:-8,top:-8,fontSize:70,opacity:0.15}}>{c.icon}</div>
                  <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginBottom:6}}>{c.label}</div>
                  <div style={{color:"white",fontSize:36,fontWeight:900}}>{c.val}</div>
                </div>
              ))}
            </div>

            {profile?.licence_number && (
              <div style={{background:"white",border:"1px solid #a5d6a7",borderRadius:12,padding:"14px 18px",marginBottom:16}}>
                <span style={{color:"#888",fontSize:12}}>🪪 Licence Number: </span>
                <span style={{color:"#1b5e20",fontWeight:"bold"}}>{profile.licence_number}</span>
              </div>
            )}

            <div style={{background:"white",borderRadius:14,padding:"20px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
              <h3 style={{color:"#1b5e20",marginBottom:14,fontSize:15}}>ℹ️ Quick Guide</h3>
              {[
                {n:"1",t:"Add Products",d:"Go to My Products → Add product with photo"},
                {n:"2",t:"Manage Orders",d:"Accept or reject customer bookings"},
                {n:"3",t:"Mark Delivered",d:"After delivery, click 'Mark Delivered'"},
                {n:"4",t:"Update Stock",d:"Edit product to update available quantity"},
              ].map(s=>(
                <div key={s.n} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"#e8f5e9",display:"flex",alignItems:"center",justifyContent:"center",color:"#2e7d32",fontWeight:900,fontSize:12,flexShrink:0}}>{s.n}</div>
                  <div>
                    <div style={{color:"#333",fontWeight:"bold",fontSize:13}}>{s.t}</div>
                    <div style={{color:"#888",fontSize:12}}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PRODUCTS ── */}
        {tab==="products" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{color:"#1b5e20",margin:0,fontSize:18}}>My Products</h2>
              <button onClick={openAddForm} style={{padding:"10px 22px",background:"linear-gradient(135deg,#2e7d32,#43a047)",color:"white",border:"none",borderRadius:10,fontWeight:"bold",cursor:"pointer",fontSize:14,boxShadow:"0 4px 12px rgba(46,125,50,0.3)"}}>
                + Add Product
              </button>
            </div>

            {vegetables.length===0 ? (
              <div style={{background:"white",borderRadius:14,padding:48,textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:48,marginBottom:12}}>🥕</div>
                <p style={{color:"#888"}}>No products yet. Add your first product!</p>
                <button onClick={openAddForm} style={{marginTop:14,padding:"11px 24px",background:"linear-gradient(135deg,#2e7d32,#43a047)",color:"white",border:"none",borderRadius:10,fontWeight:"bold",cursor:"pointer"}}>Add Product</button>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
                {vegetables.map(veg=>(
                  <div key={veg.id} style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.07)",border:"1px solid #f0f0e8"}}>
                    <div style={{height:150,background:"#f5f5f0",position:"relative",overflow:"hidden"}}>
                      {veg.image
                        ? <img src={veg.image.startsWith("http")?veg.image:`http://localhost/uploads/${veg.image}`}
                            alt={veg.name} style={{width:"100%",height:"100%",objectFit:"cover"}}
                            onError={e=>{e.target.onerror=null;e.target.style.display="none";}} />
                        : <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>
                            {PRODUCT_CATEGORIES.find(c=>c.id===veg.category)?.emoji||"🥬"}
                          </div>
                      }
                      <div style={{position:"absolute",top:8,left:8,background:"rgba(46,125,50,0.9)",borderRadius:20,padding:"2px 8px",color:"white",fontSize:9,fontWeight:"bold"}}>
                        {veg.category||"Vegetables"}
                      </div>
                    </div>
                    <div style={{padding:"12px"}}>
                      <h3 style={{color:"#222",margin:"0 0 4px",fontSize:14,fontWeight:700}}>{veg.name}</h3>
                      <p style={{color:"#e65100",fontWeight:900,fontSize:16,margin:"0 0 4px"}}>₹{veg.price} <span style={{color:"#888",fontWeight:"normal",fontSize:11}}>/{veg.unit}</span></p>
                      <p style={{color:"#888",fontSize:12,margin:"0 0 10px"}}>Stock: {veg.quantity} {veg.unit}</p>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>openEditForm(veg)} style={{flex:1,padding:"7px",background:"#e3f2fd",color:"#1565c0",border:"none",borderRadius:7,fontWeight:"bold",cursor:"pointer",fontSize:12}}>✏️ Edit</button>
                        <button onClick={()=>handleDeleteVeg(veg.id)} style={{flex:1,padding:"7px",background:"#ffebee",color:"#c62828",border:"none",borderRadius:7,fontWeight:"bold",cursor:"pointer",fontSize:12}}>🗑️ Del</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── BOOKINGS ── */}
        {tab==="bookings" && (
          <>
            <h2 style={{color:"#1b5e20",marginBottom:18,fontSize:18}}>Customer Orders</h2>
            {bookings.length===0 ? (
              <div style={{background:"white",borderRadius:14,padding:48,textAlign:"center",color:"#888",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                📭 No orders yet.
              </div>
            ) : bookings.map(b=>{
              const st = b.status;
              return (
                <div key={b.booking_id} style={{background:"white",borderRadius:14,padding:"18px 20px",marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:`1px solid ${statusBg[st]||"#f0f0e8"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                    <div style={{flex:1}}>
                      <h3 style={{color:"#1b5e20",margin:"0 0 8px",fontSize:16,fontWeight:900}}>🥬 {b.vegetable_name}</h3>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",marginBottom:8}}>
                        {[
                          {l:"👤 Customer", v:b.customer_name},
                          {l:"📞 Phone",    v:b.customer_phone||"N/A"},
                          {l:"📦 Quantity", v:`${b.quantity} ${b.unit}`},
                          {l:"💰 Total",    v:`₹${Number(b.total_amount).toFixed(2)}`},
                        ].map(x=>(
                          <p key={x.l} style={{margin:0,color:"#555",fontSize:13}}>
                            <span style={{color:"#888"}}>{x.l}: </span><strong>{x.v}</strong>
                          </p>
                        ))}
                      </div>
                      {b.delivery_slot && (
                        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fff3e0",border:"1px solid #ffcc80",borderRadius:8,padding:"5px 10px",marginBottom:6}}>
                          <span>🚚</span>
                          <span style={{color:"#e65100",fontSize:12,fontWeight:"bold"}}>{b.delivery_slot}</span>
                        </div>
                      )}
                      {b.customer_note && <p style={{color:"#888",fontSize:12,margin:"4px 0"}}>📝 {b.customer_note}</p>}
                      <p style={{color:"#aaa",fontSize:11,margin:0}}>📅 {b.created_at}</p>
                    </div>

                    <div style={{textAlign:"right",flexShrink:0}}>
                      <span style={{display:"inline-block",padding:"6px 14px",borderRadius:20,fontWeight:"bold",fontSize:13,background:statusBg[st]||"#f5f5f0",color:statusColor[st]||"#555",textTransform:"capitalize",marginBottom:10}}>
                        {st==="completed"?"✅ Delivered":st}
                      </span>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {st==="pending" && <>
                          <button onClick={()=>handleBookingStatus(b.booking_id,"accepted")} style={{padding:"8px 16px",background:"#e8f5e9",color:"#2e7d32",border:"1px solid #a5d6a7",borderRadius:8,fontWeight:"bold",cursor:"pointer",fontSize:13}}>✅ Accept</button>
                          <button onClick={()=>handleBookingStatus(b.booking_id,"rejected")} style={{padding:"8px 16px",background:"#ffebee",color:"#c62828",border:"1px solid #ef9a9a",borderRadius:8,fontWeight:"bold",cursor:"pointer",fontSize:13}}>❌ Reject</button>
                        </>}
                        {st==="accepted" && (
                          <button onClick={()=>handleBookingStatus(b.booking_id,"completed")} style={{padding:"8px 16px",background:"linear-gradient(135deg,#1565c0,#1976d2)",color:"white",border:"none",borderRadius:8,fontWeight:"bold",cursor:"pointer",fontSize:13,boxShadow:"0 4px 12px rgba(21,101,192,0.3)"}}>
                            🚚 Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── ADD/EDIT PRODUCT MODAL ── */}
      {showForm && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:1000}}>
          <div style={{background:"white",width:"100%",maxWidth:540,borderRadius:18,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>

            {/* Modal Header */}
            <div style={{background:"linear-gradient(135deg,#1b5e20,#2e7d32)",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"18px 18px 0 0"}}>
              <h2 style={{color:"white",margin:0,fontSize:18}}>{editingId?"✏️ Edit Product":"➕ Add New Product"}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:16}}>✕</button>
            </div>

            <form onSubmit={handleSaveVeg} style={{padding:"20px 24px"}}>

              {/* Real-time Image Preview */}
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{width:120,height:120,borderRadius:14,background:"#f5f5f0",border:"2px dashed #a5d6a7",margin:"0 auto 12px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                    : PRODUCT_CATEGORIES.find(c=>c.id===form.category)?.emoji||"🥬"
                  }
                </div>
                <label style={{padding:"8px 18px",background:"#e8f5e9",color:"#1b5e20",border:"1px solid #a5d6a7",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:"bold"}}>
                  📷 {imageFile?"Change Photo":"Upload Photo"}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{display:"none"}} />
                </label>
              </div>

              {/* Product Name with suggestions */}
              <div style={{marginBottom:14}}>
                <label style={LBL2}>Product Name *</label>
                <input type="text" placeholder="Type or select from suggestions below"
                  value={form.name}
                  onChange={e=>{setForm({...form,name:e.target.value}); setNameSearch(e.target.value);}}
                  required style={INP2} />
                {/* Popular suggestions */}
                {nameSearch && (
                  <div style={{background:"white",border:"1px solid #e0e0d8",borderRadius:10,padding:"6px",marginTop:4,maxHeight:140,overflowY:"auto",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                    {POPULAR.filter(p=>p.toLowerCase().includes(nameSearch.toLowerCase())).slice(0,8).map(p=>(
                      <div key={p} onClick={()=>{setForm({...form,name:p});setNameSearch("");}}
                        style={{padding:"7px 12px",cursor:"pointer",borderRadius:6,fontSize:13,color:"#333"}}
                        onMouseEnter={e=>e.target.style.background="#f0f0e8"}
                        onMouseLeave={e=>e.target.style.background="transparent"}>
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category */}
              <div style={{marginBottom:14}}>
                <label style={LBL2}>Category *</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {PRODUCT_CATEGORIES.map(c=>(
                    <button key={c.id} type="button" onClick={()=>setForm({...form,category:c.id})}
                      style={{padding:"7px 14px",background:form.category===c.id?"linear-gradient(135deg,#2e7d32,#43a047)":"#f5f5f0",color:form.category===c.id?"white":"#555",border:form.category===c.id?"none":"1px solid #e0e0d8",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:"bold",display:"flex",alignItems:"center",gap:4}}>
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price, Quantity, Unit */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
                <div>
                  <label style={LBL2}>Price (₹) *</label>
                  <input type="number" placeholder="e.g. 40" value={form.price}
                    onChange={e=>setForm({...form,price:e.target.value})} required style={INP2} />
                </div>
                <div>
                  <label style={LBL2}>Quantity *</label>
                  <input type="number" placeholder="e.g. 50" value={form.available_quantity}
                    onChange={e=>setForm({...form,available_quantity:e.target.value})} required style={INP2} />
                </div>
                <div>
                  <label style={LBL2}>Unit *</label>
                  <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={INP2}>
                    <option value="kg">kg</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                    <option value="litre">litre</option>
                    <option value="gm">gm</option>
                    <option value="packet">packet</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{marginBottom:14}}>
                <label style={LBL2}>Description</label>
                <textarea placeholder="Optional description" value={form.description}
                  onChange={e=>setForm({...form,description:e.target.value})}
                  style={{...INP2,minHeight:60,resize:"vertical"}} />
              </div>

              {/* Location */}
              <div style={{marginBottom:18}}>
                <label style={LBL2}>Pickup Location</label>
                <div style={{display:"flex",gap:8}}>
                  <input type="text" placeholder="Enter location or use GPS"
                    value={form.location} onChange={e=>setForm({...form,location:e.target.value})}
                    style={{...INP2,flex:1}} />
                  <button type="button" onClick={getLocation}
                    style={{padding:"0 14px",background:"#e3f2fd",border:"1px solid #90caf9",borderRadius:10,color:"#1565c0",cursor:"pointer",fontSize:18,flexShrink:0}}>
                    📍
                  </button>
                </div>
              </div>

              {formMsg && <p style={{color:"#c62828",textAlign:"center",fontWeight:"bold",fontSize:13,marginBottom:12}}>{formMsg}</p>}

              <div style={{display:"flex",gap:10}}>
                <button type="submit" style={{flex:1,padding:"13px",background:"linear-gradient(135deg,#2e7d32,#43a047)",color:"white",border:"none",borderRadius:10,fontWeight:"bold",cursor:"pointer",fontSize:15,boxShadow:"0 4px 15px rgba(46,125,50,0.3)"}}>
                  {editingId?"Update Product":"Add Product"}
                </button>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:"13px 20px",background:"#f5f5f0",color:"#555",border:"none",borderRadius:10,cursor:"pointer",fontSize:14}}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const LBL2 = { display:"block", marginBottom:6, fontWeight:700, color:"#444", fontSize:13 };
const INP2 = { width:"100%", padding:"10px 12px", background:"#f5f5f0", border:"1px solid #e0e0d8", borderRadius:9, fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:"inherit", color:"#333" };
