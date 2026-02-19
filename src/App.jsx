import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";

import Dashboard from "./pages/DashboardTab/Dashboard";
import UserManagement from "./pages/UserTab/UserManagement";
import UserSummary from "./pages/UserTab/UserSummary";
import EditUser from "./pages/UserTab/EditUser";
import ChangeUserRole from "./pages/UserTab/ChangeUserRole";
import PropertyManagement from "./pages/PropertyTab/PropertyManagement";
import TaskManager from "./pages/TaskManager";
import HRMS from "./pages/HRMS";
import SalesAndLease from "./pages/SalesAndLease";
import FacilityManagement from "./pages/FacilityManagement";
import Legal from "./pages/Legal";
import Accounts from "./pages/Accounts";
import Store from "./pages/Store";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/users" element={<UserManagement />} />

        <Route path="/users/edit/:id" element={<EditUser />} />

        <Route path="/users/role/:id" element={<ChangeUserRole />} />

        <Route path="/users/:id" element={<UserSummary />} />

        <Route path="/properties" element={<PropertyManagement />} />
        <Route path="/tasks" element={<TaskManager />} />
        <Route path="/hrms" element={<HRMS />} />
        <Route path="/sales" element={<SalesAndLease />} />
        <Route path="/facility" element={<FacilityManagement />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/store" element={<Store />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  );
}
