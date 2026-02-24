/**
 * App – Main router and layout
 * -----------------------------------------------------------------------
 * - Protected routes (desktop): require token, else redirect to /login
 * - Mobile routes: /mobile/* (Welcome, Splash, Login, OTP, ChangePassword, Dashboard, Tasks, Profile, Reports)
 * - Mobile protected routes: require token, else redirect to /mobile/login
 * - Role-based redirect: Manager/Admin → manager screens, Staff → end-user screens
 * - Lazy-loaded heavy routes for faster initial render
 */
import { Component, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { isManagerRole, getStoredUser } from "./lib/userUtils";
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
import NotificationsScreen from "./pages/Mobile Frontend/NotificationsScreen";
import Dashboard from "./pages/DashboardTab/Dashboard";
import PropertyManagement from "./pages/PropertyTab/PropertyManagement";
import Reports from "./pages/Reports";

const UserManagement = lazy(() => import("./pages/UserTab/UserManagement"));
const UserSummary = lazy(() => import("./pages/UserTab/UserSummary"));
const EditUser = lazy(() => import("./pages/UserTab/EditUser"));
const ChangeUserRole = lazy(() => import("./pages/UserTab/ChangeUserRole"));
const TaskManager = lazy(() => import("./pages/TaskTab/TaskManager"));
const TaskDetails = lazy(() => import("./pages/TaskTab/TaskDetails"));
const HRMS = lazy(() => import("./pages/HRMS"));
const SalesAndLease = lazy(() => import("./pages/SalesAndLease"));
const FacilityManagement = lazy(() => import("./pages/FacilityManagement"));
const Legal = lazy(() => import("./pages/Legal"));
const Accounts = lazy(() => import("./pages/Accounts"));
const Store = lazy(() => import("./pages/Store"));

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

function MobileStaffRoute({ children }) {
  const { user } = useAuth();
  const u = user ?? getStoredUser();
  if (u && isManagerRole(u)) return <Navigate to="/mobile/manager/dashboard" replace />;
  return children;
}

function MobileManagerRoute({ children }) {
  const { user } = useAuth();
  const u = user ?? getStoredUser();
  if (u && !isManagerRole(u)) return <Navigate to="/mobile/dashboard" replace />;
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
            <Route path="dashboard" element={<MobileProtectedRoute><MobileStaffRoute><EndUserDashboard /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="tasks" element={<MobileProtectedRoute><MobileStaffRoute><EndUserTasksList /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="task/:id" element={<MobileProtectedRoute><MobileStaffRoute><EndUserTaskDetails /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="task/:id/complete" element={<MobileProtectedRoute><MobileStaffRoute><EndUserTaskCompletion /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="task/:id/success" element={<MobileProtectedRoute><MobileStaffRoute><EndUserTaskCompletionSuccess /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="profile" element={<MobileProtectedRoute><MobileStaffRoute><EndUserProfile /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="notifications" element={<MobileProtectedRoute><MobileStaffRoute><NotificationsScreen /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="profile/change-password" element={<MobileProtectedRoute><MobileStaffRoute><EndUserProfileChangePassword /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="reports" element={<MobileProtectedRoute><MobileStaffRoute><EndUserReports /></MobileStaffRoute></MobileProtectedRoute>} />
            <Route path="manager/dashboard" element={<MobileProtectedRoute><MobileManagerRoute><ManagerDashboard /></MobileManagerRoute></MobileProtectedRoute>} />
            <Route path="manager/tasks" element={<MobileProtectedRoute><MobileManagerRoute><ManagerTaskOverview /></MobileManagerRoute></MobileProtectedRoute>} />
            <Route path="manager/supervisors" element={<MobileProtectedRoute><MobileManagerRoute><ManagerSupervisors /></MobileManagerRoute></MobileProtectedRoute>} />
            <Route path="manager/reports" element={<MobileProtectedRoute><MobileManagerRoute><ManagerReports /></MobileManagerRoute></MobileProtectedRoute>} />
            <Route path="manager/profile" element={<MobileProtectedRoute><MobileManagerRoute><ManagerProfile /></MobileManagerRoute></MobileProtectedRoute>} />
            <Route path="manager/profile/change-password" element={<MobileProtectedRoute><MobileManagerRoute><EndUserProfileChangePassword /></MobileManagerRoute></MobileProtectedRoute>} />
            <Route path="manager/notifications" element={<MobileProtectedRoute><MobileManagerRoute><NotificationsScreen /></MobileManagerRoute></MobileProtectedRoute>} />
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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
