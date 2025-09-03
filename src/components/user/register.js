import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const registerValidationSchema = Yup.object({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit phone number")
    .required("Required"),
  password: Yup.string().min(6, "Must be at least 6 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

const Register = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
    validationSchema: registerValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await axios.post("http://localhost:9001/api/v1/auth/register", {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
        });
        alert(`Registered successfully with email: ${values.email}`);
        resetForm();
        navigate("/login");
      } catch (error) {
        alert("Registration failed. Please try again.");
      }
      setSubmitting(false);
    },
  });

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3"
      style={{ maxWidth: "450px", margin: "0 auto" }}
    >
      <div className="card shadow p-4 rounded-1 w-100">
        <h2 className="text-center mb-4 fw-bold text-primary">Create Account</h2>
        <form noValidate onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="form-label fw-semibold">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-control shadow-sm ${
                formik.touched.name && formik.errors.name ? "is-invalid" : ""
              }`}
              placeholder="John Doe"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              autoComplete="name"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="invalid-feedback">{formik.errors.name}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-semibold">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control shadow-sm ${
                formik.touched.email && formik.errors.email ? "is-invalid" : ""
              }`}
              placeholder="your.email@example.com"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="invalid-feedback">{formik.errors.email}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="form-label fw-semibold">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength="10"
              className={`form-control shadow-sm ${
                formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
              }`}
              placeholder="9876543210"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              autoComplete="tel"
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="invalid-feedback">{formik.errors.phone}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control shadow-sm ${
                formik.touched.password && formik.errors.password ? "is-invalid" : ""
              }`}
              placeholder="Enter your password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              autoComplete="new-password"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label fw-semibold">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-control shadow-sm ${
                formik.touched.confirmPassword && formik.errors.confirmPassword ? "is-invalid" : ""
              }`}
              placeholder="Re-enter your password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              autoComplete="new-password"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold shadow-sm"
            disabled={formik.isSubmitting}
          >
            Register
          </button>

          <div className="text-center mt-3 small text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-none text-primary fw-semibold">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
