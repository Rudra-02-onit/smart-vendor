import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "80px", marginBottom: "16px" }}>🥬</div>
      <h1 style={{ color: "#2e7d32", fontSize: "42px", margin: "0 0 12px" }}>Smart Vendor</h1>
      <p style={{ color: "#555", fontSize: "18px", maxWidth: "480px", lineHeight: "1.6", marginBottom: "36px" }}>
        Buy fresh vegetables directly from trusted local vendors. Best prices, best quality.
      </p>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/login")}
          style={{ padding: "14px 32px", background: "#2e7d32", color: "white", border: "none", borderRadius: "10px", fontSize: "17px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 14px rgba(46,125,50,0.4)" }}
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          style={{ padding: "14px 32px", background: "white", color: "#2e7d32", border: "2px solid #2e7d32", borderRadius: "10px", fontSize: "17px", fontWeight: "bold", cursor: "pointer" }}
        >
          Register
        </button>
      </div>

      <div style={{ marginTop: "60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", maxWidth: "700px", width: "100%" }}>
        {[
          { icon: "🥕", title: "Fresh Vegetables", desc: "Daily fresh from local farmers" },
          { icon: "🛒", title: "Easy Booking",     desc: "Book online in seconds" },
          { icon: "🚚", title: "Fast Delivery",    desc: "Get your order delivered fast" },
        ].map((item) => (
          <div key={item.title} style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>{item.icon}</div>
            <h3 style={{ color: "#2e7d32", margin: "0 0 6px" }}>{item.title}</h3>
            <p style={{ color: "#777", fontSize: "14px", margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
