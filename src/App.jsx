/**
 * App – Route definitions.
 * Protected routes require token in localStorage (see Login.jsx, backend auth).
 */
import { Component } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/DashboardTab/Dashboard";
import UserManagement from "./pages/UserTab/UserManagement";
import UserSummary from "./pages/UserTab/UserSummary";
import EditUser from "./pages/UserTab/EditUser";
import ChangeUserRole from "./pages/UserTab/ChangeUserRole";
import PropertyManagement from "./pages/PropertyTab/PropertyManagement";
import TaskManager from "./pages/TaskTab/TaskManager";
import HRMS from "./pages/HRMS";
import SalesAndLease from "./pages/SalesAndLease";
import FacilityManagement from "./pages/FacilityManagement";
import Legal from "./pages/Legal";
import Accounts from "./pages/Accounts";
import Store from "./pages/Store";
import Reports from "./pages/Reports";

const PROTECTED_ROUTES = [
  { path: "/", element: <Dashboard />, index: true },
  { path: "users", element: <UserManagement /> },
  { path: "users/edit/:id", element: <EditUser /> },
  { path: "users/role/:id", element: <ChangeUserRole /> },
  { path: "users/:id", element: <UserSummary /> },
  { path: "properties", element: <PropertyManagement /> },
  { path: "tasks", element: <TaskManager /> },
  { path: "hrms", element: <HRMS /> },
  { path: "sales", element: <SalesAndLease /> },
  { path: "facility", element: <FacilityManagement /> },
  { path: "legal", element: <Legal /> },
  { path: "accounts", element: <Accounts /> },
  { path: "store", element: <Store /> },
  { path: "reports", element: <Reports /> },
];

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif" }}>
          <h2>Something went wrong</h2>
          <pre style={{ background: "#f5f5f5", padding: 12, overflow: "auto" }}>
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {PROTECTED_ROUTES.map((r) =>
            r.index ? (
              <Route key={r.path || "index"} index element={r.element} />
            ) : (
              <Route key={r.path} path={r.path} element={r.element} />
            )
          )}
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
