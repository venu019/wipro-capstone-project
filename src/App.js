import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import HomePage from './components/user/home';
import UserNavbar from "./components/user/navbar";
import AdminNavbar from "./components/admin/navbar";
import Footer from './components/user/footer';
import BusList from './components/user/buslist';
import MyBookings from './components/user/mybookings';
import Login from './components/user/login';
import Register from './components/user/register';
import AdminDashboard from './components/admin/dashboard';
import AdminBusManagement from './components/admin/bus';
import AdminRouteManagement from './components/admin/busroutes';
import AdminTripManagement from './components/admin/trip';
import { UserPrivateRoute, AdminPrivateRoute } from './components/auth/authroute';
import { AuthContext } from './components/auth/authprovider';

function App() {
  const { auth } = useContext(AuthContext);

  const isLoggedIn = !!auth.token;
  const isUser = auth.role === 'USER';
  const isAdmin = auth.role === 'ADMIN';

  return (
    <div className="App">
      {/* Conditionally render navbars */}
      {isLoggedIn && isUser && <UserNavbar />}
      {isLoggedIn && isAdmin && <AdminNavbar />}

      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User protected routes */}
          <Route element={<UserPrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<BusList />} />
            <Route path="/bookings" element={<MyBookings />} />
          </Route>

          {/* Admin protected routes */}
          <Route element={<AdminPrivateRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/buses" element={<AdminBusManagement />} />
            <Route path="/admin/routes" element={<AdminRouteManagement />} />
            <Route path="/admin/trips" element={<AdminTripManagement />} />
          </Route>
        </Routes>
      </main>
      {isLoggedIn&&<Footer />}
    </div>
  );
}

export default App;
