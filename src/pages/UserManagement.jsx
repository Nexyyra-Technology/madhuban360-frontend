import { useEffect, useState } from "react";

/*
========================================================
USER MANAGEMENT – ENTERPRISE READY
Includes:
✔ Fetch users
✔ Add user modal
✔ Edit user modal
✔ Delete confirmation modal
✔ Backend ready integration comments
========================================================
*/

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Staff",
    status: "Active",
  });

  /* ==================================================
     FETCH USERS FROM BACKEND
     Replace mock with real API
  ================================================== */
  useEffect(() => {
    async function fetchUsers() {
      try {
        // 🔹 Replace with real API
        // const res = await fetch("/api/users");
        // const data = await res.json();
        // setUsers(data);

        const mockUsers = [
          {
            id: 1,
            name: "Johnathan Doe",
            email: "j.doe@facilitymanagement.com",
            role: "Admin",
            status: "Active",
            lastLogin: "2 hours ago",
          },
          {
            id: 2,
            name: "Sarah Chen",
            email: "s.chen@facilitymanagement.com",
            role: "Manager",
            status: "Active",
            lastLogin: "5 mins ago",
          },
        ];

        setTimeout(() => {
          setUsers(mockUsers);
          setLoading(false);
        }, 400);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  /* ==================================================
     HANDLE FORM CHANGE
  ================================================== */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ==================================================
     ADD USER (Backend Ready)
  ================================================== */
  const handleAddUser = async () => {
    try {
      // 🔹 Replace with backend POST
      // await fetch("/api/users", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      setUsers([...users, { ...formData, id: Date.now(), lastLogin: "-" }]);
      setShowAddModal(false);
      setFormData({ name: "", email: "", role: "Staff", status: "Active" });
    } catch (err) {
      console.error(err);
    }
  };

  /* ==================================================
     EDIT USER (Backend Ready)
  ================================================== */
  const handleEditUser = async () => {
    try {
      // 🔹 Replace with backend PUT
      // await fetch(`/api/users/${selectedUser.id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      const updated = users.map((u) =>
        u.id === selectedUser.id ? { ...u, ...formData } : u
      );

      setUsers(updated);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  /* ==================================================
     DELETE USER (Backend Ready)
  ================================================== */
  const handleDeleteUser = async () => {
    try {
      // 🔹 Replace with backend DELETE
      // await fetch(`/api/users/${selectedUser.id}`, {
      //   method: "DELETE",
      // });

      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const statusStyle = (status) =>
    status === "Active"
      ? "bg-green-50 text-green-700 border border-green-200"
      : "bg-red-50 text-red-700 border border-red-200";

  return (
    <div className="p-8">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#1f2a44] text-white px-5 py-2 rounded-lg font-semibold"
        >
          + Add New User
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${statusStyle(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setFormData(user);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <Modal title="Add New User" onClose={() => setShowAddModal(false)}>
          <UserForm
            formData={formData}
            handleChange={handleChange}
            onSubmit={handleAddUser}
          />
        </Modal>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <Modal title="Edit User" onClose={() => setShowEditModal(false)}>
          <UserForm
            formData={formData}
            handleChange={handleChange}
            onSubmit={handleEditUser}
          />
        </Modal>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <Modal title="Delete User" onClose={() => setShowDeleteModal(false)}>
          <p className="mb-6">
            Are you sure you want to delete{" "}
            <strong>{selectedUser?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==================================================
   REUSABLE MODAL COMPONENT
================================================== */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ==================================================
   USER FORM COMPONENT
================================================== */
function UserForm({ formData, handleChange, onSubmit }) {
  return (
    <>
      <div className="space-y-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border px-4 py-2 rounded"
        />

        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border px-4 py-2 rounded"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        >
          <option>Admin</option>
          <option>Manager</option>
          <option>Supervisor</option>
          <option>Staff</option>
        </select>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        >
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="px-4 py-2 border rounded">Cancel</button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-[#1f2a44] text-white rounded"
        >
          Save
        </button>
      </div>
    </>
  );
}
