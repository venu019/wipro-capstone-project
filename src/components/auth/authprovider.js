import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    role: null,
  });

  // Use useRef to store timer id without causing rerenders
  const logoutTimerRef = useRef(null);

  // Function to logout completely
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuth({ token: null, role: null });
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []); // no dependencies to avoid recreation on timer change

  // Login function: save token and role in state and localStorage and setup auto logout timer
  const login = useCallback((token, role,userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    setAuth({ token, role });

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp) {
        const expTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeout = expTime - currentTime;

        if (timeout > 0) {
          // Clear existing timer if any
          if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
          }
          // Set new timer to auto logout when token expires
          logoutTimerRef.current = setTimeout(() => {
            logout();
          }, timeout);
        } else {
          // Token expired immediately
          logout();
        }
      }
    } catch (error) {
      console.error('Invalid token:', error);
      logout();
    }
  }, [logout]); // depends on stable logout function

  // On mount, load token and role from localStorage and validate token expiration
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp) {
          const expTime = decoded.exp * 1000;
          const currentTime = Date.now();

          if (expTime > currentTime) {
            setAuth({ token, role });

            const timeout = expTime - currentTime;

            // Clear any previous timer
            if (logoutTimerRef.current) {
              clearTimeout(logoutTimerRef.current);
            }

            logoutTimerRef.current = setTimeout(() => {
              logout();
            }, timeout);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error('Invalid token on load:', error);
        logout();
      }
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
