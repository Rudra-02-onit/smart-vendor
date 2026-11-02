import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [message,  setMessage]  = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/backend/customer/my_bookings_api.php", { credentials:"include" })
      .then(r=>r.json())
      .then(d=>{
        if (d.success) { setBookings(d.bookings); setMessage(""); }
        else { if (d.message?.toLowerCase().includes("login")) navigate("/login"); else setMessage(d.message); }
      })
      .catch(()=>setMessage("Connection failed."));
  }, [navigate]);

  const sc = {pending:"#ffa726",accepted:"#42a5f5",rejected:"#ef5350",cancelled:"#bdbdbd",completed:"#66bb6a"};
  const sb = {pending:"rgba(255,167,38,0.1)",accepted:"rgba(66,165,245,0.1)",rejected:"rgba(239,83,80,0.1)",cancelled:"rgba(189,189,189,0.1)",completed:"rgba(102,187,106,0.1)"};
  const st = (s) => s==="completed"?"Delivered":s;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0a0f 0%,#0d1f0d 40%,#0a0f1a 100%)"}}>
      <nav style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"0 28px",display:"flex",justifyContent:"space-between",alignItems:"center",height:64}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:28}}>🥬</span>
          <span style={{color:"white",fontWeight:900,fontSize:18}}>My Bookings</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>navigate("/vegetables")} style={navBtn("#81c784","rgba(46,125,50,0.3)")}>🛒 Shop</button>
          <button onClick={()=>navigate("/customer-dashboard")} style={navBtn("#90caf9","rgba(21,101,192,0.3)")}>← Dashboard</button>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 20px"}}>
        {message && <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:16,marginTop:40}}>{message}</p>}

        {!message && bookings.length===0 && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:60,textAlign:"center"}}>
            <div style={{fontSize:64,marginBottom:16}}>📭</div>
            <h2 style={{color:"white",marginBottom:10}}>No Bookings Yet</h2>
            <p style={{color:"rgba(255,255,255,0.5)",marginBottom:24}}>Start by browsing fresh vegetables</p>
            <button onClick={()=>navigate("/vegetables")} style={{padding:"12px 28px",background:"linear-gradient(135deg,#2e7d32,#43a047)",color:"white",border:"none",borderRadius:25,fontWeight:"bold",cursor:"pointer",fontSize:14}}>
              Browse Vegetables →
            </button>
          </div>
        )}

        {bookings.map(b=>{
          const s = b.status?.toLowerCase();
          return (
            <div key={b.booking_id} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${(sc[s]||"#bdbdbd")}30`,borderRadius:18,padding:"24px 26px",marginBottom:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:-10,top:-10,fontSize:80,opacity:0.04}}>🥬</div>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                <div style={{flex:1}}>
                  <h3 style={{color:"#81c784",margin:"0 0 12px",fontSize:18,fontWeight:900}}>🥬 {b.vegetable_name}</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"}}>
                    {[
                      {l:"👨‍🌾 Vendor",   v:b.vendor_name},
                      {l:"📦 Quantity", v:`${b.quantity} ${b.unit}`},
                      {l:"💰 Price",    v:`₹${Number(b.price).toFixed(2)}/${b.unit}`},
                      {l:"📅 Date",     v:b.created_at?.slice(0,10)},
                    ].map(x=>(
                      <p key={x.l} style={{margin:0,color:"rgba(255,255,255,0.6)",fontSize:13}}>
                        <span style={{color:"rgba(255,255,255,0.4)"}}>{x.l}: </span>{x.v}
                      </p>
                    ))}
                  </div>

                  {/* Delivery Slot */}
                  {b.delivery_slot && (
                    <div style={{marginTop:10,background:"rgba(255,167,38,0.1)",border:"1px solid rgba(255,167,38,0.25)",borderRadius:8,padding:"8px 14px",display:"inline-flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>🚚</span>
                      <div>
                        <div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>Delivery Slot</div>
                        <div style={{color:"#ffa726",fontWeight:"bold",fontSize:13}}>{b.delivery_slot}</div>
                      </div>
                    </div>
                  )}

                  <p style={{color:"#ffa726",fontWeight:900,fontSize:20,margin:"14px 0 0"}}>
                    Total: ₹{Number(b.total_amount).toFixed(2)}
                  </p>
                </div>

                <div style={{textAlign:"right"}}>
                  <span style={{display:"inline-block",padding:"8px 18px",borderRadius:25,fontWeight:"bold",fontSize:13,background:sb[s]||"rgba(189,189,189,0.1)",color:sc[s]||"#bdbdbd",border:`1px solid ${(sc[s]||"#bdbdbd")}40`,textTransform:"capitalize"}}>
                    {st(s)}
                  </span>
                </div>
              </div>

              {/* Status message */}
              <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:`${(sc[s]||"#bdbdbd")}10`,border:`1px solid ${(sc[s]||"#bdbdbd")}20`,color:sc[s]||"#bdbdbd",fontSize:13,fontWeight:"bold"}}>
                {s==="pending"   && "⏳ Waiting for vendor approval"}
                {s==="accepted"  && "✅ Booking accepted — vendor is preparing your order"}
                {s==="completed" && "🚚 Order delivered successfully!"}
                {s==="rejected"  && "❌ This booking was rejected by the vendor"}
                {s==="cancelled" && "🚫 This booking was cancelled"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const navBtn = (color, bg) => ({
  padding:"8px 18px", background:bg, border:`1px solid ${color}40`,
  borderRadius:20, color, cursor:"pointer", fontWeight:"bold", fontSize:13,
});
