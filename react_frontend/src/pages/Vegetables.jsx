import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id:"all",        icon:"🛒", label:"All"           },
  { id:"Vegetables", icon:"🥕", label:"Vegetables"    },
  { id:"Fruits",     icon:"🍎", label:"Fresh Fruits"  },
  { id:"Dairy",      icon:"🥛", label:"Dairy"         },
  { id:"Grocery",    icon:"🌾", label:"Grocery"       },
  { id:"Herbs",      icon:"🌿", label:"Herbs"         },
  { id:"Spices",     icon:"🌶️", label:"Spices"       },
  { id:"Leafy",      icon:"🥬", label:"Leafy Greens"  },
];

const BANNERS = [
  { bg:"linear-gradient(135deg,#1b5e20,#43a047)", emoji:"🥕", title:"Fresh Vegetables Daily", sub:"Direct from local farms • Best prices guaranteed", badge:"UP TO 30% OFF" },
  { bg:"linear-gradient(135deg,#e65100,#ff9800)", emoji:"🍎", title:"Fresh Fruits Season",    sub:"Hand-picked seasonal fruits • Farm fresh quality",  badge:"NEW ARRIVALS"  },
  { bg:"linear-gradient(135deg,#1565c0,#42a5f5)", emoji:"🥛", title:"Pure Dairy Products",   sub:"Fresh milk, curd & more • Delivered every morning",  badge:"DAILY FRESH"   },
  { bg:"linear-gradient(135deg,#6a1b9a,#ab47bc)", emoji:"🌾", title:"Organic Grocery",       sub:"Chemical-free • Healthy living for your family",      badge:"ORGANIC"       },
];

