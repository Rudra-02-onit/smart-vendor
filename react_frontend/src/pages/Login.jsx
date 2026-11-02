import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Agar pehle se login hai toh redirect karo (tab specific)
  useEffect(() => {
    const stored = sessionStorage.getItem("sv_user");
    if (stored) {
      const u = JSON.parse(stored);
      if      (u.role === "admin")    navigate("/admin-dashboard");
      else if (u.role === "vendor")   navigate("/vendor-dashboard");
      else if (u.role === "customer") navigate("/customer-dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res  = await fetch("http://localhost/backend/login_api.php", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // sessionStorage = tab-specific, dusre tab mein logout nahi hoga
        sessionStorage.setItem("sv_user", JSON.stringify(data.user));
        if      (data.user.role === "customer") navigate("/customer-dashboard");
        else if (data.user.role === "vendor")   navigate("/vendor-dashboard");
        else if (data.user.role === "admin")    navigate("/admin-dashboard");
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Server connection failed. XAMPP + MongoDB chalu karo.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const d = {
      admin:    { e: "admin@smartvendor.com",  p: "Admin@123"    },
      vendor:   { e: "vendor@smartvendor.com", p: "Vendor@123"   },
      customer: { e: "customer@test.com",      p: "Customer@123" },
    };
    setEmail(d[role].e);
    setPassword(d[role].p);
  };

  return (
    <div style={S.page}>
      {/* Decorative blobs */}
      <div style={{...S.blob, width:500, height:500, top:-150, right:-150, background:"radial-gradient(circle, rgba(67,160,71,0.3), transparent 70%)"}} />
      <div style={{...S.blob, width:400, height:400, bottom:-100, left:-100, background:"radial-gradient(circle, rgba(46,125,50,0.25), transparent 70%)"}} />
      <div style={{...S.blob, width:300, height:300, top:"40%", left:"35%", background:"radial-gradient(circle, rgba(129,199,132,0.15), transparent 70%)"}} />

      <div style={S.card}>
        {/* ── LEFT BRANDING PANEL ── */}
        <div style={S.left}>
          <div style={S.vegIcon}>🥬</div>
          <h1 style={S.brand}>Smart Vendor</h1>
          <p style={S.tagline}>Fresh vegetables directly from trusted local vendors</p>

          <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:32, width:"100%"}}>
            {["🥕 Fresh daily vegetables","🛒 Easy online booking","🚚 Fast delivery","✅ Verified vendors","💰 Best prices guaranteed"].map(f=>(
              <div key={f} style={S.feat}>{f}</div>
            ))}
          </div>

          {/* Demo login buttons */}
          <div style={S.demoBox}>
            <p style={{color:"rgba(255,255,255,0.6)", fontSize:11, marginBottom:8, textTransform:"uppercase", letterSpacing:1}}>Demo Login</p>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              {[{r:"admin",label:"👑 Admin"},{r:"vendor",label:"🏪 Vendor"},{r:"customer",label:"👤 Customer"}].map(d=>(
                <button key={d.r} onClick={()=>fillDemo(d.r)} style={S.demoBtn}>{d.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div style={S.right}>
          <div style={S.formWrap}>
            <div style={{textAlign:"center", marginBottom:32}}>
              <div style={{fontSize:48, marginBottom:8}}>👋</div>
              <h2 style={{color:"#1b5e20", fontSize:28, fontWeight:900, margin:"0 0 6px"}}>Welcome Back!</h2>
              <p style={{color:"#888", fontSize:14, margin:0}}>Sign in to continue</p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={S.group}>
                <label style={S.label}>Email Address</label>
                <div style={S.iWrap}>
                  <span style={S.iIcon}>📧</span>
                  <input type="email" placeholder="yourname@email.com"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    required style={S.input} />
                </div>
              </div>

              <div style={S.group}>
                <label style={S.label}>Password</label>
                <div style={S.iWrap}>
                  <span style={S.iIcon}>🔒</span>
                  <input type={showPass?"text":"password"} placeholder="Enter your password"
                    value={password} onChange={e=>setPassword(e.target.value)}
                    required style={{...S.input, paddingRight:44}} />
                  <button type="button" onClick={()=>setShowPass(!showPass)} style={S.eyeBtn}>
                    {showPass?"🙈":"👁️"}
                  </button>
                </div>
              </div>

              {message && <div style={S.errBox}>⚠️ {message}</div>}

              <button type="submit" disabled={loading} style={S.btn}>
                {loading ? "⏳ Signing in..." : "Sign In →"}
              </button>
            </form>

            <div style={{textAlign:"center", marginTop:24}}>
              <p style={{color:"#888", fontSize:13, margin:0}}>
                New here? <Link to="/register" style={{color:"#2e7d32", fontWeight:"bold", textDecoration:"none"}}>Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
    background:"linear-gradient(135deg, #071a07 0%, #0d2e0d 30%, #1b5e20 60%, #0a1f0a 100%)",
    padding:20, position:"relative", overflow:"hidden",
  },
  blob: { position:"absolute", borderRadius:"50%", filter:"blur(60px)", pointerEvents:"none" },
  card: {
    display:"flex", width:"100%", maxWidth:920, minHeight:560,
    borderRadius:24, overflow:"hidden",
    boxShadow:"0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
    position:"relative", zIndex:1,
  },
  left: {
    flex:"0 0 380px", padding:"48px 36px",
    background:"linear-gradient(160deg, rgba(27,94,32,0.95) 0%, rgba(10,30,10,0.98) 100%)",
    display:"flex", flexDirection:"column",
    borderRight:"1px solid rgba(255,255,255,0.06)",
  },
  vegIcon: {
    fontSize:64, marginBottom:12,
    filter:"drop-shadow(0 0 20px rgba(67,160,71,0.8)) drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
    display:"block",
  },
  brand:   { color:"white", fontSize:30, fontWeight:900, margin:"0 0 8px", letterSpacing:-0.5 },
  tagline: { color:"rgba(255,255,255,0.65)", fontSize:13, marginBottom:28, lineHeight:1.6 },
  feat: {
    color:"rgba(255,255,255,0.85)", fontSize:13, padding:"8px 16px",
    background:"rgba(255,255,255,0.07)", borderRadius:25,
    border:"1px solid rgba(255,255,255,0.1)",
    backdropFilter:"blur(10px)",
  },
  demoBox: {
    marginTop:"auto", background:"rgba(0,0,0,0.3)", borderRadius:12,
    padding:"14px 16px", border:"1px solid rgba(255,255,255,0.08)",
  },
  demoBtn: {
    padding:"7px 14px", background:"rgba(255,255,255,0.12)",
    border:"1px solid rgba(255,255,255,0.2)", borderRadius:20,
    color:"white", cursor:"pointer", fontSize:12, fontWeight:"bold",
  },
  right: {
    flex:1, background:"#ffffff",
    display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 40px",
  },
  formWrap: { width:"100%", maxWidth:360 },
  group:   { marginBottom:20 },
  label:   { display:"block", marginBottom:7, fontWeight:700, color:"#333", fontSize:13 },
  iWrap:   { position:"relative", display:"flex", alignItems:"center" },
  iIcon:   { position:"absolute", left:13, fontSize:16, pointerEvents:"none", zIndex:1 },
  input: {
    width:"100%", padding:"13px 14px 13px 44px",
    border:"2px solid #e8f5e9", borderRadius:12, fontSize:15,
    boxSizing:"border-box", outline:"none",
    background:"#f9fff9", color:"#1b5e20", fontFamily:"inherit",
  },
  eyeBtn: {
    position:"absolute", right:10, background:"none",
    border:"none", cursor:"pointer", fontSize:18, padding:4,
  },
  errBox: {
    background:"#fff3f3", color:"#c62828", padding:"12px 16px",
    borderRadius:10, marginBottom:16, fontSize:13, fontWeight:"bold",
    border:"1px solid #ffcdd2", width:"100%", boxSizing:"border-box",
  },
  btn: {
    width:"100%", padding:"14px",
    background:"linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)",
    color:"white", border:"none", borderRadius:12, fontSize:16,
    fontWeight:"bold", cursor:"pointer", marginTop:4,
    boxShadow:"0 8px 25px rgba(46,125,50,0.45)",
  },
};
