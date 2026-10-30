import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:                "",
    email:               "",
    phone:               "",
    address:             "",
    password:            "",
    confirm_password:    "",
    role:                "customer",
    id_proof_number:     "",
    tax_number:          "",
    bank_name:           "",
    account_holder_name: "",
    account_number:      "",
    ifsc_code:           "",
  });

  const [idProofDoc, setIdProofDoc] = useState(null);
  const [taxDoc, setTaxDoc]         = useState(null);
  const [message, setMessage]       = useState("");
  const [msgType, setMsgType]       = useState("error");
  const [loading, setLoading]       = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));

    if (form.role === "vendor") {
      if (!idProofDoc) {
        setMessage("Please upload ID proof document.");
        setMsgType("error");
        setLoading(false);
        return;
      }
      if (!taxDoc) {
        setMessage("Please upload tax document.");
        setMsgType("error");
        setLoading(false);
        return;
      }
      formData.append("id_proof_document", idProofDoc);
      formData.append("tax_document", taxDoc);
    }

    try {
      const res  = await fetch(
        "http://localhost/smart_vendor/backend/register.php",
        { method: "POST", body: formData }
      );
      const data = await res.json();

      setMsgType(data.success ? "success" : "error");
      setMessage(data.message);

      if (data.success && form.role === "customer") {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setMsgType("error");
      setMessage("Server connection failed. Please make sure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  const isVendor = form.role === "vendor";

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🥬</div>
        <h1 style={styles.title}>Smart Vendor</h1>
        <p style={styles.subtitle}>Create your account</p>

        {message && (
          <div style={msgType === "success" ? styles.successBox : styles.errorBox}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Basic fields */}
          {[
            { name: "name",    label: "Full Name",       type: "text",     placeholder: "Enter your full name" },
            { name: "email",   label: "Email",           type: "email",    placeholder: "Enter your email" },
            { name: "phone",   label: "Phone Number",    type: "text",     placeholder: "Enter phone number" },
          ].map((f) => (
            <div key={f.name} style={styles.formGroup}>
              <label style={styles.label}>{f.label} *</label>
              <input
                type={f.type}
                name={f.name}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          ))}

          <div style={styles.formGroup}>
            <label style={styles.label}>Address *</label>
            <textarea
              name="address"
              placeholder="Enter your address"
              value={form.address}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Account Type *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          {/* Vendor-only fields */}
          {isVendor && (
            <>
              <div style={styles.sectionHeader}>📄 Vendor Documents</div>

              {[
                { name: "id_proof_number", label: "ID Proof Number", placeholder: "Enter ID proof number" },
                { name: "tax_number",      label: "Tax Number",      placeholder: "Enter tax number" },
              ].map((f) => (
                <div key={f.name} style={styles.formGroup}>
                  <label style={styles.label}>{f.label} *</label>
                  <input
                    type="text"
                    name={f.name}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={isVendor}
                    style={styles.input}
                  />
                </div>
              ))}

              <div style={styles.formGroup}>
                <label style={styles.label}>ID Proof Document *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setIdProofDoc(e.target.files[0])}
                  required={isVendor}
                  style={styles.input}
                />
                <small style={styles.note}>PDF, JPG, PNG or WEBP</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tax Document *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setTaxDoc(e.target.files[0])}
                  required={isVendor}
                  style={styles.input}
                />
                <small style={styles.note}>PDF, JPG, PNG or WEBP</small>
              </div>

              <div style={styles.sectionHeader}>🏦 Bank Details</div>

              {[
                { name: "bank_name",            label: "Bank Name",            placeholder: "Enter bank name" },
                { name: "account_holder_name",  label: "Account Holder Name",  placeholder: "Enter account holder name" },
                { name: "account_number",       label: "Account Number",       placeholder: "Enter account number" },
                { name: "ifsc_code",            label: "IFSC Code",            placeholder: "Enter IFSC code" },
              ].map((f) => (
                <div key={f.name} style={styles.formGroup}>
                  <label style={styles.label}>{f.label} *</label>
                  <input
                    type="text"
                    name={f.name}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={isVendor}
                    style={styles.input}
                  />
                </div>
              ))}
            </>
          )}

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm password"
              value={form.confirm_password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight:      "100vh",
    background:     "linear-gradient(135deg, #e8f5e9, #f1f8e9)",
    display:        "flex",
    justifyContent: "center",
    alignItems:     "flex-start",
    padding:        "30px 20px",
  },
  card: {
    width:        "100%",
    maxWidth:     "560px",
    background:   "white",
    borderRadius: "16px",
    padding:      "40px",
    boxShadow:    "0 8px 30px rgba(0,0,0,0.12)",
    textAlign:    "center",
  },
  logo:      { fontSize: "52px", marginBottom: "8px" },
  title:     { color: "#2e7d32", margin: "0 0 6px", fontSize: "28px" },
  subtitle:  { color: "#777", marginBottom: "24px", fontSize: "15px" },
  formGroup: { marginBottom: "16px", textAlign: "left" },
  label:     { display: "block", marginBottom: "6px", fontWeight: "bold", color: "#444", fontSize: "14px" },
  input: {
    width:        "100%",
    padding:      "11px 14px",
    border:       "1px solid #ddd",
    borderRadius: "8px",
    fontSize:     "14px",
    boxSizing:    "border-box",
  },
  textarea: {
    width:        "100%",
    padding:      "11px 14px",
    border:       "1px solid #ddd",
    borderRadius: "8px",
    fontSize:     "14px",
    boxSizing:    "border-box",
    minHeight:    "80px",
    resize:       "vertical",
  },
  note:          { color: "#888", fontSize: "12px", marginTop: "4px", display: "block" },
  sectionHeader: {
    background:   "#e8f5e9",
    color:        "#2e7d32",
    padding:      "10px 14px",
    borderRadius: "8px",
    fontWeight:   "bold",
    marginBottom: "16px",
    marginTop:    "8px",
    textAlign:    "left",
    fontSize:     "15px",
  },
  successBox: {
    background:   "#dff5e1",
    color:        "#1b5e20",
    padding:      "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight:   "bold",
    fontSize:     "14px",
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
    marginTop:    "8px",
  },
  loginLink: { marginTop: "20px", color: "#666", fontSize: "14px" },
  link:      { color: "#2e7d32", fontWeight: "bold", textDecoration: "none" },
};

export default Register;
