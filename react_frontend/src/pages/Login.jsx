import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost/smart_vendor/backend/login_api.php",
        {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.user.role === "customer") {
          navigate("/customer-dashboard");
        } else if (data.user.role === "vendor") {
          navigate("/vendor-dashboard");
        } else if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        }
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Server connection failed. Please make sure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🥬</div>
        <h1 style={styles.title}>Smart Vendor</h1>
        <p style={styles.subtitle}>Login to your account</p>

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {message && (
            <div style={styles.errorBox}>{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.registerLink}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight:       "100vh",
    background:      "linear-gradient(135deg, #e8f5e9, #f1f8e9)",
    display:         "flex",
    justifyContent:  "center",
    alignItems:      "center",
    padding:         "20px",
  },
  card: {
    width:           "100%",
    maxWidth:        "440px",
    background:      "white",
    borderRadius:    "16px",
    padding:         "40px",
    boxShadow:       "0 8px 30px rgba(0,0,0,0.12)",
    textAlign:       "center",
  },
  logo:       { fontSize: "52px", marginBottom: "8px" },
  title:      { color: "#2e7d32", margin: "0 0 6px", fontSize: "28px" },
  subtitle:   { color: "#777", marginBottom: "28px", fontSize: "15px" },
  formGroup:  { marginBottom: "18px", textAlign: "left" },
  label:      { display: "block", marginBottom: "6px", fontWeight: "bold", color: "#444", fontSize: "14px" },
  input: {
    width:        "100%",
    padding:      "12px 14px",
    border:       "1px solid #ddd",
    borderRadius: "8px",
    fontSize:     "15px",
    boxSizing:    "border-box",
    outline:      "none",
  },
  errorBox: {
    background:   "#ffebee",
    color:        "#c62828",
    padding:      "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight:   "bold",
    fontSize:     "14px",
  },
  btn: {
    width:        "100%",
    padding:      "13px",
    background:   "#2e7d32",
    color:        "white",
    border:       "none",
    borderRadius: "8px",
    fontSize:     "16px",
    fontWeight:   "bold",
    cursor:       "pointer",
    marginTop:    "4px",
  },
  registerLink: { marginTop: "20px", color: "#666", fontSize: "14px" },
  link:         { color: "#2e7d32", fontWeight: "bold", textDecoration: "none" },
};

export default Login;
