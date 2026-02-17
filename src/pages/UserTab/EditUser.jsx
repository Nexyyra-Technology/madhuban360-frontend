import { useParams, useNavigate } from "react-router-dom";
import { getUserById } from "./userService";
import { useEffect, useState } from "react";

/*
=====================================================
EDIT USER PAGE
=====================================================
*/

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getUserById(id);
      setUser(data);
    }
    load();
  }, [id]);

  if (!user) return null;

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">

      <h1 className="text-2xl font-semibold mb-6">
        Edit User: {user.name}
      </h1>

      <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">

        <input defaultValue={user.name} className="w-full border px-4 py-2 rounded-lg" />
        <input defaultValue={user.email} className="w-full border px-4 py-2 rounded-lg" />
        <input defaultValue={user.phone} className="w-full border px-4 py-2 rounded-lg" />

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-red-600"
          >
            Deactivate User
          </button>

          <button className="bg-[#1f2a44] text-white px-6 py-2 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
