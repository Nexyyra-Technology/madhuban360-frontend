import { useEffect, useState } from "react";
import { getUsers } from "./userService";
import AddUserModal from "./AddUserModal";
import DeleteUserModal from "./DeleteUserModal";
import { Link } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function refreshUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  useEffect(() => {
    async function load() {
      try {
        await refreshUsers();
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-[#1f2937]">
            User Management
          </h1>

          <span className="text-xs px-3 py-1 bg-gray-200 rounded-md text-gray-600 font-medium">
            {users.length} USERS TOTAL
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
        <input
          placeholder="Search by name, email or ID..."
          className="flex-1 px-4 py-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[#1f2a44]/20"
          onChange={(e) => console.log("Search:", e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-lg bg-white text-sm"
          onChange={(e) => console.log("Role filter:", e.target.value)}
        >
          <option>All Roles</option>
          <option>Admin</option>
          <option>Manager</option>
          <option>Supervisor</option>
          <option>Staff</option>
        </select>

        <select
          className="px-4 py-2 border rounded-lg bg-white text-sm"
          onChange={(e) => console.log("Status filter:", e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
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
            {users.map((user) => (
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
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.lastLogin || "-"}
                </td>

                <td className="px-6 py-4 text-right space-x-4">

                  <Link
                    to={`/users/${user._id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View
                  </Link>

                  <Link
                    to={`/users/edit/${user._id}`}
                    className="text-gray-600 hover:underline font-medium"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/users/role/${user._id}`}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Role
                  </Link>

                  <button
                    onClick={() => setDeleteId(user._id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-500 flex justify-between">
          <span>
            Showing 1–{users.length} of {users.length} results
          </span>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-md bg-white">
              1
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => refreshUsers()}
        />
      )}

      {deleteId && (
        <DeleteUserModal
          userId={deleteId}
          onClose={() => setDeleteId(null)}
          onSuccess={() => refreshUsers()}
        />
      )}
    </div>
  );
}
