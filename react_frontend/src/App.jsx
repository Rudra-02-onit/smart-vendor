import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

import Home              from "./pages/Home";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import VendorDashboard   from "./pages/VendorDashboard";
import AdminDashboard    from "./pages/AdminDashboard";
import Vegetables        from "./pages/Vegetables";
import MyBookings        from "./pages/MyBookings";

// Navbar sirf public pages pe dikhega
function Navbar() {
  const location = useLocation();
  const hiddenPaths = ["/customer-dashboard", "/vendor-dashboard", "/admin-dashboard", "/vegetables", "/my-bookings"];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <nav style={{ padding: "14px 28px", background: "#2e7d32", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Link to="/" style={{ color: "white", fontWeight: "bold", fontSize: 20, textDecoration: "none" }}>
        🥬 Smart Vendor
      </Link>
      <div style={{ display: "flex", gap: 18 }}>
        <Link to="/login"    style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
        <Link to="/register" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Register</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Home />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/vegetables"         element={<Vegetables />} />
        <Route path="/my-bookings"        element={<MyBookings />} />

        {/* Vendor */}
        <Route path="/vendor-dashboard"   element={<VendorDashboard />} />

        {/* Admin */}
        <Route path="/admin-dashboard"    element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
