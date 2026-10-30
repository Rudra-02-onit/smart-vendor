import { useEffect, useState } from "react";

function Vegetables() {
  const [vegetables, setVegetables]           = useState([]);
  const [message, setMessage]                 = useState("Loading vegetables...");
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [quantity, setQuantity]               = useState(1);
  const [customerNote, setCustomerNote]       = useState("");
  const [bookingMessage, setBookingMessage]   = useState("");
  const [bookingLoading, setBookingLoading]   = useState(false);

  useEffect(() => {
    fetch(
      "http://localhost/smart_vendor/backend/customer/vegetables_api.php",
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVegetables(data.vegetables);
          setMessage(data.vegetables.length === 0 ? "No vegetables available right now." : "");
        } else {
          setMessage(data.message || "Unable to load vegetables.");
        }
      })
      .catch(() => setMessage("Unable to load vegetables. Check server connection."));
  }, []);

  const openBooking = (veg) => {
    setSelectedVegetable(veg);
    setQuantity(1);
    setCustomerNote("");
    setBookingMessage("");
  };

  const closeBooking = () => {
    setSelectedVegetable(null);
    setBookingMessage("");
  };

  const totalAmount = selectedVegetable
    ? (Number(quantity) * Number(selectedVegetable.price)).toFixed(2)
    : "0.00";

  const confirmBooking = async () => {
    if (!quantity || Number(quantity) <= 0) {
      setBookingMessage("Please enter a valid quantity.");
      return;
    }
    if (Number(quantity) > Number(selectedVegetable.available_quantity)) {
      setBookingMessage(`Only ${selectedVegetable.available_quantity} ${selectedVegetable.unit} is available.`);
      return;
    }

    setBookingLoading(true);
    const formData = new FormData();
    formData.append("vegetable_id",  selectedVegetable.id);
    formData.append("quantity",      quantity);
    formData.append("customer_note", customerNote);

    try {
      const res  = await fetch(
        "http://localhost/smart_vendor/backend/customer/book_api.php",
        { method: "POST", credentials: "include", body: formData }
      );
      const data = await res.json();

      if (data.success) {
        alert(`✅ Booking successful!\nBooking ID: ${data.booking_id}\nTotal: ₹${Number(data.total_amount).toFixed(2)}`);
        closeBooking();
        // Refresh vegetable list
        const r = await fetch("http://localhost/smart_vendor/backend/customer/vegetables_api.php", { credentials: "include" });
        const d = await r.json();
        if (d.success) setVegetables(d.vegetables);
      } else {
        setBookingMessage(data.message || "Booking failed.");
      }
    } catch {
      setBookingMessage("Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", backgroundColor: "#f1f8e9" }}>
      <h1 style={{ textAlign: "center", color: "#2e7d32", marginBottom: "30px" }}>
        🥕 Fresh Vegetables
      </h1>

      {message && (
        <p style={{ textAlign: "center", color: "#555", fontSize: "18px" }}>{message}</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", maxWidth: "1200px", margin: "auto" }}>
        {vegetables.map((veg) => (
          <div key={veg.id} style={{ backgroundColor: "white", borderRadius: "15px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "1px solid #c8e6c9" }}>
            {veg.image ? (
              <img
                src={veg.image}
                alt={veg.name}
                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", marginBottom: "15px" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div style={{ width: "100%", height: "140px", background: "#e8f5e9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", marginBottom: "15px" }}>🥬</div>
            )}

            <h2 style={{ color: "#2e7d32", marginBottom: "10px" }}>{veg.name}</h2>
            <p><strong>Price:</strong> <span style={{ color: "#e65100", fontWeight: "bold" }}>₹{veg.price}</span> / {veg.unit}</p>
            <p><strong>Available:</strong> <span style={{ color: "#388e3c" }}>{veg.available_quantity} {veg.unit}</span></p>
            {veg.description && <p style={{ color: "#555", margin: "8px 0" }}>{veg.description}</p>}
            <p><strong>Vendor:</strong> <span style={{ color: "#1565c0" }}>{veg.vendor_name}</span></p>

            <button
              onClick={() => openBooking(veg)}
              style={{ width: "100%", padding: "12px", marginTop: "12px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
            >
              🛒 Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedVegetable && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", width: "100%", maxWidth: "480px", padding: "30px", borderRadius: "15px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#2e7d32", marginBottom: "8px" }}>🛒 Book {selectedVegetable.name}</h2>
            <p style={{ color: "#555", marginBottom: "20px" }}>₹{selectedVegetable.price} / {selectedVegetable.unit} · Available: {selectedVegetable.available_quantity} {selectedVegetable.unit}</p>

            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Quantity ({selectedVegetable.unit})</label>
            <input
              type="number"
              min="0.01"
              max={selectedVegetable.available_quantity}
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ width: "100%", padding: "11px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "16px", boxSizing: "border-box" }}
            />

            <label style={{ display: "block", margin: "18px 0 6px", fontWeight: "bold" }}>Customer Note (Optional)</label>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Example: Please keep fresh tomatoes."
              style={{ width: "100%", minHeight: "75px", padding: "11px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "15px", resize: "vertical", boxSizing: "border-box" }}
            />

            <div style={{ margin: "18px 0", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "8px", textAlign: "center" }}>
              <strong>Total Amount</strong>
              <div style={{ color: "#2e7d32", fontSize: "28px", fontWeight: "bold" }}>₹{totalAmount}</div>
            </div>

            {bookingMessage && (
              <p style={{ color: "#c62828", textAlign: "center", fontWeight: "bold", marginBottom: "12px" }}>{bookingMessage}</p>
            )}

            <button
              onClick={confirmBooking}
              disabled={bookingLoading}
              style={{ width: "100%", padding: "13px", backgroundColor: "#43a047", color: "white", border: "none", borderRadius: "8px", fontSize: "17px", fontWeight: "bold", cursor: "pointer", opacity: bookingLoading ? 0.7 : 1 }}
            >
              {bookingLoading ? "Processing..." : "✅ Confirm Booking"}
            </button>

            <button
              onClick={closeBooking}
              style={{ width: "100%", marginTop: "10px", padding: "12px", backgroundColor: "#757575", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vegetables;
