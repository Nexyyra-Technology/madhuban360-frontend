import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
<<<<<<< HEAD

/* ================= USER MODULE ================= */
import UserManagement from "./pages/UserTab/UserManagement";
import UserSummary from "./pages/UserTab/UserSummary";
import EditUser from "./pages/UserTab/EditUser";
import ChangeUserRole from "./pages/UserTab/ChangeUserRole";

/* ================= OTHER MODULES ================= */
=======
import UserManagement from "./pages/UserManagement";
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
import PropertyManagement from "./pages/PropertyManagement";
import TaskManager from "./pages/TaskManager";
import HRMS from "./pages/HRMS";
import SalesAndLease from "./pages/SalesAndLease";
import FacilityManagement from "./pages/FacilityManagement";
import Legal from "./pages/Legal";
import Accounts from "./pages/Accounts";
import Store from "./pages/Store";
import Reports from "./pages/Reports";

<<<<<<< HEAD
/*
=========================================================
APP ROUTING STRUCTURE (Enterprise Clean Pattern)
Layout wraps all protected pages
User Module fully wired:
- List
- Summary
- Edit
- Change Role
=========================================================
*/

=======
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
export default function App() {
  return (
    <Layout>
      <Routes>
<<<<<<< HEAD

        {/* ================= DASHBOARD ================= */}
        <Route path="/" element={<Dashboard />} />

        {/* ================= USER MODULE ================= */}
        <Route path="/users" element={<UserManagement />} />

        {/* User Summary Page */}
        <Route path="/users/:id" element={<UserSummary />} />

        {/* Edit User Page */}
        <Route path="/users/edit/:id" element={<EditUser />} />

        {/* Change Role Page */}
        <Route
          path="/users/change-role/:id"
          element={<ChangeUserRole />}
        />

        {/* ================= OTHER MODULES ================= */}
=======
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UserManagement />} />
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
        <Route path="/properties" element={<PropertyManagement />} />
        <Route path="/tasks" element={<TaskManager />} />
        <Route path="/hrms" element={<HRMS />} />
        <Route path="/sales" element={<SalesAndLease />} />
        <Route path="/facility" element={<FacilityManagement />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/store" element={<Store />} />
        <Route path="/reports" element={<Reports />} />
<<<<<<< HEAD

=======
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
      </Routes>
    </Layout>
  );
}
