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
    jobTitle: "",
    role: "Staff",
    preferredLanguage: "English (US)",
    facilities: [],
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
          jobTitle: data.jobTitle ?? "",
          role: data.role ?? "Staff",
          preferredLanguage: data.preferredLanguage ?? "English (US)",
          facilities: data.facilities ?? [],
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
      const updated = await updateUser(id, form);
      setUser(updated);
      navigate(`/users/${id}`);
    } catch (e) {
      setError(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  const initials = user.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 mb-6">← Back</button>

      <div className="bg-white rounded-xl p-8 shadow-sm space-y-8">
        {/* Header with Profile */}
        <div className="flex items-start gap-6 border-b pb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-semibold text-blue-600">
            {initials}
          </div>
          <div>
            <input
              value={form.name}
              onChange={setField("name")}
              className="text-2xl font-bold border-b-2 border-blue-500 outline-none"
            />
            <input
              value={form.jobTitle}
              onChange={setField("jobTitle")}
              placeholder="Job Title"
              className="text-sm text-gray-600 border-b border-gray-300 outline-none mt-1"
            />
            <div className="text-xs text-gray-500 mt-2">
              <p>{form.email}</p>
              <p>Last login: 2 hours ago</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <section>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Full Name</label>
              <input
                value={form.name}
                onChange={setField("name")}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Email Address</label>
              <input
                value={form.email}
                onChange={setField("email")}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Phone Number</label>
              <input
                value={form.phone}
                onChange={setField("phone")}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Job Title</label>
              <input
                value={form.jobTitle}
                onChange={setField("jobTitle")}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>
          </div>
        </section>

        {/* Account Configuration */}
        <section>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zm-7.487 7.48a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
            </svg>
            Account Configuration
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">User Role</label>
              <select
                value={form.role}
                onChange={setField("role")}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              >
                <option>Admin</option>
                <option>Manager</option>
                <option>Supervisor</option>
                <option>Staff</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Preferred Language</label>
              <select
                value={form.preferredLanguage}
                onChange={setField("preferredLanguage")}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              >
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {/* Footer */}
        <div className="flex justify-between items-center border-t pt-6">
          <button className="text-red-600 font-medium">Deactivate User</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1f2a44] text-white px-6 py-2 rounded-lg disabled:opacity-60 font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
