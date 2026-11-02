import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(sessionStorage.getItem("sv_user") || "{}");

  const handleLogout = async () => {
    await fetch("http://localhost/backend/logout_api.php", { method:"POST", credentials:"include" });
    sessionStorage.removeItem("sv_user");
    navigate("/login");
  };

  const cards = [
    { icon:"🥕", title:"Browse Vegetables", desc:"Fresh veggies from local vendors", grad:"linear-gradient(135deg,#1b5e20,#43a047)", shadow:"rgba(46,125,50,0.5)",  path:"/vegetables"  },
    { icon:"📦", title:"My Bookings",        desc:"Track orders & history",          grad:"linear-gradient(135deg,#1565c0,#42a5f5)", shadow:"rgba(21,101,192,0.5)", path:"/my-bookings" },
    { icon:"👤", title:"My Profile",         desc:"View & update your profile",      grad:"linear-gradient(135deg,#6a1b9a,#ab47bc)", shadow:"rgba(106,27,154,0.5)", path:null           },
  ];

  return (
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#0a0a0f 0%,#0d1f0d 40%,#0a0f1a 100%)"}}>

      {/* NAVBAR */}
      <nav style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"0 28px",display:"flex",justifyContent:"space-between",alignItems:"center",height:64}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:32,filter:"drop-shadow(0 0 12px rgba(67,160,71,0.8))"}}>🥬</span>
          <div>
            <div style={{color:"white",fontWeight:900,fontSize:18,lineHeight:1}}>Smart Vendor</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>Customer Portal</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{background:"rgba(21,101,192,0.2)",border:"1px solid rgba(21,101,192,0.4)",borderRadius:25,padding:"6px 16px",color:"#90caf9",fontSize:13,fontWeight:"bold"}}>
            👤 {user.name || "Customer"}
          </div>
          <button onClick={handleLogout} style={{padding:"8px 18px",background:"rgba(198,40,40,0.2)",border:"1px solid rgba(198,40,40,0.4)",borderRadius:20,color:"#ef9a9a",cursor:"pointer",fontWeight:"bold",fontSize:13}}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"40px 24px"}}>

        {/* Welcome Banner */}
        <div style={{background:"linear-gradient(135deg,rgba(27,94,32,0.4),rgba(21,101,192,0.2))",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"32px 36px",marginBottom:36,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-20,top:-20,fontSize:140,opacity:0.06}}>🥬</div>
          <h1 style={{color:"white",fontSize:28,fontWeight:900,margin:"0 0 8px"}}>
            Welcome back, {user.name?.split(" ")[0] || "Friend"}! 👋
          </h1>
          <p style={{color:"rgba(255,255,255,0.6)",margin:"0 0 20px",fontSize:15}}>
            What would you like to do today?
          </p>
          <button onClick={()=>navigate("/vegetables")}
            style={{padding:"12px 28px",background:"linear-gradient(135deg,#2e7d32,#43a047)",color:"white",border:"none",borderRadius:25,fontWeight:"bold",cursor:"pointer",fontSize:14,boxShadow:"0 6px 20px rgba(46,125,50,0.5)"}}>
            🛒 Shop Now →
          </button>
        </div>

        {/* Action Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:36}}>
          {cards.map(c=>(
            <div key={c.title}
              onClick={()=>c.path ? navigate(c.path) : alert(`Name: ${user.name}\nEmail: ${user.email}`)}
              style={{background:c.grad,borderRadius:20,padding:"28px 24px",cursor:"pointer",boxShadow:`0 12px 35px ${c.shadow}`,position:"relative",overflow:"hidden",transition:"transform 0.2s"}}>
              <div style={{position:"absolute",right:-10,top:-10,fontSize:90,opacity:0.12}}>{c.icon}</div>
              <div style={{fontSize:44,marginBottom:14,filter:`drop-shadow(0 4px 12px rgba(0,0,0,0.3))`}}>{c.icon}</div>
              <h3 style={{color:"white",fontSize:18,fontWeight:900,margin:"0 0 6px"}}>{c.title}</h3>
              <p style={{color:"rgba(255,255,255,0.75)",fontSize:13,margin:"0 0 16px"}}>{c.desc}</p>
              <div style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:"bold"}}>Open →</div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px 28px"}}>
          <h3 style={{color:"#81c784",marginBottom:16,fontSize:16}}>ℹ️ How to order?</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
            {[
              {n:"1",icon:"🛒",t:"Browse",d:"Explore fresh vegetables"},
              {n:"2",icon:"📝",t:"Select",d:"Choose quantity & vendor"},
              {n:"3",icon:"✅",t:"Confirm",d:"Place your booking"},
              {n:"4",icon:"🚚",t:"Receive",d:"Get delivery at home"},
            ].map(s=>(
              <div key={s.n} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 14px",textAlign:"center"}}>
                <div style={{width:28,height:28,background:"rgba(46,125,50,0.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",color:"#81c784",fontWeight:900,fontSize:13}}>{s.n}</div>
                <div style={{fontSize:26,marginBottom:6}}>{s.icon}</div>
                <div style={{color:"white",fontWeight:"bold",fontSize:13}}>{s.t}</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:3}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
