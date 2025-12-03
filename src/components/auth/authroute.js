import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './authprovider';
import { jwtDecode } from 'jwt-decode';

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const UserPrivateRoute = () => {
  const { auth } = useContext(AuthContext);
  const { token, role } = auth;

  const validToken = isTokenValid(token);
  if (!validToken) {
    return <Navigate to="/login" />;
  }

  // If admin token is valid and tries to access user route, redirect to admin dashboard
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Valid user token
  if (role === 'USER') {
    return <Outlet />;
  }

  // Default fallback: redirect to login
  return <Navigate to="/login" />;
};

export const AdminPrivateRoute = () => {
  const { auth } = useContext(AuthContext);
  const { token, role } = auth;

  const validToken = isTokenValid(token);
  if (!validToken) {
    return <Navigate to="/login" />;
  }

  if (role === 'USER') {
    return <Navigate to="/" replace />;
  }

  // ONLY SELLER allowed here
  if (role === 'SELLER') {
    return <Outlet />;
  }

  // ADMIN redirected elsewhere
  if (role === 'ADMIN') {
    return <Navigate to="/admin/user" replace />;
  }

  return <Navigate to="/login" />;
};



export const MainAdminPrivateRoute = () => {
  const { auth } = useContext(AuthContext);
  const { token, role } = auth;

  const validToken = isTokenValid(token);
  if (!validToken) {
    return <Navigate to="/login" />;
  }

  if (role === 'USER') {
    return <Navigate to="/" replace />;
  }

  if (role === 'SELLER') {
    return <Navigate to="/admin" replace />;  // Redirect sellers to seller dashboard
  }

  if (role === 'ADMIN') {
    return <Outlet />;
  }

  return <Navigate to="/login" />;
};
