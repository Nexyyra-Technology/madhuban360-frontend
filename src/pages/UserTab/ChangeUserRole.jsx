import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "./userService";
import ModalWrapper from "./ModalWrapper";

export default function ChangeUserRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getUserById(id);
      if (data) {
        setUser(data);
        setSelectedRole(data.role || "");
      }
    }
    load();
  }, [id]);

  const roles = [
    { id: "Admin", name: "Admin", desc: "Full system access, billing management, data exports, and user management." },
    { id: "Manager", name: "Manager", desc: "View analytics reports and manage permissions for assigned team members only." },
    { id: "Supervisor", name: "Supervisor", desc: "Read-only access to dashboards, reports, and shared content. Cannot edit settings." },
    { id: "Staff", name: "Staff", desc: "Basic user access with limited permissions. Can view assigned tasks and reports." },
  ];

  const handleSubmit = async () => {
    if (!selectedRole || !user || selectedRole === user.role) return;

    try {
      setUpdating(true);
      await updateUser(id, { role: selectedRole });
      navigate(`/users/${id}`);
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <ModalWrapper widthClass="w-[640px]">
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-2">Change User Role</h2>
        <p className="text-sm text-gray-600 mb-6">
          <span className="font-medium">{user.name}</span> • Current Role: <span className="font-medium">{user.role}</span>
        </p>

        <h3 className="text-sm font-medium mb-4 uppercase text-gray-700">SELECT NEW PERMISSIONS</h3>

        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <label
              key={role.id}
              className={`flex items-start gap-3 border-2 p-4 rounded-lg cursor-pointer transition ${
                selectedRole === role.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.id}
                checked={selectedRole === role.id}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">{role.name}</p>
                <p className="text-xs text-gray-600 mt-1">{role.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs font-medium text-yellow-800">SESSION UPDATE REQUIRED</p>
              <p className="text-xs text-yellow-700 mt-1">Changing this user's role will invalidate their current session. They will need to log in again to see updated permissions.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg text-gray-700 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedRole || selectedRole === user.role || updating}
            className="px-6 py-2 bg-[#1f2a44] text-white rounded-lg font-medium disabled:opacity-60"
          >
            {updating ? "Updating..." : "Update User Role"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
