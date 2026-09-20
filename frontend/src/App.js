import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NewRequest from "./pages/NewRequest";
import MyRequests from "./pages/MyRequests";
import RequestDetails from "./pages/RequestDetails";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import MyBills from "./pages/MyBills";
import BillDetails from "./pages/BillDetails";
import AdminRequests from "./pages/AdminRequests";
import AdminOrders from "./pages/AdminOrders";
import AdminBills from "./pages/AdminBills";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/" />;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { pathname } = useLocation();
  const section = pathname.includes("request")
    ? "Requests"
    : pathname.includes("order")
      ? "Orders"
      : pathname.includes("bill")
        ? "Billing"
        : "Overview";
  if (loading)
    return (
      <div className="loading" role="status">
        Opening your workspace…
      </div>
    );

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {isAuthenticated && <Navbar />}
      <div className={isAuthenticated ? "app-main" : ""}>
        {isAuthenticated && (
          <header className="topbar">
            <div className="topbar-context">
              <span>{isAdmin ? "Workspace" : "My account"}</span>
              <ChevronRight size={12} />
              <span>{section}</span>
            </div>
            <span className="topbar-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </header>
        )}
        <div
          id="main-content"
          role={isAuthenticated ? "main" : undefined}
          tabIndex={-1}
        >
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
              }
            />

            {/* Client Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  {isAdmin ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <ClientDashboard />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path="/new-request"
              element={
                <PrivateRoute>
                  <NewRequest />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <PrivateRoute>
                  <MyRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/request/:id"
              element={
                <PrivateRoute>
                  <RequestDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <PrivateRoute>
                  <MyOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/order/:id"
              element={
                <PrivateRoute>
                  <OrderDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-bills"
              element={
                <PrivateRoute>
                  <MyBills />
                </PrivateRoute>
              }
            />
            <Route
              path="/bill/:id"
              element={
                <PrivateRoute>
                  <BillDetails />
                </PrivateRoute>
              }
            />

            {/* Administrator routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <AdminRoute>
                  <AdminRequests />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bills"
              element={
                <AdminRoute>
                  <AdminBills />
                </AdminRoute>
              }
            />

            <Route
              path="/"
              element={
                <Navigate
                  to={
                    isAuthenticated
                      ? isAdmin
                        ? "/admin/dashboard"
                        : "/dashboard"
                      : "/login"
                  }
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
