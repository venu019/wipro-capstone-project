import React, { useContext, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../auth/authprovider"; // Your AuthContext

// --- MATERIAL-UI IMPORTS ---
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { createTheme, ThemeProvider } from "@mui/material/styles";

// --- API ENDPOINTS ---
const USER_VERIFY_URL = "http://localhost:9001/api/v1/auth/verify-login-otp";
const SELLER_VERIFY_URL = "http://localhost:9001/api/auth/seller/verify-login";

// --- THEME ---
const theme = createTheme();

const VerifyLoginOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { email, role } = location.state || {};
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!email || !role) {
    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Alert severity="error">
              Invalid Access. Please <Link component={RouterLink} to="/login">log in</Link> first.
            </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits long.");
      return;
    }
    
    setLoading(true);
    try {
      const verificationUrl = role === 'SELLER' ? SELLER_VERIFY_URL : USER_VERIFY_URL;
      const response = await axios.post(verificationUrl, { email, otp });
      console.log("Verification response:", response.data);
      
      login(response.data); // Pass the full data object to your context

      setMessage("Login Successful! Redirecting...");

      setTimeout(() => {
        const userRole = response.data.role;
        if (userRole === "ADMIN") {
          navigate("/admin");
        } else if (userRole === "SELLER") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <VpnKeyIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h5" fontWeight="bold">
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            An OTP has been sent to <strong>{email}</strong>. Please enter it below.
          </Typography>

          {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleVerifyOtp} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter 6-Digit OTP"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!error}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5rem' } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Verify & Sign In"}
            </Button>

            {/* <Box textAlign="center">
              <Link component="button" variant="body2" onClick={handleResendOtp} disabled={loading}>
                Didn't receive the code? Resend
              </Link>
            </Box> */}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default VerifyLoginOtp;
