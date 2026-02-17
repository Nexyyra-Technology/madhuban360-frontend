/*
=====================================================
ADD USER MODAL
Replace submit handler with backend API
=====================================================
*/

import { useState } from "react";
import { createUser } from "./userService";

export default function AddUserModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSaving(true);
      const created = await createUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      onSuccess?.(created);
      onClose?.();
    } catch (e) {
      setError(e?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] rounded-xl p-8 shadow-xl">

        <h2 className="text-lg font-semibold mb-6">Add New User</h2>

        <div className="space-y-4">
          <input
            placeholder="Full Name"
            className="w-full border px-4 py-2 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email Address"
            className="w-full border px-4 py-2 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Phone Number"
            className="w-full border px-4 py-2 rounded-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600 mt-4">{error}</p>
        ) : null}

        <div className="flex justify-end gap-3 mt-8">
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
      </div>
    </div>
  );
}
