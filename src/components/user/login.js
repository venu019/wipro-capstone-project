import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { AuthContext } from "../auth/authprovider";
import { useNavigate, Link } from "react-router-dom";

const loginValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().min(4, "Must be at least 4 characters").required("Required"),
});

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post('http://localhost:9001/api/v1/auth/login', values);
        const data = response.data;

        login(data.accessToken, data.role, data.userId);

        if (data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (error) {
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert("Login error: " + error.message);
        }
      }
    },
  });

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
      style={{ padding: "1rem" }}
    >
      <div className="card shadow-lg p-4 rounded-2" style={{ maxWidth: "420px", width: "100%" }}>
        <h2 className="text-center mb-4 fw-bold">Login</h2>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-semibold">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className={`form-control shadow-sm ${
                formik.touched.email && formik.errors.email ? "is-invalid" : ""
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="invalid-feedback">{formik.errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className={`form-control shadow-sm ${
                formik.touched.password && formik.errors.password ? "is-invalid" : ""
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <Link to="/forgot-password" className="small text-decoration-none text-primary">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold shadow-sm">
            Login
          </button>

          <div className="mt-4 text-center small text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-decoration-none text-primary fw-semibold">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
