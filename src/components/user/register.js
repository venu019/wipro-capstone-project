import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// --- API ENDPOINTS ---
const USER_REGISTER_URL = "http://localhost:9001/api/v1/auth/register";
const SELLER_REGISTER_URL = "http://localhost:9001/api/auth/seller/register";

// --- VALIDATION SCHEMAS ---
const userValidationSchema = Yup.object({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone: Yup.string().matches(/^[0-9]{10}$/, "Must be a valid 10-digit phone number").required("Required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Required"),
});

const sellerValidationSchema = Yup.object({
  name: Yup.string().required("Owner's name is required"),
  travelsName: Yup.string().required("Travels name is required"),
  email: Yup.string().email("Invalid email address").required("Business email is required"),
  phone: Yup.string().matches(/^[0-9]{10}$/, "Must be a valid 10-digit phone number").required("Required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Required"),
});

const Register = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // Use a separate state for errors
  const [role, setRole] = useState("USER"); // 'USER' or 'SELLER'

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      travelsName: "",
    },
    // The validation schema will be dynamically set based on the role
    validationSchema: role === "USER" ? userValidationSchema : sellerValidationSchema,
    enableReinitialize: true, // This is crucial for the schema to update when the role changes
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setMessage("");
      setError("");

      const isSeller = role === 'SELLER';
      const registrationUrl = isSeller ? SELLER_REGISTER_URL : USER_REGISTER_URL;
      
      let payload;
      if (isSeller) {
        payload = {
          name: values.name,
          travelsName: values.travelsName,
          email: values.email,
          phone: values.phone,
          password: values.password,
        };
      } else {
        payload = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: 'USER', // Explicitly set role for user registration
        };
      }

      try {
        console.log("Submitting registration with payload:", payload);
        const response = await axios.post(registrationUrl, payload);
        console.log("Registration response:", response.data);
        setMessage(response.data.message || "Registered successfully! OTP sent.");
        console.log(role);
        resetForm();
        setTimeout(() => {
          navigate("/verify-register-otp", {
            state: { email: values.email, role: role },
          });
        }, 1200);
      } catch (err) {
        // This will now capture and display any error message from the backend
        setError(err.response?.data?.message || err.response?.data || "Registration failed. Please try again.");
      }
      setSubmitting(false);
    },
  });

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    formik.resetForm(); // Reset form fields and errors when role changes
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="card shadow p-4 rounded-1 w-100" style={{ maxWidth: "450px" }}>
        <h2 className="text-center mb-4 fw-bold text-primary">Create Your Account</h2>

        {/* --- Display Messages --- */}
        {message && <p className="text-center fw-semibold text-success">{message}</p>}
        {error && <p className="text-center fw-semibold text-danger">{error}</p>}

        <form noValidate onSubmit={formik.handleSubmit}>
          {/* --- ROLE SELECTION --- */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Register as:</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleUser" value="USER" checked={role === "USER"} onChange={handleRoleChange} />
                <label className="form-check-label" htmlFor="roleUser">User</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleBusProvider" value="SELLER" checked={role === "SELLER"} onChange={handleRoleChange} />
                <label className="form-check-label" htmlFor="roleBusProvider">Bus Provider</label>
              </div>
            </div>
          </div>
          
          {/* --- DYNAMIC FORM FIELDS --- */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold">{role === 'SELLER' ? "Owner's Full Name" : "Full Name"}</label>
            <input id="name" name="name" type="text" className={`form-control ${formik.touched.name && formik.errors.name ? "is-invalid" : ""}`} {...formik.getFieldProps('name')} />
            {formik.touched.name && formik.errors.name && <div className="invalid-feedback">{formik.errors.name}</div>}
          </div>

          {role === 'SELLER' && (
            <div className="mb-3">
              <label htmlFor="travelsName" className="form-label fw-semibold">Travels Name</label>
              <input id="travelsName" name="travelsName" type="text" className={`form-control ${formik.touched.travelsName && formik.errors.travelsName ? "is-invalid" : ""}`} {...formik.getFieldProps('travelsName')} />
              {formik.touched.travelsName && formik.errors.travelsName && <div className="invalid-feedback">{formik.errors.travelsName}</div>}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">{role === 'SELLER' ? "Business Email" : "Email Address"}</label>
            <input id="email" name="email" type="email" className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`} {...formik.getFieldProps('email')} />
            {formik.touched.email && formik.errors.email && <div className="invalid-feedback">{formik.errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="phone" className="form-label fw-semibold">{role === 'SELLER' ? "Business Phone" : "Phone Number"}</label>
            <input id="phone" name="phone" type="tel" className={`form-control ${formik.touched.phone && formik.errors.phone ? "is-invalid" : ""}`} {...formik.getFieldProps('phone')} />
            {formik.touched.phone && formik.errors.phone && <div className="invalid-feedback">{formik.errors.phone}</div>}
          </div>

          <div className="row g-2 mb-3">
            <div className="col">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className={`form-control ${formik.touched.password && formik.errors.password ? "is-invalid" : ""}`} {...formik.getFieldProps('password')} />
              {formik.touched.password && formik.errors.password && <div className="invalid-feedback">{formik.errors.password}</div>}
            </div>
            <div className="col">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "is-invalid" : ""}`} {...formik.getFieldProps('confirmPassword')} />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="invalid-feedback">{formik.errors.confirmPassword}</div>}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-100 fw-semibold shadow-sm" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Submitting..." : "Create Account"}
          </button>

          <div className="text-center mt-3 small text-muted">
            Already have an account? <Link to="/login" className="text-decoration-none text-primary fw-semibold">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
