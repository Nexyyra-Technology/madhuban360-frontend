import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "./userService";
import { useEffect, useState } from "react";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    status: "Active",
    jobTitle: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      const data = await getUserById(id);
      setUser(data);
      if (data) {
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          role: data.role ?? "Staff",
          status: data.status ?? "Active",
          jobTitle: data.jobTitle ?? "",
        });
      }
    }
    load();
  }, [id]);

  if (!user) return null;

  function setField(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateUser(id, {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        jobTitle: form.jobTitle.trim(),
      });
      setUser(updated);
      navigate(`/users/${id}`);
    } catch (e) {
      setError(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">

      <h1 className="text-2xl font-semibold mb-6">
        Edit User: {user.name}
      </h1>

      <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">

        <input
          value={form.name}
          onChange={setField("name")}
          placeholder="Full Name"
          className="w-full border px-4 py-2 rounded-lg"
        />
        <input
          value={form.email}
          onChange={setField("email")}
          placeholder="Email Address"
          className="w-full border px-4 py-2 rounded-lg"
        />
        <input
          value={form.phone}
          onChange={setField("phone")}
          placeholder="Phone Number"
          className="w-full border px-4 py-2 rounded-lg"
        />

        <input
          value={form.jobTitle}
          onChange={setField("jobTitle")}
          placeholder="Job Title"
          className="w-full border px-4 py-2 rounded-lg"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={form.role}
            onChange={setField("role")}
            className="w-full border px-4 py-2 rounded-lg bg-white"
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Staff">Staff</option>
          </select>

          <select
            value={form.status}
            onChange={setField("status")}
            className="w-full border px-4 py-2 rounded-lg bg-white"
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-red-600"
          >
            Deactivate User
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1f2a44] text-white px-6 py-2 rounded-lg disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
