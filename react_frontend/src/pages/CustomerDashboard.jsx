import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost/smart_vendor/backend/logout_api.php", {
        method:      "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f8e9", padding: "40px 20px" }}>
      <div style={{ maxWidth: "700px", margin: "auto", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "12px" }}>🥬</div>
        <h1 style={{ color: "#2e7d32", marginBottom: "8px" }}>Customer Dashboard</h1>
        <p style={{ color: "#666", marginBottom: "36px", fontSize: "16px" }}>Welcome to Smart Vendor!</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px", marginBottom: "30px" }}>
          {[
            { label: "🥕 Browse Vegetables", path: "/vegetables",  bg: "#2e7d32" },
            { label: "📦 My Bookings",        path: "/my-bookings", bg: "#1565c0" },
            { label: "👤 My Profile",         path: "/profile",     bg: "#6a1b9a" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{ padding: "20px", background: item.bg, color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{ padding: "12px 28px", background: "#e53935", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default CustomerDashboard;
