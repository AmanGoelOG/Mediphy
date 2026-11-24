
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MedicineSearch from "./pages/MedicineSearch";
import MedicineDetails from "./pages/MedicineDetails";
import PharmacyFinder from "./pages/PharmacyFinder";
import PharmacyDetails from "./pages/PharmacyDetails";
import PriceComparison from "./pages/PriceComparison";
import ReserveMedicine from "./pages/ReserveMedicine";
import MyReservations from "./pages/MyReservations";

import AdminDashboard from "./pages/AdminDashboard";
import AdminMedicines from "./pages/AdminMedicines";
import AdminPharmacies from "./pages/AdminPharmacies";
import AdminInventory from "./pages/AdminInventory";
import AdminReservations from "./pages/AdminReservations";
import AdminUsers from "./pages/AdminUsers";

// Only normal logged-in users can access these pages
const UserRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// Only Admin can access these pages
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Logged-in users cannot access login/register
const GuestRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (isLoggedIn) {
    return (
      <Navigate
        to={isAdmin ? "/admin/dashboard" : "/"}
        replace
      />
    );
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />

      <Routes>

        {/* Login and Registration */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* User Protected Pages */}
        <Route
          path="/"
          element={
            <UserRoute>
              <Home />
            </UserRoute>
          }
        />

        <Route
          path="/medicines"
          element={
            <UserRoute>
              <MedicineSearch />
            </UserRoute>
          }
        />

        <Route
          path="/medicines/:id"
          element={
            <UserRoute>
              <MedicineDetails />
            </UserRoute>
          }
        />

        <Route
          path="/pharmacies"
          element={
            <UserRoute>
              <PharmacyFinder />
            </UserRoute>
          }
        />

        <Route
          path="/pharmacies/:id"
          element={
            <UserRoute>
              <PharmacyDetails />
            </UserRoute>
          }
        />

        <Route
          path="/price-comparison/:id"
          element={
            <UserRoute>
              <PriceComparison />
            </UserRoute>
          }
        />

        <Route
          path="/reserve/:id"
          element={
            <UserRoute>
              <ReserveMedicine />
            </UserRoute>
          }
        />

        <Route
          path="/my-reservations"
          element={
            <UserRoute>
              <MyReservations />
            </UserRoute>
          }
        />

        {/* Admin Protected Pages */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/medicines"
          element={
            <AdminRoute>
              <AdminMedicines />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/pharmacies"
          element={
            <AdminRoute>
              <AdminPharmacies />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <AdminRoute>
              <AdminInventory />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/reservations"
          element={
            <AdminRoute>
              <AdminReservations />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
