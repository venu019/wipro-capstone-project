import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    role: null,
    email: null,
    // Role-specific fields
    userId: null,
    sellerId: null,
    travelsName: null,
  });

  const logoutTimerRef = useRef(null);

  // --- LOGOUT (More Robust) ---
  const logout = useCallback(() => {
    // Clear all auth-related items from localStorage
    localStorage.clear(); 

    // Reset auth state completely
    setAuth({
      token: null,
      role: null,
      email: null,
      userId: null,
      sellerId: null,
      travelsName: null,
    });

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // --- LOGIN (More Flexible) ---
  // Now accepts a single 'data' object from the backend response
  const login = useCallback((data) => {
    // **CHANGE**: Clear previous session data to prevent conflicts
    localStorage.clear();
    console.log(data.sellername);
    console.log(data.role);

    // Store common and role-specific data
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);

    if (data.role === 'SELLER') {
      localStorage.setItem("sellerId", data.sellerId);
      localStorage.setItem("travelsName", data.travelsName);
localStorage.setItem("sellerName", data.sellername);
localStorage.setItem("role", data.role);
    } else { // For USER or ADMIN
      localStorage.setItem("userId", data.userId);
    }
    
    // **CHANGE**: Set the full auth state from the data object
    setAuth(data);

    // Automatic logout based on JWT expiration
    try {
      const decoded = jwtDecode(data.token);
      if (decoded.exp) {
        const expTime = decoded.exp * 1000;
        const timeout = expTime - Date.now();

        if (timeout > 0) {
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
          logoutTimerRef.current = setTimeout(logout, timeout);
        } else {
          logout(); // Token is already expired
        }
      }
    } catch (err) {
      console.error("Invalid token during login:", err);
      logout();
    }
  }, [logout]);

  // --- LOAD FROM LOCALSTORAGE ON REFRESH (More Complete) ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        // **CHANGE**: Load all relevant data from localStorage
        const role = localStorage.getItem("role");
        const email = localStorage.getItem("email");
        const userId = localStorage.getItem("userId");
        const sellerId = localStorage.getItem("sellerId");
        const travelsName = localStorage.getItem("travelsName");

        setAuth({ token, role, email, userId, sellerId, travelsName });

        // Reset the auto-logout timer
        const timeout = (decoded.exp * 1000) - Date.now();
        logoutTimerRef.current = setTimeout(logout, timeout);
      } else {
        logout(); // Token is expired
      }
    } catch (err) {
      console.error("Invalid token on initial load:", err);
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
