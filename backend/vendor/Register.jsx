import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    password: "",
    confirm_password: "",
    id_proof_number: "",
    tax_number: "",
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
  });

  const [idProofDocument, setIdProofDocument] = useState(null);
  const [taxDocument, setTaxDocument] = useState(null);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;

    setRole(value);

    setFormData((prev) => ({
      ...prev,
      role: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (formData.password !== formData.confirm_password) {
      setMessage("Passwords do not match.");
      return;
    }

    if (role === "vendor") {
      if (!idProofDocument || !taxDocument) {
        setMessage(
          "Please upload both ID proof and tax document."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("role", formData.role);
      data.append("password", formData.password);
      data.append(
        "confirm_password",
        formData.confirm_password
      );

      if (role === "vendor") {
        data.append(
          "id_proof_number",
          formData.id_proof_number
        );

        data.append(
          "tax_number",
          formData.tax_number
        );

        data.append(
          "bank_name",
          formData.bank_name
        );

        data.append(
          "account_holder_name",
          formData.account_holder_name
        );

        data.append(
          "account_number",
          formData.account_number
        );

        data.append(
          "ifsc_code",
          formData.ifsc_code
        );

        data.append(
          "id_proof_document",
          idProofDocument
        );

        data.append(
          "tax_document",
          taxDocument
        );
      }

      const response = await fetch(
        "http://localhost/smart_vendor/register.php",
        {
          method: "POST",
          body: data,
        }
      );

      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(
        html,
        "text/html"
      );

      const messageElement =
        doc.querySelector(".message");

      if (messageElement) {
        const text =
          messageElement.textContent.trim();

        setMessage(text);

        if (
          messageElement.classList.contains("success")
        ) {
          setSuccess(true);

          setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            role: "",
            password: "",
            confirm_password: "",
            id_proof_number: "",
            tax_number: "",
            bank_name: "",
            account_holder_name: "",
            account_number: "",
            ifsc_code: "",
          });

          setRole("");
          setIdProofDocument(null);
          setTaxDocument(null);
        }
      } else {
        setMessage(
          "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration Error:", error);

      setMessage(
        "Server connection failed."
      );
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        <h1 style={styles.title}>
          🥬 Smart Vendor Registration
        </h1>

        <p style={styles.subtitle}>
          Create your account
        </p>

        {message && (
          <div
            style={
              success
                ? styles.success
                : styles.error
            }
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label style={styles.label}>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>
            Phone Number
          </label>

          <input
            type="text"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>
            Address / Location
          </label>

          <textarea
            name="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleChange}
            required
            style={styles.textarea}
          ></textarea>

          <label style={styles.label}>
            Account Type
          </label>

          <select
            value={role}
            onChange={handleRoleChange}
            required
            style={styles.input}
          >
            <option value="">
              Select Account Type
            </option>

            <option value="customer">
              Customer
            </option>

            <option value="vendor">
              Vendor
            </option>
          </select>

          {/* VENDOR SECTION */}

          {role === "vendor" && (
            <div style={styles.vendorSection}>

              <h2 style={styles.sectionTitle}>
                📄 Vendor Documents
              </h2>

              <label style={styles.label}>
                ID Proof Number
              </label>

              <input
                type="text"
                name="id_proof_number"
                placeholder="Enter ID proof number"
                value={
                  formData.id_proof_number
                }
                onChange={handleChange}
                required
                style={styles.input}
              />

              <label style={styles.label}>
                ID Proof Document
              </label>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) =>
                  setIdProofDocument(
                    e.target.files[0]
                  )
                }
                required
                style={styles.fileInput}
              />

              <label style={styles.label}>
                Tax Number
              </label>

              <input
                type="text"
                name="tax_number"
                placeholder="Enter tax number"
                value={formData.tax_number}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <label style={styles.label}>
                Tax Document
              </label>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) =>
                  setTaxDocument(
                    e.target.files[0]
                  )
                }
                required
                style={styles.fileInput}
              />

              <h2 style={styles.sectionTitle}>
                🏦 Bank Details
              </h2>

              <label style={styles.label}>
                Bank Name
              </label>

              <input
                type="text"
                name="bank_name"
                placeholder="Enter bank name"
                value={formData.bank_name}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <label style={styles.label}>
                Account Holder Name
              </label>

              <input
                type="text"
                name="account_holder_name"
                placeholder="Enter account holder name"
                value={
                  formData.account_holder_name
                }
                onChange={handleChange}
                required
                style={styles.input}
              />

              <label style={styles.label}>
                Account Number
              </label>

              <input
                type="text"
                name="account_number"
                placeholder="Enter account number"
                value={
                  formData.account_number
                }
                onChange={handleChange}
                required
                style={styles.input}
              />

              <label style={styles.label}>
                IFSC Code
              </label>

              <input
                type="text"
                name="ifsc_code"
                placeholder="Enter IFSC code"
                value={formData.ifsc_code}
                onChange={handleChange}
                required
                style={styles.input}
              />

            </div>
          )}

          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>
            Confirm Password
          </label>

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm password"
            value={
              formData.confirm_password
            }
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Registering..."
              : "Create Account"}
          </button>

        </form>

        <p style={styles.loginText}>
          Already have an account?

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            style={styles.loginButton}
          >
            Login
          </button>
        </p>

      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f8e9",
    display: "flex",
    justifyContent: "center",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "650px",
    background: "white",
    padding: "35px",
    borderRadius: "15px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    color: "#2e7d32",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    marginTop: "16px",
    marginBottom: "7px",
    fontWeight: "bold",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    background: "white",
    color: "#333",
  },

  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    resize: "vertical",
  },

  fileInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "white",
  },

  vendorSection: {
    marginTop: "25px",
    padding: "20px",
    background: "#f4f8f4",
    borderRadius: "10px",
    border: "2px solid #c8e6c9",
  },

  sectionTitle: {
    color: "#2e7d32",
    marginTop: "15px",
    marginBottom: "10px",
  },

  success: {
    background: "#dff5e1",
    color: "#1b5e20",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "bold",
  },

  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "bold",
  },

  button: {
    width: "100%",
    marginTop: "25px",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#43a047",
    color: "white",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  loginText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#555",
  },

  loginButton: {
    border: "none",
    background: "none",
    color: "#2e7d32",
    fontWeight: "bold",
    cursor: "pointer",
    marginLeft: "5px",
  },
};

export default Register;