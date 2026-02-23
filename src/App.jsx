/**
 * App – Main router and layout
 * -----------------------------------------------------------------------
 * - Protected routes (desktop): require token, else redirect to /login
 * - Mobile routes: /mobile/* (Welcome, Splash, Login, OTP, ChangePassword, Dashboard, Tasks, Profile, Reports)
 * - Mobile protected routes: require token, else redirect to /mobile/login
 * - mobile-login-wrapper: max-width 430px container for mobile-first layout
 */
import { Component } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layout/Layout";
import Login from "./pages/Login";
import WelcomeScreen from "./pages/Mobile Frontend/Login page/WelcomeScreen";
import SplashScreen from "./pages/Mobile Frontend/Login page/SplashScreen";
import LoginScreen from "./pages/Mobile Frontend/Login page/LoginScreen";
import OtpVerificationScreen from "./pages/Mobile Frontend/Login page/OtpVerificationScreen";
import ChangePasswordScreen from "./pages/Mobile Frontend/Login page/ChangePasswordScreen";
import EndUserDashboard from "./pages/Mobile Frontend/End user screen/EndUserDashboard";
import EndUserTasksList from "./pages/Mobile Frontend/End user screen/EndUserTasksList";
import EndUserTaskDetails from "./pages/Mobile Frontend/End user screen/EndUserTaskDetails";
import EndUserTaskCompletion from "./pages/Mobile Frontend/End user screen/EndUserTaskCompletion";
import EndUserTaskCompletionSuccess from "./pages/Mobile Frontend/End user screen/EndUserTaskCompletionSuccess";
import EndUserProfile from "./pages/Mobile Frontend/End user screen/EndUserProfile";
import EndUserProfileChangePassword from "./pages/Mobile Frontend/End user screen/EndUserProfileChangePassword";
import EndUserReports from "./pages/Mobile Frontend/End user screen/EndUserReports";
import ManagerDashboard from "./pages/Mobile Frontend/manager Screen/ManagerDashboard";
import ManagerTaskOverview from "./pages/Mobile Frontend/manager Screen/ManagerTaskOverview";
import ManagerSupervisors from "./pages/Mobile Frontend/manager Screen/ManagerSupervisors";
import ManagerReports from "./pages/Mobile Frontend/manager Screen/ManagerReports";
import ManagerProfile from "./pages/Mobile Frontend/manager Screen/ManagerProfile";
import Dashboard from "./pages/DashboardTab/Dashboard";
import UserManagement from "./pages/UserTab/UserManagement";
import UserSummary from "./pages/UserTab/UserSummary";
import EditUser from "./pages/UserTab/EditUser";
import ChangeUserRole from "./pages/UserTab/ChangeUserRole";
import PropertyManagement from "./pages/PropertyTab/PropertyManagement";
import TaskManager from "./pages/TaskTab/TaskManager";
import TaskDetails from "./pages/TaskTab/TaskDetails";
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
  { path: "tasks/:id", element: <TaskDetails /> },
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

function MobileProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/mobile/login" replace />;
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
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/mobile" element={<div className="mobile-login-wrapper"><Outlet /></div>}>
            <Route index element={<Navigate to="/mobile/welcome" replace />} />
            <Route path="welcome" element={<WelcomeScreen />} />
            <Route path="splash" element={<SplashScreen />} />
            <Route path="login" element={<LoginScreen />} />
            <Route path="otp" element={<OtpVerificationScreen />} />
            <Route path="change-password" element={<ChangePasswordScreen />} />
            <Route path="dashboard" element={<MobileProtectedRoute><EndUserDashboard /></MobileProtectedRoute>} />
            <Route path="tasks" element={<MobileProtectedRoute><EndUserTasksList /></MobileProtectedRoute>} />
            <Route path="task/:id" element={<MobileProtectedRoute><EndUserTaskDetails /></MobileProtectedRoute>} />
            <Route path="task/:id/complete" element={<MobileProtectedRoute><EndUserTaskCompletion /></MobileProtectedRoute>} />
            <Route path="task/:id/success" element={<MobileProtectedRoute><EndUserTaskCompletionSuccess /></MobileProtectedRoute>} />
            <Route path="profile" element={<MobileProtectedRoute><EndUserProfile /></MobileProtectedRoute>} />
            <Route path="profile/change-password" element={<MobileProtectedRoute><EndUserProfileChangePassword /></MobileProtectedRoute>} />
            <Route path="reports" element={<MobileProtectedRoute><EndUserReports /></MobileProtectedRoute>} />
            <Route path="manager/dashboard" element={<MobileProtectedRoute><ManagerDashboard /></MobileProtectedRoute>} />
            <Route path="manager/tasks" element={<MobileProtectedRoute><ManagerTaskOverview /></MobileProtectedRoute>} />
            <Route path="manager/supervisors" element={<MobileProtectedRoute><ManagerSupervisors /></MobileProtectedRoute>} />
            <Route path="manager/reports" element={<MobileProtectedRoute><ManagerReports /></MobileProtectedRoute>} />
            <Route path="manager/profile" element={<MobileProtectedRoute><ManagerProfile /></MobileProtectedRoute>} />
          </Route>
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
      </AuthProvider>
    </ErrorBoundary>
  );
}
