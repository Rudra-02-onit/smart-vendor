import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage]   = useState("Loading bookings...");
  const navigate                = useNavigate();

  useEffect(() => {
    fetch("http://localhost/smart_vendor/backend/customer/my_bookings_api.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
          setMessage("");
        } else {
          if (data.message?.toLowerCase().includes("login")) {
            navigate("/login");
          } else {
            setMessage(data.message);
          }
        }
      })
      .catch(() => setMessage("Unable to load bookings. Check server connection."));
  }, [navigate]);

  const statusColor = (s) => ({ pending: "#856404", accepted: "#2e7d32", rejected: "#c62828", cancelled: "#616161", completed: "#1565c0" }[s] || "#555");
  const statusBg    = (s) => ({ pending: "#fff3cd", accepted: "#e8f5e9", rejected: "#ffebee", cancelled: "#eeeeee", completed: "#e3f2fd" }[s] || "#eeeeee");
  const statusText  = (s) => s === "completed" ? "Delivered" : s;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f8e9", padding: "40px 20px" }}>
      <div style={{ maxWidth: "850px", margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <h1 style={{ color: "#2e7d32", margin: 0 }}>🛒 My Bookings</h1>
          <button
            onClick={() => navigate("/customer-dashboard")}
            style={{ padding: "9px 16px", background: "#2e7d32", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
          >
            ← Dashboard
          </button>
        </div>

        {message && (
          <p style={{ textAlign: "center", color: "#555", fontSize: "18px" }}>{message}</p>
        )}

        {bookings.length === 0 && !message && (
          <div style={{ backgroundColor: "white", padding: "50px", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
            <h2>📭 No Bookings Found</h2>
            <p style={{ marginTop: "10px", color: "#777" }}>You have not booked any vegetables yet.</p>
            <button
              onClick={() => navigate("/vegetables")}
              style={{ marginTop: "16px", padding: "11px 22px", background: "#2e7d32", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
            >
              Browse Vegetables
            </button>
          </div>
        )}

        {bookings.map((booking) => {
          const status = String(booking.status).toLowerCase().trim();
          return (
            <div key={booking.booking_id} style={{ backgroundColor: "white", padding: "24px", marginBottom: "18px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", border: "1px solid #ddd" }}>
              <h2 style={{ color: "#2e7d32", marginBottom: "14px" }}>🥬 {booking.vegetable_name}</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <p style={{ margin: 0, color: "#555" }}>👨‍🌾 <strong>Vendor:</strong> {booking.vendor_name}</p>
                <p style={{ margin: 0, color: "#555" }}>📦 <strong>Qty:</strong> {booking.quantity} {booking.unit}</p>
                <p style={{ margin: 0, color: "#555" }}>💰 <strong>Price:</strong> ₹{Number(booking.price).toFixed(2)} / {booking.unit}</p>
                <p style={{ margin: 0, color: "#555" }}>📅 <strong>Date:</strong> {booking.created_at}</p>
              </div>

              <p style={{ fontSize: "20px", fontWeight: "bold", color: "#2e7d32", margin: "12px 0" }}>
                Total: ₹{Number(booking.total_amount).toFixed(2)}
              </p>

              <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: "20px", fontWeight: "bold", textTransform: "capitalize", color: statusColor(status), backgroundColor: statusBg(status) }}>
                {statusText(status)}
              </span>

              {status === "pending" && (
                <div style={{ marginTop: "14px", padding: "11px", backgroundColor: "#fff3cd", color: "#856404", borderRadius: "7px", fontWeight: "bold" }}>
                  ⏳ Waiting for vendor approval.
                </div>
              )}
              {status === "accepted" && (
                <div style={{ marginTop: "14px", padding: "11px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "7px", fontWeight: "bold" }}>
                  ✅ Booking Accepted — Vendor is preparing your order.
                </div>
              )}
              {status === "completed" && (
                <div style={{ marginTop: "14px", padding: "11px", backgroundColor: "#e3f2fd", color: "#1565c0", borderRadius: "7px", fontWeight: "bold" }}>
                  🚚 Order Delivered Successfully!
                </div>
              )}
              {status === "rejected" && (
                <div style={{ marginTop: "14px", padding: "11px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "7px", fontWeight: "bold" }}>
                  ❌ This booking was rejected by the vendor.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyBookings;