export default function Vegetables() {
  const navigate = useNavigate();
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
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const bannerRef = useRef(null);

  // Auto-slide banner
  useEffect(() => {
    const t = setInterval(() => setBanner(b => (b+1) % BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const load = () => {
    fetch("http://localhost/backend/customer/vegetables_api.php", { credentials:"include" })
      .then(r=>r.json())
      .then(d=>{
        if (d.success) { setVegetables(d.vegetables); setMessage(""); }
        else setMessage(d.message || "Failed to load.");
      })
      .catch(()=>setMessage("Connection failed."));
  };

  useEffect(()=>{ load(); },[]);

  const open  = (v) => { setSelected(v); setQty(1); setNote(""); setBookMsg(""); setDeliveryInfo(null); };
  const close = () => { setSelected(null); setBookMsg(""); setDeliveryInfo(null); };
  const total = selected ? (Number(qty)*Number(selected.price)).toFixed(2) : "0.00";

  // Calculate delivery slot
  const getDeliverySlot = () => {
    const h = new Date().getHours();
    if (h>=5  && h<8)  return { slot:"10:00 AM - 12:00 PM Today",  color:"#66bb6a" };
    if (h>=8  && h<12) return { slot:"2:00 PM - 4:00 PM Today",    color:"#42a5f5" };
    if (h>=12 && h<18) return { slot:"7:00 AM - 9:00 AM Tomorrow", color:"#ffa726" };
    return                   { slot:"7:00 AM - 9:00 AM Tomorrow",   color:"#ffa726" };
  };

  const confirmBook = async () => {
    if (!qty || Number(qty)<=0) { setBookMsg("Enter valid quantity."); return; }
    if (Number(qty)>Number(selected.available_quantity)) {
      setBookMsg(`Only ${selected.available_quantity} ${selected.unit} available.`); return;
    }
    setBooking(true);
    const fd = new FormData();
    fd.append("vegetable_id",  selected.id);
    fd.append("quantity",      qty);
    fd.append("customer_note", note);
    try {
      const r = await fetch("http://localhost/backend/customer/book_api.php", { method:"POST", credentials:"include", body:fd });
      const d = await r.json();
      if (d.success) {
        setDeliveryInfo({ slot: d.delivery_slot, bookingId: d.booking_id, total: d.total_amount });
        load();
      } else setBookMsg(d.message||"Booking failed.");
    } catch { setBookMsg("Connection failed."); }
    finally { setBooking(false); }
  };

  const filtered = vegetables.filter(v =>
    (category==="all" || v.category===category) &&
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const B = BANNERS[banner];

  return (
    <div style={{minHeight:"100vh", background:"#0a0f0a"}}>

      {/* ── TOP NAV ── */}
      <nav style={{background:"rgba(10,20,10,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center",height:60,position:"sticky",top:0,zIndex:200}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#1b5e20,#43a047)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 4px 12px rgba(46,125,50,0.5)"}}>🌿</div>
          <div>
            <div style={{color:"white",fontWeight:900,fontSize:16,lineHeight:1}}>FreshMart</div>
            <div style={{color:"#81c784",fontSize:10,fontWeight:"bold"}}>Smart Vendor</div>
          </div>
        </div>

        {/* Search */}
        <div style={{flex:1,maxWidth:400,margin:"0 20px",position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search vegetables, fruits, grocery..."
            style={{width:"100%",padding:"9px 16px 9px 36px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:25,color:"white",fontSize:13,outline:"none",boxSizing:"border-box"}} />
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>navigate("/my-bookings")} style={NB("#ffa726","rgba(255,167,38,0.15)")}>📦 Orders</button>
          <button onClick={()=>navigate("/customer-dashboard")} style={NB("#90caf9","rgba(21,101,192,0.15)")}>← Home</button>
        </div>
      </nav>

      <div style={{display:"flex"}}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{width:200,minHeight:"calc(100vh - 60px)",background:"rgba(0,0,0,0.4)",borderRight:"1px solid rgba(255,255,255,0.06)",padding:"16px 0",position:"sticky",top:60,height:"calc(100vh - 60px)",overflowY:"auto",flexShrink:0}}>
          <div style={{padding:"0 12px 12px",color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:"bold",textTransform:"uppercase",letterSpacing:1}}>Categories</div>
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setCategory(c.id)}
              style={{width:"100%",padding:"12px 16px",background:category===c.id?"rgba(46,125,50,0.3)":"transparent",border:"none",borderLeft:category===c.id?"3px solid #43a047":"3px solid transparent",color:category===c.id?"#81c784":"rgba(255,255,255,0.7)",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:category===c.id?"bold":"normal",display:"flex",alignItems:"center",gap:10,transition:"all 0.2s"}}>
              <span style={{fontSize:18}}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:1,padding:"20px 24px",overflowX:"hidden"}}>

          {/* ── BANNER SLIDER ── */}
          <div style={{borderRadius:16,overflow:"hidden",marginBottom:24,position:"relative",height:160,cursor:"pointer"}}>
            <div style={{background:B.bg,height:"100%",display:"flex",alignItems:"center",padding:"0 40px",transition:"all 0.5s",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:-20,top:-20,fontSize:160,opacity:0.12}}>{B.emoji}</div>
              <div style={{flex:1,position:"relative",zIndex:1}}>
                <span style={{background:"rgba(255,255,255,0.2)",color:"white",fontSize:10,fontWeight:"bold",padding:"4px 10px",borderRadius:20,letterSpacing:1,marginBottom:10,display:"inline-block"}}>{B.badge}</span>
                <h2 style={{color:"white",margin:"6px 0 6px",fontSize:22,fontWeight:900}}>{B.title}</h2>
                <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,margin:0}}>{B.sub}</p>
              </div>
              <div style={{fontSize:80,filter:"drop-shadow(0 8px 20px rgba(0,0,0,0.4))"}}>{B.emoji}</div>
            </div>
            {/* Dots */}
            <div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
              {BANNERS.map((_,i)=>(
                <div key={i} onClick={()=>setBanner(i)}
                  style={{width:i===banner?20:6,height:6,borderRadius:3,background:i===banner?"white":"rgba(255,255,255,0.4)",transition:"all 0.3s",cursor:"pointer"}} />
              ))}
            </div>
          </div>

          {/* ── CATEGORY CHIPS (horizontal scroll) ── */}
          <div style={{display:"flex",gap:10,overflowX:"auto",marginBottom:20,paddingBottom:4}}>
            {CATEGORIES.map(c=>(
              <button key={c.id} onClick={()=>setCategory(c.id)}
                style={{padding:"8px 16px",background:category===c.id?"linear-gradient(135deg,#1b5e20,#43a047)":"rgba(255,255,255,0.07)",border:category===c.id?"none":"1px solid rgba(255,255,255,0.1)",borderRadius:25,color:category===c.id?"white":"rgba(255,255,255,0.7)",cursor:"pointer",fontWeight:"bold",fontSize:12,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s",flexShrink:0}}>
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          {message && <p style={{textAlign:"center",color:"rgba(255,255,255,0.4)",marginTop:40,fontSize:15}}>{message}</p>}

          {/* ── SECTION TITLE ── */}
          {filtered.length>0 && (
            <h3 style={{color:"rgba(255,255,255,0.7)",fontSize:14,marginBottom:16,fontWeight:"bold"}}>
              {CATEGORIES.find(c=>c.id===category)?.icon} {CATEGORIES.find(c=>c.id===category)?.label || "All Products"} ({filtered.length})
            </h3>
          )}

          {/* ── PRODUCTS GRID ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
            {filtered.map(v=>(
              <div key={v.id} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>

                {/* Product Image */}
                <div style={{height:150,background:"linear-gradient(135deg,rgba(27,94,32,0.2),rgba(10,30,10,0.4))",position:"relative",overflow:"hidden"}}>
                  {v.image
                    ? <img src={v.image.startsWith("http")?v.image:`http://localhost/uploads/${v.image}`}
                        alt={v.name} style={{width:"100%",height:"100%",objectFit:"cover"}}
                        onError={e=>{e.target.onerror=null;e.target.style.display="none";}} />
                    : <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>
                        {CATEGORIES.find(c=>c.id===v.category)?.icon || "🥬"}
                      </div>
                  }
                  {/* Category badge */}
                  <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.6)",borderRadius:20,padding:"3px 8px",color:"white",fontSize:10,fontWeight:"bold"}}>
                    {v.category || "Vegetables"}
                  </div>
                  {/* Stock badge */}
                  <div style={{position:"absolute",top:8,right:8,background:v.available_quantity>10?"rgba(46,125,50,0.8)":"rgba(230,81,0,0.8)",borderRadius:20,padding:"3px 8px",color:"white",fontSize:10,fontWeight:"bold"}}>
                    {v.available_quantity} {v.unit}
                  </div>
                </div>

                <div style={{padding:"12px 14px"}}>
                  <h3 style={{color:"white",margin:"0 0 4px",fontSize:14,fontWeight:"bold",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.name}</h3>
                  <p style={{color:"#81c784",fontSize:11,margin:"0 0 8px"}}>🏪 {v.vendor_name}</p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{color:"#ffa726",fontWeight:900,fontSize:18}}>₹{v.price}</span>
                    <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>/{v.unit}</span>
                  </div>
                  <button onClick={()=>open(v)}
                    style={{width:"100%",padding:"9px",background:"linear-gradient(135deg,#1b5e20,#43a047)",color:"white",border:"none",borderRadius:8,fontWeight:"bold",cursor:"pointer",fontSize:13,boxShadow:"0 4px 12px rgba(46,125,50,0.4)"}}>
                    🛒 Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length===0 && !message && (
            <div style={{textAlign:"center",padding:60,color:"rgba(255,255,255,0.4)"}}>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <p>No products found in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOOKING MODAL ── */}
      {selected && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:1000}}>
          <div style={{background:"#0d1f0d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,0.7)"}}>

            {/* Delivery Success Screen */}
            {deliveryInfo ? (
              <div style={{padding:32,textAlign:"center"}}>
                <div style={{fontSize:64,marginBottom:16}}>✅</div>
                <h2 style={{color:"#81c784",marginBottom:8,fontSize:22}}>Booking Confirmed!</h2>
                <p style={{color:"rgba(255,255,255,0.6)",marginBottom:24,fontSize:14}}>Booking ID: #{deliveryInfo.bookingId?.slice(-6)}</p>

                <div style={{background:"rgba(46,125,50,0.15)",border:"1px solid rgba(46,125,50,0.3)",borderRadius:14,padding:"20px 24px",marginBottom:20}}>
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:6}}>🚚 Estimated Delivery</div>
                  <div style={{color:"#ffa726",fontWeight:900,fontSize:20}}>{deliveryInfo.slot}</div>
                </div>

                <div style={{background:"rgba(255,167,38,0.1)",border:"1px solid rgba(255,167,38,0.2)",borderRadius:14,padding:"16px",marginBottom:20}}>
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:4}}>Total Amount</div>
                  <div style={{color:"#ffa726",fontWeight:900,fontSize:28}}>₹{Number(deliveryInfo.total).toFixed(2)}</div>
                </div>

                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>navigate("/my-bookings")} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,#1b5e20,#43a047)",color:"white",border:"none",borderRadius:10,fontWeight:"bold",cursor:"pointer",fontSize:14}}>
                    📦 View Orders
                  </button>
                  <button onClick={close} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,cursor:"pointer",fontSize:14}}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <div style={{padding:28}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                  <div>
                    <h2 style={{color:"#81c784",margin:"0 0 4px",fontSize:18}}>🛒 {selected.name}</h2>
                    <p style={{color:"rgba(255,255,255,0.5)",margin:0,fontSize:13}}>₹{selected.price}/{selected.unit} · Stock: {selected.available_quantity} {selected.unit}</p>
                  </div>
                  <button onClick={close} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:16}}>✕</button>
                </div>

                {/* Delivery Slot Preview */}
                <div style={{background:"rgba(255,167,38,0.1)",border:"1px solid rgba(255,167,38,0.25)",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:24}}>🚚</span>
                  <div>
                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>Estimated Delivery</div>
                    <div style={{color:"#ffa726",fontWeight:"bold",fontSize:14}}>{getDeliverySlot().slot}</div>
                  </div>
                </div>

                <label style={LBL}>Quantity ({selected.unit})</label>
                <input type="number" min="0.01" max={selected.available_quantity} step="0.01"
                  value={qty} onChange={e=>setQty(e.target.value)} style={INP} />

                <label style={{...LBL,marginTop:14}}>Note (Optional)</label>
                <textarea value={note} onChange={e=>setNote(e.target.value)}
                  placeholder="Any special request..." style={{...INP,minHeight:65,resize:"vertical"}} />

                <div style={{background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"14px 18px",textAlign:"center",margin:"16px 0"}}>
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:4}}>Total Amount</div>
                  <div style={{color:"#ffa726",fontSize:28,fontWeight:900}}>₹{total}</div>
                </div>

                {bookMsg && <p style={{color:"#ef5350",textAlign:"center",fontWeight:"bold",fontSize:13,marginBottom:12}}>{bookMsg}</p>}

                <button onClick={confirmBook} disabled={booking}
                  style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#1b5e20,#43a047)",color:"white",border:"none",borderRadius:12,fontWeight:"bold",cursor:"pointer",fontSize:15,boxShadow:"0 6px 20px rgba(46,125,50,0.4)",opacity:booking?0.7:1,marginBottom:8}}>
                  {booking?"⏳ Processing...":"✅ Confirm Order"}
                </button>
                <button onClick={close}
                  style={{width:"100%",padding:"11px",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,cursor:"pointer",fontSize:13}}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const NB = (color,bg) => ({padding:"8px 14px",background:bg,border:`1px solid ${color}30`,borderRadius:20,color,cursor:"pointer",fontWeight:"bold",fontSize:12,whiteSpace:"nowrap"});
const LBL = {display:"block",marginBottom:6,color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:"bold"};
const INP = {width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"white",fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit"};
