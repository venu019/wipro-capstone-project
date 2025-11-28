import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";

// --- API ENDPOINTS ---
const USER_VERIFY_URL = "http://localhost:9001/api/v1/auth/verify-register-otp";
const SELLER_VERIFY_URL = "http://localhost:9001/api/auth/seller/verify-register";

const VerifyRegisterOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- LOGIC CHANGE: Read both 'email' and 'role' from navigation state ---
  const { email, role } = location.state || {};
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  // Using separate states for success and error messages to prevent UI flicker
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- LOGIC CHANGE: Improved validation to handle direct access ---
  if (!email || !role) {
    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div>
                <h3 className="text-center text-danger">Invalid Access</h3>
                <p className="text-center text-muted">Please go back and register first.</p>
                <div className="text-center">
                    <Link to="/register" className="btn btn-primary">Go to Registration</Link>
                </div>
            </div>
        </div>
    );
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (otp.length !== 6) {
      // Using state for errors instead of alert
      setErrorMessage("OTP must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    try {
      // --- LOGIC CHANGE: Dynamically choose the verification URL based on the role ---
      const verificationUrl = role === 'SELLER' ? SELLER_VERIFY_URL : USER_VERIFY_URL;

      const response = await axios.post(verificationUrl, {
        email,
        otp,
      });

      // Use state for success message
      setSuccessMessage(response.data.message || "Registration Verified Successfully!");

      setTimeout(() => {
          navigate("/login");
      }, 1500);

    } catch (error) {
      // Use state for displaying backend errors
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data ||
        "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- UI REMAINS IDENTICAL TO YOURS ---
  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
      style={{ padding: "1rem" }}
    >
      <div
        className="card shadow-lg p-4 rounded-2"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <h2 className="text-center mb-4 fw-bold">Verify Register OTP</h2>

        {/* Display success or error messages without changing layout */}
        {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="form-label fw-semibold">OTP</label>
            <input
              type="text"
              maxLength="6"
              className={`form-control shadow-sm ${errorMessage ? 'is-invalid' : ''}`}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold shadow-sm"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="mt-3 text-center text-muted small">
          OTP sent to <strong>{email}</strong>
        </p>
      </div>
    </div>
  );
};

export default VerifyRegisterOtp;
