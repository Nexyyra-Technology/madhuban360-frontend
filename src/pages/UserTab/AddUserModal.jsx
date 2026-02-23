import { useState, useEffect } from "react";
import { createUser, getRoles, getDepartments, getManagers, getSupervisors } from "./userService";
import ModalWrapper from "./ModalWrapper";

function formatPhoneForPayload(val) {
  const digits = (val || "").replace(/\D/g, "").slice(0, 10);
  return digits.length === 10 ? digits : "";
}

export default function AddUserModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [department, setDepartment] = useState("");
  const [manager, setManager] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRoles()
      .then((list) => { if (!cancelled) setRoles(list || []); })
      .catch(() => { if (!cancelled) setRoles([]); })
      .finally(() => { if (!cancelled) setRolesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDepartments()
      .then((list) => { if (!cancelled) setDepartments(list || []); })
      .catch(() => { if (!cancelled) setDepartments([]); })
      .finally(() => { if (!cancelled) setDepartmentsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getManagers()
      .then((list) => { if (!cancelled) setManagers(list || []); })
      .catch(() => { if (!cancelled) setManagers([]); })
      .finally(() => { if (!cancelled) setManagersLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSupervisors()
      .then((list) => { if (!cancelled) setSupervisors(list || []); })
      .catch(() => { if (!cancelled) setSupervisors([]); })
      .finally(() => { if (!cancelled) setSupervisorsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  }

  async function handleSave() {
    setError("");
    const errors = [];
    if (!name.trim()) errors.push("Full name is required");
    if (!email.trim()) errors.push("Email address is required");
    if (!phone.trim()) errors.push("Phone number is required");
    else if (phone.replace(/\D/g, "").length !== 10) errors.push("Phone number must be 10 digits");
    if (!username.trim()) errors.push("Username is required");
    if (!password.trim()) errors.push("Password is required");
    if (!role) errors.push("System role is required");
    if (!department.trim()) errors.push("Department is required");

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    try {
      setSaving(true);
      const dept = department.trim();
      const roleLower = (role || "").toLowerCase();
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: formatPhoneForPayload(phone),
        username: username.trim(),
        password: password.trim(),
        role,
        status,
        department: dept,
        primaryDepartment: dept,
        jobTitle: dept || undefined,
        ...(roleLower === "staff" && manager && { supervisorId: Number(manager) || manager }),
        ...(roleLower === "supervisor" && manager && { managerId: Number(manager) || manager }),
      };

      await createUser(payload);
      onSuccess?.();
      onClose?.();
    } catch (e) {
      const msg = e?.message || "Failed to create user";
      setError(msg.replace(/Primary department is required/i, "Department is required"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalWrapper widthClass="w-[640px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Add New User</h2>
          <p className="text-sm text-gray-500">Create a new system account and define access.</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="border-t border-dotted border-gray-300 my-6" />

      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-medium mb-3">Personal Information</h3>

          <div className="grid grid-cols-1 gap-3">
            <label className="text-xs text-gray-600">Full Name <span className="text-red-600">*</span></label>
            <input
              placeholder="e.g. Robert Fox"
              className="w-full border px-4 py-2 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Email Address <span className="text-red-600">*</span></label>
                <input
                  type="email"
                  placeholder="robert.f@company.com"
                  className="w-full border px-4 py-2 rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Phone Number <span className="text-red-600">*</span></label>
                <input
                  placeholder="1234567890"
                  className="w-full border px-4 py-2 rounded-lg"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Username <span className="text-red-600">*</span></label>
                <input
                  placeholder="e.g. robert.fox"
                  className="w-full border px-4 py-2 rounded-lg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Password <span className="text-red-600">*</span></label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border px-4 py-2 rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Username and password will be used for login.</p>
        </section>

        <div className="border-t border-dotted border-gray-200" />

        <section>
          <h3 className="text-sm font-medium mb-3">Account Configuration</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">System Role <span className="text-red-600">*</span></label>
              <select
                className="w-full border px-3 py-2 rounded-lg"
                value={role}
                onChange={(e) => {
                  const v = e.target.value;
                  setRole(v);
                  const r = (v || "").toLowerCase();
                  if (r !== "staff" && r !== "supervisor") setManager("");
                }}
                disabled={rolesLoading}
              >
                <option value="">Select a role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Initial Status</label>
              <select
                className="w-full border px-3 py-2 rounded-lg"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Department</label>
              <select
                className="w-full border px-3 py-2 rounded-lg"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={departmentsLoading}
              >
                <option value="">Select department</option>
                {departments
                  .filter((d) => (d.name ?? "").trim())
                  .map((d) => {
                    const name = (d.name ?? "").trim();
                    return (
                      <option key={d.id} value={name}>
                        {name}
                      </option>
                    );
                  })}
              </select>
            </div>

            {(() => {
              const r = (role || "").toLowerCase();
              if (r === "staff")
                return (
                  <div>
                    <label className="text-xs text-gray-600">Supervisor</label>
                    <select
                      className="w-full border px-3 py-2 rounded-lg"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      disabled={supervisorsLoading}
                    >
                      <option value="">Select supervisor</option>
                      {supervisors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name ?? `Supervisor ${s.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              if (r === "supervisor")
                return (
                  <div>
                    <label className="text-xs text-gray-600">Manager</label>
                    <select
                      className="w-full border px-3 py-2 rounded-lg"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      disabled={managersLoading}
                    >
                      <option value="">Select manager</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              return null;
            })()}
          </div>
        </section>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-[#1f2a44] text-white rounded-lg disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save User"}
        </button>
      </div>
    </ModalWrapper>
  );
}
