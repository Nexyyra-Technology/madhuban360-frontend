import { useEffect, useState } from "react";
import { getUsers, exportUsersToExcel } from "./userService";
import AddUserModal from "./AddUserModal";
import DeleteUserModal from "./DeleteUserModal";
import { Link } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter((user) => {
    if (!user) return false;
    const userRole = String(user.role || "").trim();
    const userStatus = String(user.status || "").trim();
    if (roleFilter && userRole.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (statusFilter && userStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const name = String(user.name || "").toLowerCase();
    const email = String(user.email || "").toLowerCase();
    const id = String(user._id || "").toLowerCase();
    return name.includes(q) || email.includes(q) || id.includes(q);
  });

  async function refreshUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-[#1f2937]">
            User Management
          </h1>

          <span className="text-xs px-3 py-1 bg-gray-200 rounded-md text-gray-600 font-medium">
            {safeUsers.length} USERS TOTAL
          </span>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#1f2a44] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          + Add New User
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400 pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[#1f2a44]/20"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white text-sm"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Staff">Staff</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white text-sm"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Deleted">Deleted</option>
        </select>

        <button
          onClick={() => exportUsersToExcel(filteredUsers).catch((err) => console.error("Export failed:", err))}
          title="Export to Excel"
          className="p-2 border rounded-lg bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
        >
          <span className="material-symbols-outlined text-[22px]">download</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading users...</div>
        ) : (
        <>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">User Profile</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </td>

                <td className="px-6 py-4 text-gray-700 font-medium">
                  {user.role}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      user.status === "Active"
                        ? "bg-green-50 text-green-600 border border-green-100"
                        : user.status === "Deleted"
                          ? "bg-gray-100 text-gray-600 border border-gray-200"
                          : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.lastLogin || "-"}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/users/${user._id}`}
                      title="View"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </Link>
                    <Link
                      to={`/users/edit/${user._id}`}
                      title="Edit"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </Link>
                    <Link
                      to={`/users/role/${user._id}`}
                      title="Change role"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                    </Link>
                    <button
                      onClick={() => setDeleteUser(user)}
                      title="Delete"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-500 flex justify-between">
          <span>
            {filteredUsers.length === 0
              ? "No results"
              : `Showing 1–${filteredUsers.length} of ${safeUsers.length} results`}
          </span>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-md bg-white">
              1
            </button>
          </div>
        </div>
        </>
        )}
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => refreshUsers()}
        />
      )}

      {deleteUser && (
        <DeleteUserModal
          userId={deleteUser._id}
          userName={deleteUser.name}
          userEmail={deleteUser.email}
          onClose={() => setDeleteUser(null)}
          onSuccess={() => refreshUsers()}
        />
      )}
    </div>
  );
}
