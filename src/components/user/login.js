import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";

// --- MATERIAL-UI IMPORTS ---
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from "@mui/material/styles";

// --- API ENDPOINTS ---
const USER_LOGIN_URL = "http://localhost:9001/api/v1/auth/login";
const SELLER_LOGIN_URL = "http://localhost:9001/api/auth/seller/login";

// --- VALIDATION SCHEMA ---
const loginValidationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

// --- THEME ---
const theme = createTheme();

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [role, setRole] = useState("USER"); // 'USER' or 'SELLER'

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      
      const loginUrl = role === 'SELLER' ? SELLER_LOGIN_URL : USER_LOGIN_URL;
      console.log(loginUrl);
      
      try {
        await axios.post(loginUrl, values);
        console.log(loginUrl);

        // On success, navigate to the unified OTP page with email and role
        navigate("/verify-login-otp", {
          state: { email: values.email, role: role },
        });

      } catch (err) {
        setError(err.response?.data?.message || err.response?.data || "Login failed. Please check your credentials.");
      }
      setSubmitting(false);
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 4,
          }}
        >
          <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h5" fontWeight="bold">
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Welcome back! Please enter your details.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 1, width: '100%' }}
          >
            {/* --- ROLE SELECTION --- */}
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Login as</FormLabel>
              <RadioGroup
                row
                aria-label="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <FormControlLabel value="USER" control={<Radio />} label="User" />
                <FormControlLabel value="SELLER" control={<Radio />} label="Seller" />
              </RadioGroup>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <CircularProgress size={24} /> : "Sign In & Get OTP"}
            </Button>

            <Box display="flex" justifyContent="space-between">
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
