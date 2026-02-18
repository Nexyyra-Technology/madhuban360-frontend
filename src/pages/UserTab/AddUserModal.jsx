import { useState } from "react";
import { createUser } from "./userService";
import ModalWrapper from "./ModalWrapper";

export default function AddUserModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [department, setDepartment] = useState("");
  const [facilityInput, setFacilityInput] = useState("");
  const [assignedFacilities, setAssignedFacilities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!role) {
      setError("Please select a system role.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        status,
        department: department.trim(),
        facilities: assignedFacilities,
      };

      const created = await createUser(payload);
      onSuccess?.(created);
      onClose?.();
    } catch (e) {
      setError(e?.message || "Failed to create user");
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
                  placeholder="robert.f@company.com"
                  className="w-full border px-4 py-2 rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Phone Number</label>
                <input
                  placeholder="+1 (555) 000-0000"
                  className="w-full border px-4 py-2 rounded-lg"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
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
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select a role</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>Supervisor</option>
                <option>Staff</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Initial Status</label>
              <select
                className="w-full border px-3 py-2 rounded-lg"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Active</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2">User will receive an email invitation to set their initial password.</p>
        </section>

        <div className="border-t border-dotted border-gray-200" />

        <section>
          <h3 className="text-sm font-medium mb-3">Facility Assignment</h3>

          <div className="grid grid-cols-1 gap-3">
            <label className="text-xs text-gray-600">Primary Department</label>
            <input
              placeholder="e.g. Maintenance, Operations"
              className="w-full border px-4 py-2 rounded-lg"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            <label className="text-xs text-gray-600">Assigned Facilities</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {assignedFacilities.map((f) => (
                <span key={f} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
                  {f}
                  <button onClick={() => setAssignedFacilities((s) => s.filter(x => x !== f))} className="text-xs text-gray-500">✕</button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Search facilities..."
                className="flex-1 border px-4 py-2 rounded-lg"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = facilityInput.trim();
                    if (val && !assignedFacilities.includes(val)) {
                      setAssignedFacilities((s) => [...s, val]);
                      setFacilityInput("");
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const val = facilityInput.trim();
                  if (val && !assignedFacilities.includes(val)) {
                    setAssignedFacilities((s) => [...s, val]);
                    setFacilityInput("");
                  }
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </section>
      </div>

      {error ? (
        <p className="text-sm text-red-600 mt-4">{error}</p>
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
