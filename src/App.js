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
import { UserPrivateRoute, AdminPrivateRoute ,MainAdminPrivateRoute} from './components/auth/authroute';
import { AuthContext } from './components/auth/authprovider';
import VerifyLoginOtp from './components/user/verfiy';
import VerifyRegisterOtp from './components/user/regverfiy';
import PreLoginHome from "./components/user/prelogin";
import SellerBusManagement from "./components/admin/bus";
import SellerRouteManagement from "./components/admin/busroutes";
import SellerTripManagement from "./components/admin/trip";
import SellerDashboard from "./components/admin/dashboard";
import AdminUserManagement from "./components/mainadmin/AdminUserManagement";
import AdminSellerManagement from "./components/mainadmin/AdminSellerManagement";
import AdminAnalyticsDashboard from "./components/mainadmin/AdminAnalyticsDashboard";
import MainAdminNavbar from "./components/mainadmin/MainAdminNavbar";

function App() {
  const { auth } = useContext(AuthContext);

  const isLoggedIn = !!auth.token;
  const isUser = auth.role === 'USER';
  const isAdmin = auth.role === 'SELLER';
  const ismainSeller = auth.role === 'ADMIN';

  return (
    <div className="App">
      {/* Conditionally render navbars */}
      {isLoggedIn && isUser && <UserNavbar />}
      {isLoggedIn && isAdmin && <AdminNavbar />}
      {isLoggedIn && ismainSeller && <MainAdminNavbar />}
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/prelogin" element={<PreLoginHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-login-otp" element={<VerifyLoginOtp />} />
          <Route path="/verify-register-otp" element={<VerifyRegisterOtp />} />



          {/* User protected routes */}
          <Route element={<UserPrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<BusList />} />
            <Route path="/bookings" element={<MyBookings />} />
          </Route>

          {/* Seller protected routes */}
<Route element={<AdminPrivateRoute />}>
  <Route path="/admin" element={<SellerDashboard />} />
  <Route path="/admin/buses" element={<SellerBusManagement />} />
  <Route path="/admin/routes" element={<SellerRouteManagement />} />
  <Route path="/admin/trips" element={<SellerTripManagement />} />
</Route>

{/* Main Admin protected routes */}
<Route element={<MainAdminPrivateRoute />}>
  <Route path="/admin/user" element={<AdminUserManagement />} />
  <Route path="/admin/seller" element={<AdminSellerManagement />} />
  <Route path="/admin/analysis" element={<AdminAnalyticsDashboard />} />
</Route>


        </Routes>
      </main>
      {isLoggedIn&&<Footer />}
    </div>
  );
}

export default App;
